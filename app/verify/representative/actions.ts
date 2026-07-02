"use server";

import { headers } from "next/headers";
import {
  formatRepresentativeStatus,
  isRepresentativeCodeFormat,
  normalizeRepresentativeCode,
} from "@/lib/representatives/codes";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/types";

type VerificationResult =
  Database["public"]["Enums"]["representative_verification_result"];

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export type PublicRepresentativeVerificationResult = {
  checkedAt: string;
  city: string;
  code: string;
  displayName: string;
  message: string;
  province: string;
  publicNotes: string;
  result: VerificationResult;
  roleTitle: string;
  serviceArea: string;
  statusLabel: string;
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(value);
}

async function getUserAgent() {
  try {
    const headerStore = await headers();
    return headerStore.get("user-agent")?.slice(0, 500) ?? null;
  } catch {
    return null;
  }
}

function safeResult(
  result: VerificationResult,
  code: string,
  message: string,
): PublicRepresentativeVerificationResult {
  return {
    checkedAt: formatDateTime(new Date()),
    city: "",
    code,
    displayName: "",
    message,
    province: "",
    publicNotes: "",
    result,
    roleTitle: "",
    serviceArea: "",
    statusLabel: formatRepresentativeStatus(result),
  };
}

export async function verifyRepresentativeCodeAction(
  codeInput: string,
): Promise<ActionResult<PublicRepresentativeVerificationResult>> {
  try {
    const normalizedCode = normalizeRepresentativeCode(codeInput);
    const supabase = createAdminSupabaseClient();

    if (!isRepresentativeCodeFormat(normalizedCode)) {
      await supabase.from("representative_verification_attempts").insert({
        matched_representative_id: null,
        metadata: {
          source: "public_representative_verification_page",
          rejected_reason: "invalid_code_format",
        },
        normalized_code: normalizedCode || codeInput.trim(),
        result: "invalid",
        user_agent: await getUserAgent(),
        verification_code_entered: codeInput.trim(),
      });

      return {
        ok: true,
        data: safeResult(
          "invalid",
          normalizedCode || codeInput.trim(),
          "No active representative was found for this code.",
        ),
      };
    }

    const { data: representative, error } = await supabase
      .from("representatives")
      .select(
        "id, display_name, verification_code, code_status, representative_status, province, city, service_area, role_title, public_notes",
      )
      .eq("verification_code", normalizedCode)
      .maybeSingle();

    if (error) {
      return { ok: false, message: error.message };
    }

    let result: VerificationResult = "invalid";

    if (representative) {
      if (representative.code_status === "revoked") {
        result = "revoked";
      } else if (
        representative.code_status === "suspended" ||
        representative.representative_status !== "active"
      ) {
        result = "suspended";
      } else {
        result = "verified";
      }
    }

    await supabase.from("representative_verification_attempts").insert({
      matched_representative_id: representative?.id ?? null,
      metadata: {
        source: "public_representative_verification_page",
      },
      normalized_code: normalizedCode,
      result,
      user_agent: await getUserAgent(),
      verification_code_entered: codeInput.trim(),
    });

    if (!representative) {
      return {
        ok: true,
        data: safeResult(
          "invalid",
          normalizedCode,
          "No active representative was found for this code.",
        ),
      };
    }

    if (result === "revoked" || result === "suspended") {
      return {
        ok: true,
        data: safeResult(
          result,
          normalizedCode,
          "This representative code is not currently active. Please contact official ChinaPak ImportHub support before sharing information or making payment.",
        ),
      };
    }

    return {
      ok: true,
      data: {
        checkedAt: formatDateTime(new Date()),
        city: representative.city ?? "",
        code: representative.verification_code,
        displayName: representative.display_name,
        message:
          "This code belongs to an active ChinaPak ImportHub representative.",
        province: representative.province ?? "",
        publicNotes: representative.public_notes ?? "",
        result: "verified",
        roleTitle: representative.role_title,
        serviceArea: representative.service_area ?? "",
        statusLabel: "Active",
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Representative verification is not available right now.",
    };
  }
}
