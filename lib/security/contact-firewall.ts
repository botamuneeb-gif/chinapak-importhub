export type ContactRiskFlag =
  | "contact_info_detected"
  | "payment_instruction_detected"
  | "unapproved_direct_contact_attempt";

const contactPatterns: Array<{ flag: ContactRiskFlag; label: string; pattern: RegExp }> = [
  {
    flag: "contact_info_detected",
    label: "email address",
    pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  },
  {
    flag: "contact_info_detected",
    label: "phone number",
    pattern: /(?:\+?\d[\s().-]?){7,}/,
  },
  {
    flag: "contact_info_detected",
    label: "WhatsApp mention",
    pattern: /\b(?:whatsapp|wa\.me)\b/i,
  },
  {
    flag: "contact_info_detected",
    label: "WeChat mention",
    pattern: /\b(?:wechat|weixin)\b|微信/i,
  },
  {
    flag: "contact_info_detected",
    label: "Telegram mention",
    pattern: /\btelegram\b|@\w{4,}/i,
  },
  {
    flag: "payment_instruction_detected",
    label: "payment instruction",
    pattern:
      /\b(?:bank account|iban|swift|wire transfer|payment link|pay directly|send payment|advance payment|deposit to|支付宝|微信支付)\b/i,
  },
  {
    flag: "unapproved_direct_contact_attempt",
    label: "direct contact instruction",
    pattern:
      /\b(?:contact directly|direct contact|call me|call us|message me|add me|reach me|talk directly|直接联系|加我)\b/i,
  },
];

export type ContactFirewallResult = {
  flags: ContactRiskFlag[];
  messages: string[];
};

export function detectContactRiskInFields(
  fields: Array<{ label: string; value: string | null | undefined }>,
): ContactFirewallResult {
  const flags = new Set<ContactRiskFlag>();
  const messages = new Set<string>();

  fields.forEach((field) => {
    const value = field.value?.trim();

    if (!value) {
      return;
    }

    contactPatterns.forEach((rule) => {
      if (rule.pattern.test(value)) {
        flags.add(rule.flag);
        messages.add(`${field.label} includes ${rule.label}.`);
      }
    });
  });

  return {
    flags: Array.from(flags),
    messages: Array.from(messages),
  };
}
