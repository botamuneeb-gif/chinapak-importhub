import { ROUTES } from "@/config/brand";
import { launchFlags } from "@/config/launch-flags";
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

const maybeNavItem = (
  condition: boolean,
  item: PortalNavItem,
): PortalNavItem[] => (condition ? [item] : []);

const maybeQuickAction = (
  condition: boolean,
  item: PortalQuickAction,
): PortalQuickAction[] => (condition ? [item] : []);

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
      { href: ROUTES.importerProjects, label: "My Projects" },
      { href: ROUTES.importerReports, label: "Reports" },
      { href: ROUTES.invoices, label: "Invoices" },
      { href: ROUTES.payments, label: "Payments" },
      { href: ROUTES.refunds, label: "Refunds" },
      { href: ROUTES.importerNotifications, label: "Notifications" },
      ...maybeNavItem(launchFlags.enableMessages, {
        href: ROUTES.importerMessages,
        label: "Messages",
        supportLabel: "Admin-approved communication",
      }),
      ...maybeNavItem(launchFlags.enableProfilePages, {
        href: "#profile",
        label: "Profile",
      }),
    ],
    quickActions: [
      {
        description: "Create a new Import Project and choose a package.",
        href: ROUTES.importerStart,
        label: "Start New Project",
      },
      {
        description: "Track submitted projects, payment gates, and next steps.",
        href: ROUTES.importerProjects,
        label: "View Projects",
      },
      {
        description: "Review admin-released factory reports and evidence.",
        href: ROUTES.importerReports,
        label: "View Reports",
      },
      ...maybeQuickAction(launchFlags.enableMessages, {
        description: "Ask report questions through platform-controlled feedback.",
        href: ROUTES.importerMessages,
        label: "Ask Feedback",
      }),
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
      ...maybeNavItem(launchFlags.enableMessages, {
        href: ROUTES.fmsMessages,
        label: "Messages",
      }),
      { href: ROUTES.fmsAcademy, label: "Academy" },
      ...maybeNavItem(launchFlags.showFutureNavItems, {
        href: ROUTES.fmsEarnings,
        label: "Earnings",
      }),
      ...maybeNavItem(launchFlags.enableProfilePages, {
        href: "#profile",
        label: "Profile",
      }),
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
      { href: ROUTES.agentNotifications, label: "Notifications" },
      ...maybeNavItem(launchFlags.enableProfilePages, {
        href: "#profile",
        label: "Profile",
      }),
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
        description: "Track pending and paid commission records.",
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
      { href: ROUTES.adminRepresentatives, label: "Representatives" },
      { href: ROUTES.adminFms, label: "FMS Directory" },
      { href: ROUTES.adminFactorySubmissions, label: "Factory Submissions" },
      { href: ROUTES.adminEvidence, label: "Evidence Review" },
      { href: ROUTES.adminReportFeedback, label: "Report Feedback" },
      { href: ROUTES.adminNotifications, label: "Notifications" },
      ...maybeNavItem(launchFlags.enableFactoryDatabaseAdmin, {
        href: ROUTES.adminFactories,
        label: "Factories",
      }),
      ...maybeNavItem(launchFlags.enableMessages, {
        href: ROUTES.adminMessages,
        label: "Messages",
      }),
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
        description: "Create and manage public-safe representative codes.",
        href: ROUTES.adminRepresentatives,
        label: "Representatives",
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
  [USER_ROLES.projectManager]: {
    dashboardHref: ROUTES.projectManagerDashboard,
    loginHref: ROUTES.projectManagerLogin,
    roleLabel: "Project Manager Portal",
    supportLabel: "Limited project-flow operations",
    navItems: [
      { href: ROUTES.projectManagerDashboard, label: "Dashboard" },
      { href: ROUTES.projectManagerProjects, label: "Projects" },
      { href: ROUTES.projectManagerNotifications, label: "Notifications" },
    ],
    quickActions: [
      {
        description: "Review submitted projects, safe workflow markers, and next steps.",
        href: ROUTES.projectManagerProjects,
        label: "Review Projects",
      },
      {
        description: "Find projects that need importer information or admin escalation.",
        href: ROUTES.projectManagerProjects,
        label: "Project Queue",
      },
      {
        description: "Review project-flow alerts without accessing admin-only controls.",
        href: ROUTES.projectManagerNotifications,
        label: "Notifications",
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
      { href: ROUTES.superAdminFmsApplications, label: "FMS Applications" },
      {
        href: ROUTES.superAdminRoleControls,
        label: "Role Controls",
        supportLabel: "Assign and repair roles",
      },
      { href: ROUTES.superAdminNotifications, label: "Notifications" },
      ...maybeNavItem(launchFlags.showFutureNavItems, {
        href: "#system-settings",
        label: "System Settings",
      }),
      ...maybeNavItem(launchFlags.showFutureNavItems, {
        href: "#audit-security",
        label: "Audit / Security",
      }),
    ],
    quickActions: [
      {
        description: "Search users, review account status, and manage account safety.",
        href: ROUTES.superAdminUsers,
        label: "User Management",
      },
      {
        description: "Add, revoke, or convert active role assignments.",
        href: ROUTES.superAdminRoleControls,
        label: "Role Controls",
      },
      {
        description: "Final-approve or decline FMS applications forwarded by Admin.",
        href: ROUTES.superAdminFmsApplications,
        label: "FMS Applications",
      },
      ...maybeQuickAction(launchFlags.showFutureNavItems, {
        description: "Review audit and security events from the protected module.",
        href: "#audit-security",
        label: "Security",
      }),
    ],
  },
};
