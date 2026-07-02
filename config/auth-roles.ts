import { ROUTES } from "@/config/brand";

export type AuthRoleId =
  | "importer"
  | "fms"
  | "agent"
  | "admin"
  | "super-admin"
  | "factory";

export type AuthRole = {
  id: AuthRoleId;
  title: string;
  subtitle: string;
  description: string;
  href: string;
  futureDashboard: string;
  accessModel: string;
  statusLabel: string;
};

export const authRoles: AuthRole[] = [
  {
    id: "importer",
    title: "Importer",
    subtitle: "Pakistani importer account",
    description: "Start and track import projects.",
    href: ROUTES.login,
    futureDashboard: ROUTES.importerDashboard,
    accessModel: "Phone/WhatsApp OTP-first",
    statusLabel: "Public importer access",
  },
  {
    id: "fms",
    title: "FMS",
    subtitle: "Factory Match Specialist",
    description: "Invitation-only sourcing specialist portal.",
    href: ROUTES.fmsLogin,
    futureDashboard: ROUTES.fmsDashboard,
    accessModel: "Invitation or admin approval required",
    statusLabel: "Invitation-only",
  },
  {
    id: "agent",
    title: "Agent",
    subtitle: "Pakistani Local Agent",
    description: "Local Pakistani representative portal.",
    href: ROUTES.agentLogin,
    futureDashboard: ROUTES.agentDashboard,
    accessModel: "Approved local representative access",
    statusLabel: "Approval required",
  },
  {
    id: "admin",
    title: "Admin",
    subtitle: "Internal operations",
    description: "Internal operations portal.",
    href: ROUTES.adminLogin,
    futureDashboard: ROUTES.admin,
    accessModel: "Authorized staff only",
    statusLabel: "Internal",
  },
  {
    id: "super-admin",
    title: "Super Admin",
    subtitle: "Platform control",
    description: "Platform control portal.",
    href: ROUTES.superAdminLogin,
    futureDashboard: ROUTES.superAdmin,
    accessModel: "Highest privilege internal access",
    statusLabel: "Restricted",
  },
  {
    id: "factory",
    title: "Factory Future",
    subtitle: "Hidden future factory access",
    description: "Future/invitation-only factory profile access.",
    href: ROUTES.factoryLogin,
    futureDashboard: ROUTES.factory,
    accessModel: "Future activation or admin invitation",
    statusLabel: "Future/hidden",
  },
];

export const businessTypes = [
  "Shopkeeper",
  "Wholesaler",
  "Online Seller",
  "Manufacturer",
  "New Importer",
  "Other",
] as const;

export const inviteRoles = ["FMS", "Agent", "Factory Future"] as const;

export const publicAuthTrustNotes = [
  "Secure project tracking",
  "Pakistani local support",
  "Refund protection before FMS assignment",
] as const;

export const authSecurityPrinciples = [
  {
    title: "OTP login",
    body: "Importer access is planned around phone and WhatsApp OTP so shopkeepers do not need to manage passwords first.",
  },
  {
    title: "Role-based portals",
    body: "Importer, FMS, Agent, Admin, Super Admin, and future Factory users route to separate protected dashboards later.",
  },
  {
    title: "Contact detail protection",
    body: "Importer and FMS personal contact details must never be exposed across roles.",
  },
  {
    title: "Admin-controlled communication",
    body: "Admin remains the communication bridge for importer, FMS, and future factory workflows.",
  },
  {
    title: "No importer-FMS direct contact",
    body: "The platform does not allow direct importer-to-FMS chat or private contact exchange.",
  },
  {
    title: "Sensitive factory data is admin-only",
    body: "Factory contact data and internal sourcing intelligence stay admin-controlled unless an approved workflow releases limited information.",
  },
  {
    title: "Audit history future",
    body: "Future authentication, permission changes, message approvals, and sensitive data views should write audit events.",
  },
] as const;
