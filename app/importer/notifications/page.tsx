import type { Metadata } from "next";
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Importer Notifications | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ImporterNotificationsPage() {
  return (
    <LiveNotificationCenter
      description="Project, invoice, payment, report, feedback, and refund updates approved for your importer account appear here. Direct FMS or factory contact details are not shared through notifications."
      role={USER_ROLES.importer}
      title="Importer Notifications"
    />
  );
}
