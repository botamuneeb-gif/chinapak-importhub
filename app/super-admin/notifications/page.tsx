import type { Metadata } from "next";
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Super Admin Notifications | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function SuperAdminNotificationsPage() {
  return (
    <LiveNotificationCenter
      description="Security and account-management alerts for Super Admin review. Passwords, tokens, and secrets are never stored in notification records."
      role={USER_ROLES.superAdmin}
      title="Super Admin Notifications"
    />
  );
}
