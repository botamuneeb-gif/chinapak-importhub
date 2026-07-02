import type { Metadata } from "next";
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Admin Notifications | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AdminNotificationsPage() {
  return (
    <LiveNotificationCenter
      description="Operational alerts for projects, unpaid leads, manual payments, refunds, FMS submissions, evidence, feedback, and firewall events."
      role={USER_ROLES.admin}
      title="Admin Notifications"
    />
  );
}
