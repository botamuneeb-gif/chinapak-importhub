import type { Metadata } from "next";
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Agent Notifications | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function AgentNotificationsPage() {
  return (
    <LiveNotificationCenter
      description="Lead and platform updates for your agent account appear here. Payment collection and direct messaging are not enabled."
      role={USER_ROLES.agent}
      title="Agent Notifications"
    />
  );
}
