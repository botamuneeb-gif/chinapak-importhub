import type { MessageItem, MessagingView } from "@/config/messaging";

type TranslationBlockProps = {
  message: MessageItem;
  view: MessagingView;
};

function languageAttributes(language: MessageItem["originalLanguage"]) {
  if (language === "Urdu") {
    return { dir: "rtl" as const, lang: "ur" };
  }

  if (language === "Simplified Chinese") {
    return { dir: "ltr" as const, lang: "zh-CN" };
  }

  return { dir: "ltr" as const, lang: "en" };
}

export function TranslationBlock({ message, view }: TranslationBlockProps) {
  if (view !== "admin") {
    return (
      <p className="text-sm leading-7 text-brand-text">
        {message.adminApprovedText || message.translatedText}
      </p>
    );
  }

  const originalAttributes = languageAttributes(message.originalLanguage);

  return (
    <div className="grid gap-3">
      <div className="rounded-lg bg-brand-background p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">
          Original · {message.originalLanguage}
        </p>
        <p className="mt-2 text-sm leading-7 text-brand-text" {...originalAttributes}>
          {message.originalText}
        </p>
      </div>
      <div className="rounded-lg bg-emerald-50 p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-emerald">
          AI translation placeholder
        </p>
        <p className="mt-2 text-sm leading-7 text-brand-text">
          {message.translatedText}
        </p>
      </div>
      <div className="rounded-lg bg-white p-4 ring-1 ring-slate-200">
        <p className="text-xs font-bold uppercase tracking-wide text-brand-navy">
          Admin-approved version placeholder
        </p>
        <p className="mt-2 text-sm leading-7 text-brand-text">
          {message.adminApprovedText}
        </p>
      </div>
    </div>
  );
}
