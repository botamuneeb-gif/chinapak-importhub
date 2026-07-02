import { RiskFlagBadge } from "@/components/messaging/risk-flag-badge";
import { TranslationBlock } from "@/components/messaging/translation-block";
import type { MessageItem, MessagingView } from "@/config/messaging";
import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  message: MessageItem;
  view: MessagingView;
};

function roleClasses(role: MessageItem["senderRole"]) {
  if (role === "Admin" || role === "System") {
    return "border-brand-navy bg-white";
  }

  if (role === "Importer") {
    return "border-brand-emerald bg-emerald-50";
  }

  if (role === "FMS") {
    return "border-brand-gold bg-amber-50";
  }

  return "border-slate-300 bg-white";
}

export function MessageBubble({ message, view }: MessageBubbleProps) {
  return (
    <article
      className={cn(
        "rounded-lg border p-4 shadow-sm",
        roleClasses(message.senderRole),
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-brand-navy">
            {message.senderRole}
          </p>
          <p className="mt-1 text-xs font-semibold text-brand-muted">
            {message.timestamp}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {message.riskFlags.map((flag) => (
            <RiskFlagBadge flag={flag} key={flag} />
          ))}
        </div>
      </div>

      <div className="mt-4">
        <TranslationBlock message={message} view={view} />
      </div>

      {message.attachments.length > 0 ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {message.attachments.map((attachment) => (
            <div
              className="rounded-lg border border-dashed border-slate-300 bg-white/70 p-3 text-sm"
              key={attachment.id}
            >
              <p className="font-bold text-brand-navy">{attachment.label}</p>
              <p className="mt-1 text-xs text-brand-muted">
                {attachment.kind} · {attachment.storageStatus}
              </p>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}
