import { AdminStatusBadge } from "@/components/admin/admin-status-badge";

export function ProjectManagerStatus({ value }: { value: string }) {
  return <AdminStatusBadge status={value} />;
}
