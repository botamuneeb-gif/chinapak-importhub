import { redirect } from "next/navigation";
import { ROUTES } from "@/config/brand";

export default function ProjectManagerIndexPage() {
  redirect(ROUTES.projectManagerDashboard);
}
