import type { Metadata } from "next";
import { LiveNotificationCenter } from "@/components/notifications/live-notification-center";
import { USER_ROLES } from "@/lib/auth/roles";

export const metadata: Metadata = {
  title: "Project Manager Notifications | ChinaPak ImportHub",
  robots: { index: false, follow: false },
};

export default function ProjectManagerNotificationsPage() {
  return (
    <LiveNotificationCenter
      description="Project-flow notices, admin escalation responses, and operational alerts available to Project Managers."
      role={USER_ROLES.projectManager}
      title="Project Manager Notifications"
    />
  );
}
