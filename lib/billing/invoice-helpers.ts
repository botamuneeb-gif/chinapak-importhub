import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/lib/supabase/types";

type AdminSupabase = SupabaseClient<Database>;
type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
type JsonObject = { [key: string]: Json | undefined };

type BillingResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

type InvoiceBundle = {
  invoice: TableRow<"invoices">;
  payment: TableRow<"payments"> | null;
};

const MANUAL_PAYMENT_INSTRUCTIONS = [
  "Submit a bank transfer, Easypaisa, JazzCash, or local representative payment reference for admin verification.",
  "No FMS sourcing work starts until payment is verified and admin review is approved.",
  "Do not pay unofficial personal accounts or numbers outside ChinaPak ImportHub approved workflow.",
];

function codeSuffix() {
  const timestampPart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);

  return `${timestampPart}${randomPart}`;
}

export function generateInvoiceCode() {
  return `INV-${new Date().getFullYear()}-${codeSuffix()}`;
}

export function generateRefundCode() {
  return `REF-${new Date().getFullYear()}-${codeSuffix()}`;
}

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function addonAmount(
  addon: Pick<
    TableRow<"addons">,
    "percentage_rate" | "price_min_pkr" | "price_type"
  >,
  packagePrice: number,
) {
  if (addon.percentage_rate !== null) {
    return Math.round((packagePrice * addon.percentage_rate) / 100);
  }

  return addon.price_min_pkr ?? 0;
}

async function ensurePaymentRecordForInvoice(
  supabase: AdminSupabase,
  invoice: TableRow<"invoices">,
  actorUserId: string | null,
): Promise<BillingResult<TableRow<"payments">>> {
  const { data: existingPayment, error: existingPaymentError } = await supabase
    .from("payments")
    .select("*")
    .eq("invoice_id", invoice.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingPaymentError) {
    return { ok: false, message: existingPaymentError.message };
  }

  if (existingPayment) {
    return { ok: true, data: existingPayment };
  }

  const { data: payment, error: paymentError } = await supabase
    .from("payments")
    .insert({
      amount_pkr: invoice.total_pkr,
      created_by: actorUserId,
      invoice_id: invoice.id,
      method: "manual_offline_pending",
      payment_status: "awaiting_payment",
      project_id: invoice.project_id,
      provider: "manual_offline",
      metadata: {
        phase: "phase_10_invoice_payment_refund_workflow",
        payment_gateway_status: "not_connected",
        instructions: MANUAL_PAYMENT_INSTRUCTIONS,
      },
    })
    .select("*")
    .single();

  if (paymentError || !payment) {
    return {
      ok: false,
      message:
        paymentError?.message ?? "Awaiting payment record could not be created.",
    };
  }

  return { ok: true, data: payment };
}

