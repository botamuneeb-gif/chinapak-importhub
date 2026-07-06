import "server-only";

import type { EmailTemplatePayload } from "@/lib/notifications/types";

type EmailDeliveryResult =
  | {
      ok: true;
      provider: string;
      providerMessageId?: string | null;
      status: "queued" | "delivered" | "skipped";
    }
  | {
      ok: false;
      errorMessage: string;
      provider: string;
      status: "failed" | "skipped";
    };

function getDeliveryMode() {
  return process.env.EMAIL_DELIVERY_MODE?.trim() || "disabled";
}

function getFromAddress() {
  const fromName = process.env.EMAIL_FROM_NAME?.trim() || "ChinaPak ImportHub";
  const fromAddress =
    process.env.EMAIL_FROM_ADDRESS?.trim() || "no-reply@chinapakimporthub.com";

  return `${fromName} <${fromAddress}>`;
}

export async function deliverEmail(input: {
  template: EmailTemplatePayload;
  to?: string | null;
}): Promise<EmailDeliveryResult> {
  const mode = getDeliveryMode();

  if (mode === "disabled") {
    return {
      ok: true,
      provider: "disabled",
      status: "skipped",
    };
  }

  if (mode === "log") {
    console.info("[email-log]", {
      subject: input.template.subject,
      to: input.to ? "configured-recipient" : "no-recipient",
    });

    return {
      ok: true,
      provider: "log",
      status: "skipped",
    };
  }

  if (mode === "resend") {
    const apiKey = process.env.RESEND_API_KEY?.trim();

    if (!apiKey || !input.to) {
      return {
        ok: false,
        errorMessage:
          "Resend mode requires RESEND_API_KEY and a recipient email.",
        provider: "resend",
        status: "skipped",
      };
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        body: JSON.stringify({
          from: getFromAddress(),
          html: input.template.html,
          subject: input.template.subject,
          text: input.template.text,
          to: [input.to],
        }),
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        id?: string;
        message?: string;
        name?: string;
      };

      if (!response.ok) {
        return {
          ok: false,
          errorMessage:
            responseBody.message ||
            responseBody.name ||
            `Resend request failed with status ${response.status}.`,
          provider: "resend",
          status: "failed",
        };
      }

      return {
        ok: true,
        provider: "resend",
        providerMessageId: responseBody.id ?? null,
        status: "queued",
      };
    } catch (error) {
      return {
        ok: false,
        errorMessage:
          error instanceof Error ? error.message : "Resend request failed.",
        provider: "resend",
        status: "failed",
      };
    }
  }

  if (mode === "smtp") {
    if (
      !process.env.SMTP_HOST ||
      !process.env.SMTP_PORT ||
      !process.env.SMTP_USER ||
      !process.env.SMTP_PASSWORD
    ) {
      return {
        ok: false,
        errorMessage: "SMTP mode requires SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD.",
        provider: "smtp",
        status: "skipped",
      };
    }

    return {
      ok: true,
      provider: "smtp",
      status: "queued",
    };
  }

  return {
    ok: false,
    errorMessage: `Unsupported EMAIL_DELIVERY_MODE: ${mode}`,
    provider: mode,
    status: "skipped",
  };
}
