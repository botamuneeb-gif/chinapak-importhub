import type { Metadata } from "next";
import { FmsShell } from "@/components/fms/fms-shell";
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "FMS Notifications | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function FmsNotificationsPage() {
  return (
    <FmsShell
      description="Assignment, evidence, and admin-review updates for your FMS account. Importer contact details are never included."
      title="FMS Notifications"
    >
      <LiveNotificationCenter
        description="Notifications are tied to platform-assigned sourcing work and admin-controlled review. 所有通知都必须遵守平台沟通规则。"
        role={USER_ROLES.fms}
        title="FMS Notifications"
      />
    </FmsShell>
  );
}