export async function ensureInvoiceForProject(
  supabase: AdminSupabase,
  projectId: string,
  actorUserId: string | null,
): Promise<BillingResult<InvoiceBundle>> {
  const { data: existingInvoice, error: existingInvoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existingInvoiceError) {
    return { ok: false, message: existingInvoiceError.message };
  }

  if (existingInvoice) {
    const payment = await ensurePaymentRecordForInvoice(
      supabase,
      existingInvoice,
      actorUserId,
    );

    return {
      ok: true,
      data: {
        invoice: existingInvoice,
        payment: payment.ok ? payment.data : null,
      },
    };
  }

  const { data: project, error: projectError } = await supabase
    .from("import_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (projectError || !project) {
    return {
      ok: false,
      message: projectError?.message ?? "Import Project was not found.",
    };
  }

  if (!project.package_id) {
    return {
      ok: false,
      message: "Project has no package selected, so an invoice cannot be built.",
    };
  }

  const [{ data: packageRow, error: packageError }, { data: selectedAddons }] =
    await Promise.all([
      supabase.from("packages").select("*").eq("id", project.package_id).single(),
      supabase
        .from("import_project_addons")
        .select("*")
        .eq("project_id", project.id),
    ]);

  if (packageError || !packageRow) {
    return {
      ok: false,
      message:
        packageError?.message ?? "Selected package could not be loaded.",
    };
  }

  const addonIds = (selectedAddons ?? []).map((addon) => addon.addon_id);
  const { data: addonRows, error: addonError } =
    addonIds.length > 0
      ? await supabase.from("addons").select("*").in("id", addonIds)
      : { data: [], error: null };

  if (addonError) {
    return { ok: false, message: addonError.message };
  }

  const addonMap = new Map((addonRows ?? []).map((addon) => [addon.id, addon]));
  const addonLineItems = (selectedAddons ?? []).map((selected) => {
    const addon = addonMap.get(selected.addon_id);
    const unitPrice =
      selected.price_snapshot_pkr ??
      (addon ? addonAmount(addon, packageRow.price_pkr) : 0);

    return {
      addon,
      selected,
      total: unitPrice,
      unitPrice,
    };
  });
  const addonTotal = addonLineItems.reduce((total, item) => total + item.total, 0);
  const subtotal = packageRow.price_pkr + addonTotal;
  const invoiceCode = generateInvoiceCode();
  const now = new Date();
  const dueAt = new Date(now);
  dueAt.setDate(dueAt.getDate() + 7);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      created_by: actorUserId,
      customer_user_id: project.importer_user_id,
      document_id: `DOC-${invoiceCode}`,
      due_at: dueAt.toISOString(),
      invoice_code: invoiceCode,
      issued_at: now.toISOString(),
      metadata: {
        instructions: MANUAL_PAYMENT_INSTRUCTIONS,
        package_code: packageRow.package_code,
        payment_gateway_status: "not_connected",
        phase: "phase_10_invoice_payment_refund_workflow",
        project_code: project.project_code,
      },
      project_id: project.id,
      status: "awaiting_payment",
      subtotal_pkr: subtotal,
      total_pkr: subtotal,
    })
    .select("*")
    .single();

  if (invoiceError || !invoice) {
    return {
      ok: false,
      message: invoiceError?.message ?? "Invoice could not be created.",
    };
  }

  const lineItems: Array<
    Database["public"]["Tables"]["invoice_line_items"]["Insert"]
  > = [
    {
      created_by: actorUserId,
      description: packageRow.name,
      invoice_id: invoice.id,
      item_type: "package",
      metadata: {
        delivery_days_max: packageRow.delivery_days_max,
        delivery_days_min: packageRow.delivery_days_min,
        package_code: packageRow.package_code,
      },
      package_id: packageRow.id,
      quantity: 1,
      total_pkr: packageRow.price_pkr,
      unit_price_pkr: packageRow.price_pkr,
    },
    ...addonLineItems.map(({ addon, selected, total, unitPrice }) => ({
      addon_id: selected.addon_id,
      created_by: actorUserId,
      description: addon?.name ?? "Selected add-on",
      invoice_id: invoice.id,
      item_type: "addon",
      metadata: {
        addon_code: addon?.addon_code ?? null,
        price_type: addon?.price_type ?? null,
      },
      quantity: 1,
      total_pkr: total,
      unit_price_pkr: unitPrice,
    })),
  ];

  const { error: lineItemsError } = await supabase
    .from("invoice_line_items")
    .insert(lineItems);

  if (lineItemsError) {
    return { ok: false, message: lineItemsError.message };
  }

  const payment = await ensurePaymentRecordForInvoice(
    supabase,
    invoice,
    actorUserId,
  );

  if (!payment.ok) {
    return payment;
  }

  await supabase.from("import_project_timeline_events").insert({
    body: "Invoice and manual payment tracking were prepared. FMS work remains blocked until payment is verified and admin review is approved.",
    created_by: actorUserId,
    event_type: "invoice_created",
    metadata: {
      invoice_code: invoice.invoice_code,
      invoice_id: invoice.id,
      total_pkr: invoice.total_pkr,
    },
    project_id: project.id,
    title: "Invoice created for Import Project",
    visible_to_agent: false,
    visible_to_fms: false,
    visible_to_importer: true,
  });

  return {
    ok: true,
    data: {
      invoice,
      payment: payment.data,
    },
  };
}

export function mergeMetadata(
  value: Json | null | undefined,
  patch: JsonObject,
) {
  return {
    ...toJsonObject(value),
    ...patch,
  };
}

