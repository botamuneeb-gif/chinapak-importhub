import type { AddOnService, PricingPackage } from "@/config/pricing";
import { addOnServices, pricingPackages } from "@/config/pricing";

export type PaymentStatus =
  | "Awaiting Payment"
  | "Paid"
  | "Failed"
  | "Refunded"
  | "Partially Refunded";

export type InvoiceStatus =
  | "Draft"
  | "Pending"
  | "Paid"
  | "Refunded"
  | "Partially Refunded"
  | "Cancelled";

export type PaymentMethod = {
  id: string;
  name: string;
  status: string;
  note: string;
};

export type InvoiceLineItem = {
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
};

export type InvoiceRecord = {
  invoiceId: string;
  documentId: string;
  projectId: string;
  packageName: string;
  amount: string;
  status: InvoiceStatus;
  issueDate: string;
  dueOrPaidDate: string;
  companyDetailsPlaceholder: string[];
  customerDetailsPlaceholder: string[];
  lineItems: InvoiceLineItem[];
  subtotal: string;
  discountPlaceholder: string;
  taxPlaceholder: string;
  totalPaidOrDue: string;
  paymentMethod: string;
  transactionReferencePlaceholder: string;
  legalRefundNote: string;
  supportContactPlaceholder: string;
};

export const paymentStatusCards: Array<{
  status: PaymentStatus;
  detail: string;
}> = [
  {
    status: "Awaiting Payment",
    detail: "Project is saved, but FMS work cannot begin.",
  },
  {
    status: "Paid",
    detail: "Project can move to admin review before FMS assignment.",
  },
  {
    status: "Failed",
    detail: "Importer can retry or request manual payment help.",
  },
  {
    status: "Refunded",
    detail: "Full refund has been recorded in placeholder data.",
  },
  {
    status: "Partially Refunded",
    detail: "Admin-reviewed milestone refund placeholder.",
  },
];

export const paymentMethods: PaymentMethod[] = [
  {
    id: "bank-transfer",
    name: "Bank Transfer",
    status: "Manual verification placeholder",
    note: "Bank transfer proof will later be verified by admin.",
  },
  {
    id: "easypaisa",
    name: "Easypaisa",
    status: "Gateway future",
    note: "Local mobile wallet flow placeholder.",
  },
  {
    id: "jazzcash",
    name: "JazzCash",
    status: "Gateway future",
    note: "Local mobile wallet flow placeholder.",
  },
  {
    id: "card",
    name: "Debit/Credit Card Future",
    status: "Future gateway",
    note: "Card payment integration is not connected yet.",
  },
];

export const checkoutSummary: {
  projectId: string;
  selectedPackage: PricingPackage;
  selectedAddOns: AddOnService[];
  subtotal: string;
  estimatedTotal: string;
} = {
  projectId: "CPH-2026-0010",
  selectedPackage: pricingPackages[1],
  selectedAddOns: [addOnServices[0], addOnServices[4]],
  subtotal: "PKR 52,000",
  estimatedTotal: "PKR 52,000",
};

