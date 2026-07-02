import { ROUTES } from "@/config/brand";
import { USER_ROLES, type UserRole } from "@/lib/auth/roles";

export type PortalNavItem = {
  badge?: string;
  disabled?: boolean;
  href: string;
  label: string;
  supportLabel?: string;
};

export type PortalQuickAction = {
  description: string;
  disabled?: boolean;
  href: string;
  label: string;
};

export type PortalRoleConfig = {
  dashboardHref: string;
  loginHref: string;
  navItems: PortalNavItem[];
  quickActions: PortalQuickAction[];
  roleLabel: string;
  supportLabel: string;
};

export const portalRoleConfigs: Record<
  Exclude<UserRole, "factory_future">,
  PortalRoleConfig
> = {
  [USER_ROLES.importer]: {
    dashboardHref: ROUTES.importerDashboard,
    loginHref: ROUTES.login,
    roleLabel: "Importer Portal",
    supportLabel: "Urdu-first project tracking",
    navItems: [
      { href: ROUTES.importerDashboard, label: "Dashboard" },
      { href: ROUTES.importerStart, label: "Start New Project" },
      { href: ROUTES.importerReports, label: "My Reports" },
      { href: ROUTES.importerNotifications, label: "Notifications" },
      {
        href: ROUTES.importerMessages,
        label: "Messages / Feedback",
        supportLabel: "Admin-approved communication",
      },
      { href: ROUTES.payments, label: "Payments" },
      { href: ROUTES.invoices, label: "Invoices" },
      { href: ROUTES.refunds, label: "Refunds" },
      {
        disabled: true,
        href: "#profile-placeholder",
        label: "Profile",
        badge: "Future",
      },
    ],
    quickActions: [
      {
        description: "Create a new Import Project and choose a package.",
        href: ROUTES.importerStart,
        label: "Start New Project",
      },
      {
        description: "Review admin-released factory reports and evidence.",
        href: ROUTES.importerReports,
        label: "View Reports",
      },
      {
        description: "Ask report questions through platform-controlled feedback.",
        href: ROUTES.importerMessages,
        label: "Ask Feedback",
      },
    ],
  },
  [USER_ROLES.fms]: {
    dashboardHref: ROUTES.fmsDashboard,
    loginHref: ROUTES.fmsLogin,
    roleLabel: "FMS Portal",
    supportLabel: "Factory Match Specialist workspace",
    navItems: [
      { href: ROUTES.fmsDashboard, label: "Dashboard", supportLabel: "Workbench" },
      { href: ROUTES.fmsAssignments, label: "Assignments", supportLabel: "Tasks" },
      { href: ROUTES.fmsNotifications, label: "Notifications" },
      {
        href: ROUTES.fmsAssignments,
        label: "Factory Submissions / Evidence",
        supportLabel: "Admin review first",
      },
      { href: ROUTES.fmsMessages, label: "Messages", badge: "Placeholder" },
      { href: ROUTES.fmsAcademy, label: "Academy" },
      { href: ROUTES.fmsEarnings, label: "Earnings" },
      {
        disabled: true,
        href: "#profile-placeholder",
        label: "Profile",
        badge: "Future",
      },
    ],
    quickActions: [
      {
        description: "Open assigned sourcing projects and update milestones.",
        href: ROUTES.fmsAssignments,
        label: "View Assignments",
      },
      {
        description: "Upload evidence from the assignment workspace.",
        href: ROUTES.fmsAssignments,
        label: "Upload Evidence",
      },
      {
        description: "Review onboarding and quality standards.",
        href: ROUTES.fmsAcademy,
        label: "Academy",
      },
    ],
  },
  [USER_ROLES.agent]: {
    dashboardHref: ROUTES.agentDashboard,
    loginHref: ROUTES.agentLogin,
    roleLabel: "Agent Portal",
    supportLabel: "Pakistani local representative tools",
    navItems: [
      { href: ROUTES.agentDashboard, label: "Dashboard" },
      { href: ROUTES.agentLeads, label: "Leads" },
      { href: ROUTES.agentCommissions, label: "Commissions" },
      { href: ROUTES.agentTraining, label: "Training" },
      {
        disabled: true,
        href: "#profile-placeholder",
        label: "Profile",
        badge: "Future",
      },
    ],
    quickActions: [
      {
        description: "Follow assigned unpaid leads and payment-help requests.",
        href: ROUTES.agentLeads,
        label: "View Leads",
      },
      {
        description: "Review approved scripts and compliance rules.",
        href: ROUTES.agentTraining,
        label: "Training",
      },
      {
        description: "Track pending and paid commission placeholders.",
        href: ROUTES.agentCommissions,
        label: "Commissions",
      },
    ],
  },
  [USER_ROLES.admin]: {
    dashboardHref: ROUTES.admin,
    loginHref: ROUTES.adminLogin,
    roleLabel: "Admin Portal",
    supportLabel: "Operations and review center",
    navItems: [
      { href: ROUTES.admin, label: "Dashboard" },
      { href: `${ROUTES.admin}/projects`, label: "Projects" },
      { href: `${ROUTES.admin}/leads`, label: "Leads" },
      { href: ROUTES.adminPayments, label: "Payments" },
      { href: ROUTES.adminRefunds, label: "Refunds" },
      { href: ROUTES.adminFms, label: "FMS Directory" },
      { href: ROUTES.adminFactorySubmissions, label: "Factory Submissions" },
      { href: ROUTES.adminEvidence, label: "Evidence Review" },
      { href: ROUTES.adminReportFeedback, label: "Report Feedback" },
      { href: ROUTES.adminNotifications, label: "Notifications" },
      { href: ROUTES.adminFactories, label: "Factories" },
      { href: ROUTES.adminMessages, label: "Messages", badge: "Placeholder" },
    ],
    quickActions: [
      {
        description: "Open paid project review and readiness controls.",
        href: `${ROUTES.admin}/projects`,
        label: "Review Projects",
      },
      {
        description: "Review active FMS profiles before assignment.",
        href: ROUTES.adminFms,
        label: "FMS Directory",
      },
      {
        description: "Verify manual payment records and unblock paid projects.",
        href: ROUTES.adminPayments,
        label: "Payments",
      },
      {
        description: "Review full or partial refund requests.",
        href: ROUTES.adminRefunds,
        label: "Refunds",
      },
      {
        description: "Review FMS factory options before importer release.",
        href: ROUTES.adminFactorySubmissions,
        label: "Factory Submissions",
      },
      {
        description: "Approve, reject, or release selected evidence files.",
        href: ROUTES.adminEvidence,
        label: "Evidence",
      },
    ],
  },
  [USER_ROLES.superAdmin]: {
    dashboardHref: ROUTES.superAdmin,
    loginHref: ROUTES.superAdminLogin,
    roleLabel: "Super Admin Portal",
    supportLabel: "Highest-privilege platform control",
    navItems: [
      { href: ROUTES.superAdmin, label: "Dashboard" },
      { href: ROUTES.superAdminUsers, label: "User Management" },
      { href: ROUTES.superAdminNotifications, label: "Notifications" },
      {
        href: ROUTES.superAdminUsers,
        label: "Role Controls",
        supportLabel: "Inside user management",
      },
      {
        disabled: true,
        href: "#system-settings-placeholder",
        label: "System Settings",
        badge: "Future",
      },
      {
        disabled: true,
        href: "#audit-security-placeholder",
        label: "Audit / Security",
        badge: "Future",
      },
    ],
    quickActions: [
      {
        description: "Search users, reset passwords, and repair role profiles.",
        href: ROUTES.superAdminUsers,
        label: "User Management",
      },
      {
        description: "Add, revoke, or convert active role assignments.",
        href: ROUTES.superAdminUsers,
        label: "Role Controls",
      },
      {
        description: "Audit/security center remains a future protected module.",
        disabled: true,
        href: "#audit-security-placeholder",
        label: "Security",
      },
    ],
  },
};
