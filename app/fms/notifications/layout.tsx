import type { ReactNode } from "react";
import { FmsProtectedRoute } from "@/components/auth/fms-protected-route";

export default function FmsNotificationsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <FmsProtectedRoute>{children}</FmsProtectedRoute>;
}