export const invoices: InvoiceRecord[] = [
  {
    invoiceId: "INV-2026-0007",
    documentId: "DOC-INV-CPH-0007-A",
    projectId: "CPH-2026-0007",
    packageName: "Factory Match Plus",
    amount: "PKR 40,000",
    status: "Paid",
    issueDate: "2026-06-29",
    dueOrPaidDate: "Paid 2026-06-29",
    companyDetailsPlaceholder: [
      "ChinaPak ImportHub",
      "chinapakimporthub.com",
      "Company registration placeholder",
      "Official address placeholder",
    ],
    customerDetailsPlaceholder: [
      "Importer name: Ahmed Traders placeholder",
      "City: Lahore",
      "Customer phone hidden in document placeholder",
    ],
    lineItems: [
      {
        description: "Factory Match Plus package",
        quantity: 1,
        unitPrice: "PKR 35,000",
        total: "PKR 35,000",
      },
      {
        description: "AI Trade Translation add-on",
        quantity: 1,
        unitPrice: "PKR 5,000",
        total: "PKR 5,000",
      },
    ],
    subtotal: "PKR 40,000",
    discountPlaceholder: "PKR 0",
    taxPlaceholder: "PKR 0 placeholder",
    totalPaidOrDue: "PKR 40,000 paid",
    paymentMethod: "Bank Transfer placeholder",
    transactionReferencePlaceholder: "TXN-PLACEHOLDER-0007",
    legalRefundNote:
      "Full refund is available before FMS assignment. After FMS assignment, refund requests are reviewed by admin based on completed milestones.",
    supportContactPlaceholder: "support@chinapakimporthub.com placeholder",
  },
  {
    invoiceId: "INV-2026-0008",
    documentId: "DOC-INV-CPH-0008-A",
    projectId: "CPH-2026-0008",
    packageName: "Import Partner",
    amount: "PKR 87,000",
    status: "Pending",
    issueDate: "2026-06-29",
    dueOrPaidDate: "Due on receipt",
    companyDetailsPlaceholder: [
      "ChinaPak ImportHub",
      "chinapakimporthub.com",
      "Company registration placeholder",
      "Official address placeholder",
    ],
    customerDetailsPlaceholder: [
      "Importer name: Bright Mobile Accessories placeholder",
      "City: Karachi",
      "Customer phone hidden in document placeholder",
    ],
    lineItems: [
      {
        description: "Import Partner package",
        quantity: 1,
        unitPrice: "PKR 75,000",
        total: "PKR 75,000",
      },
      {
        description: "Supplier Background Check",
        quantity: 1,
        unitPrice: "PKR 12,000",
        total: "PKR 12,000",
      },
    ],
    subtotal: "PKR 87,000",
    discountPlaceholder: "PKR 0",
    taxPlaceholder: "PKR 0 placeholder",
    totalPaidOrDue: "PKR 87,000 due",
    paymentMethod: "Awaiting payment",
    transactionReferencePlaceholder: "Pending",
    legalRefundNote:
      "No FMS work begins until payment is completed and admin review is done.",
    supportContactPlaceholder: "payments@chinapakimporthub.com placeholder",
  },
  {
    invoiceId: "INV-2026-0009",
    documentId: "DOC-INV-CPH-0009-A",
    projectId: "CPH-2026-0009",
    packageName: "Factory Discovery",
    amount: "PKR 18,000",
    status: "Refunded",
    issueDate: "2026-06-28",
    dueOrPaidDate: "Refunded 2026-06-29",
    companyDetailsPlaceholder: [
      "ChinaPak ImportHub",
      "chinapakimporthub.com",
      "Company registration placeholder",
      "Official address placeholder",
    ],
    customerDetailsPlaceholder: [
      "Importer name: New Importer placeholder",
      "City: Faisalabad",
      "Customer phone hidden in document placeholder",
    ],
    lineItems: [
      {
        description: "Factory Discovery package",
        quantity: 1,
        unitPrice: "PKR 18,000",
        total: "PKR 18,000",
      },
    ],
    subtotal: "PKR 18,000",
    discountPlaceholder: "PKR 0",
    taxPlaceholder: "PKR 0 placeholder",
    totalPaidOrDue: "PKR 18,000 refunded",
    paymentMethod: "Manual refund placeholder",
    transactionReferencePlaceholder: "RFND-PLACEHOLDER-0009",
    legalRefundNote:
      "Refund completed before FMS assignment in placeholder data.",
    supportContactPlaceholder: "refunds@chinapakimporthub.com placeholder",
  },
];

export const failedPaymentReasons = [
  "Bank declined",
  "Gateway timeout",
  "Wrong details",
  "Network issue",
  "Payment limit",
] as const;

export const refundStatuses = [
  "Request submitted placeholder",
  "Admin review pending",
  "FMS assignment check",
  "Milestone review if assigned",
  "Refund, reassignment, or support decision placeholder",
] as const;

export function getInvoiceById(invoiceId: string) {
  return invoices.find((invoice) => invoice.invoiceId === invoiceId);
}
