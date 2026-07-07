"use server";

import { USER_ROLES, hasAllowedRole, type UserRole } from "@/lib/auth/roles";
import { getProfileForAccessToken } from "@/lib/auth/session";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];
type JsonObject = { [key: string]: Json | undefined };

type ActionResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      message: string;
    };

export type NotificationCenterRole =
  | typeof USER_ROLES.importer
  | typeof USER_ROLES.fms
  | typeof USER_ROLES.agent
  | typeof USER_ROLES.admin
  | typeof USER_ROLES.projectManager
  | typeof USER_ROLES.superAdmin;

export type NotificationTrayCategory =
  | "projects"
  | "payments"
  | "fms_submissions"
  | "reports"
  | "refunds"
  | "representatives"
  | "system";

export type NotificationCenterItem = {
  actionUrl: string;
  category: NotificationTrayCategory;
  channel: string;
  createdAt: string;
  id: string;
  isAlwaysShown: boolean;
  message: string;
  priority: string;
  projectCode: string;
  readAt: string;
  status: string;
  title: string;
  type: string;
};

export type NotificationCenterData = {
  items: NotificationCenterItem[];
  unreadCount: number;
};

export type NotificationPreferenceOption = {
  alwaysShown?: boolean;
  category: NotificationTrayCategory;
  description: string;
  label: string;
};

export type NotificationTrayData = NotificationCenterData & {
  preferenceOptions: NotificationPreferenceOption[];
  hiddenCategories: NotificationTrayCategory[];
  totalUnreadCount: number;
};

const notificationPreferenceOptions: NotificationPreferenceOption[] = [
  {
    category: "projects",
    description: "Import project submissions, approvals, and project updates.",
    label: "Projects",
  },
  {
    category: "payments",
    description: "Invoices, manual payment review, and payment decisions.",
    label: "Payments",
  },
  {
    category: "fms_submissions",
    description: "FMS assignments, factory submissions, evidence, and review updates.",
    label: "FMS submissions",
  },
  {
    category: "reports",
    description: "Factory report releases, feedback, and report responses.",
    label: "Reports",
  },
  {
    category: "refunds",
    description: "Refund requests, decisions, and processing updates.",
    label: "Refunds",
  },
  {
    category: "representatives",
    description: "Representative verification and launch operations.",
    label: "Representatives",
  },
  {
    alwaysShown: true,
    category: "system",
    description: "Security and account safety notices are always shown.",
    label: "System/security",
  },
];

const validTrayCategories = new Set<NotificationTrayCategory>(
  notificationPreferenceOptions.map((option) => option.category),
);

function toJsonObject(value: Json | null | undefined): JsonObject {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as JsonObject;
  }

  return {};
}

function readString(value: Json | null | undefined, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function notificationCategory(type: string): NotificationTrayCategory {
  if (
    type.includes("payment") ||
    type.includes("invoice") ||
    type.includes("manual_payment")
  ) {
    return "payments";
  }

  if (type.includes("refund")) {
    return "refunds";
  }

  if (
    type.includes("factory_submission") ||
    type.includes("fms_assignment") ||
    type.includes("assignment") ||
    type.includes("file_evidence")
  ) {
    return "fms_submissions";
  }

  if (type.includes("report") || type.includes("feedback")) {
    return "reports";
  }

  if (type.includes("representative")) {
    return "representatives";
  }

  if (
    type.includes("password") ||
    type.includes("role_changed") ||
    type.includes("user_suspended") ||
    type.includes("suspicious")
  ) {
    return "system";
  }

  return "projects";
}

function isAlwaysShownNotification(type: string, priority: string) {
  return (
    priority === "urgent" ||
    notificationCategory(type) === "system" ||
    type.includes("unsafe_contact_firewall")
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(new Date(value));
}

async function requireNotificationViewer(
  accessToken: string,
  centerRole: NotificationCenterRole,
) {
  const authCheck = await getProfileForAccessToken(accessToken);

  if (!authCheck.ok) {
    return authCheck;
  }

  const allowedRoles =
    centerRole === USER_ROLES.admin
      ? [USER_ROLES.admin, USER_ROLES.superAdmin]
      : [centerRole];

  if (!hasAllowedRole(authCheck.profile.roles, allowedRoles)) {
    return {
      ok: false as const,
      message: "This account cannot view this notification center.",
    };
  }

  return {
    ok: true as const,
    authUserId: authCheck.profile.authUserId,
    profileId: authCheck.profile.profileId,
    roles: authCheck.profile.roles,
    supabase: createAdminSupabaseClient(),
  };
}

function canTouchNotification(
  notification: NotificationRow,
  profileId: string,
  roles: UserRole[],
  centerRole: NotificationCenterRole,
) {
  if (notification.recipient_profile_id === profileId) {
    return true;
  }

  if (notification.recipient_role === centerRole) {
    return true;
  }

  return (
    centerRole === USER_ROLES.admin &&
    notification.recipient_role === USER_ROLES.admin &&
    hasAllowedRole(roles, [USER_ROLES.superAdmin])
  );
}

function buildRoleFilter(profileId: string, centerRole: NotificationCenterRole) {
  return `recipient_profile_id.eq.${profileId},recipient_role.eq.${centerRole}`;
}

async function mapNotifications(
  supabase: ReturnType<typeof createAdminSupabaseClient>,
  rows: NotificationRow[],
): Promise<NotificationCenterItem[]> {
  const projectIds = Array.from(
    new Set(
      rows
        .map((notification) => notification.project_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const { data: projects } =
    projectIds.length > 0
      ? await supabase
          .from("import_projects")
          .select("id, project_code")
          .in("id", projectIds)
      : { data: [] };
  const projectMap = new Map(
    (projects ?? []).map((project) => [project.id, project.project_code]),
  );

  return rows.map((notification) => {
    const metadata = toJsonObject(notification.metadata);

    return {
      actionUrl: notification.action_url ?? "",
      category: notificationCategory(notification.type),
      channel: notification.channel,
      createdAt: formatDate(notification.created_at),
      id: notification.id,
      isAlwaysShown: isAlwaysShownNotification(
        notification.type,
        notification.priority,
      ),
      message: notification.message,
      priority: notification.priority,
      projectCode:
        notification.project_id && projectMap.has(notification.project_id)
          ? projectMap.get(notification.project_id) ?? ""
          : readString(metadata.project_code),
      readAt: formatDate(notification.read_at),
      status: notification.read_at ? "read" : notification.status,
      title: notification.title,
      type: notification.type,
    };
  });
}

export async function listNotificationsAction(
  accessToken: string,
  centerRole: NotificationCenterRole,
  options: { applyPreferences?: boolean; limit?: number } = {},
): Promise<ActionResult<NotificationCenterData>> {
  try {
    const viewer = await requireNotificationViewer(accessToken, centerRole);

    if (!viewer.ok) {
      return viewer;
    }

    const { data: rows, error } = await viewer.supabase
      .from("notifications")
      .select("*")
      .or(buildRoleFilter(viewer.profileId, centerRole))
      .order("created_at", { ascending: false })
      .limit(options.limit ?? 100);

    if (error) {
      return { ok: false, message: error.message };
    }

    let items = await mapNotifications(viewer.supabase, rows ?? []);

    if (options.applyPreferences) {
      const hiddenCategories = await getHiddenTrayCategories(viewer);
      items = filterItemsByPreferences(items, hiddenCategories);
    }

    return {
      ok: true,
      data: {
        items,
        unreadCount: items.filter(
          (notification) =>
            notification.status !== "read" &&
            (!notification.readAt || notification.readAt === "Not set"),
        ).length,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Notifications could not be loaded.",
    };
  }
}

async function getHiddenTrayCategories(
  viewer: Awaited<ReturnType<typeof requireNotificationViewer>> & {
    ok: true;
  },
) {
  const { data } = await viewer.supabase
    .from("notification_preferences")
    .select("metadata")
    .eq("user_profile_id", viewer.profileId)
    .maybeSingle();
  const metadata = toJsonObject(data?.metadata);
  const hidden = Array.isArray(metadata.tray_hidden_categories)
    ? metadata.tray_hidden_categories
    : [];

  return hidden.filter(
    (category): category is NotificationTrayCategory =>
      typeof category === "string" &&
      validTrayCategories.has(category as NotificationTrayCategory) &&
      category !== "system",
  );
}

function filterItemsByPreferences(
  items: NotificationCenterItem[],
  hiddenCategories: NotificationTrayCategory[],
) {
  const hidden = new Set(hiddenCategories);

  return items.filter(
    (item) => item.isAlwaysShown || !hidden.has(item.category),
  );
}

export async function getNotificationTrayAction(
  accessToken: string,
  centerRole: NotificationCenterRole,
): Promise<ActionResult<NotificationTrayData>> {
  try {
    const viewer = await requireNotificationViewer(accessToken, centerRole);

    if (!viewer.ok) {
      return viewer;
    }

    const { data: rows, error } = await viewer.supabase
      .from("notifications")
      .select("*")
      .or(buildRoleFilter(viewer.profileId, centerRole))
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return { ok: false, message: error.message };
    }

    const hiddenCategories = await getHiddenTrayCategories(viewer);
    const allItems = await mapNotifications(viewer.supabase, rows ?? []);
    const filteredItems = filterItemsByPreferences(
      allItems,
      hiddenCategories,
    ).slice(0, 8);

    return {
      ok: true,
      data: {
        hiddenCategories,
        items: filteredItems,
        preferenceOptions: notificationPreferenceOptions,
        totalUnreadCount: allItems.filter(
          (notification) =>
            notification.status !== "read" &&
            (!notification.readAt || notification.readAt === "Not set"),
        ).length,
        unreadCount: filteredItems.filter(
          (notification) =>
            notification.status !== "read" &&
            (!notification.readAt || notification.readAt === "Not set"),
        ).length,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Notification tray could not be loaded.",
    };
  }
}

export async function updateNotificationTrayPreferencesAction(
  accessToken: string,
  centerRole: NotificationCenterRole,
  hiddenCategoriesInput: string[],
): Promise<ActionResult<NotificationTrayData>> {
  const viewer = await requireNotificationViewer(accessToken, centerRole);

  if (!viewer.ok) {
    return viewer;
  }

  const hiddenCategories = hiddenCategoriesInput.filter(
    (category): category is NotificationTrayCategory =>
      validTrayCategories.has(category as NotificationTrayCategory) &&
      category !== "system",
  );

  const { data: existing } = await viewer.supabase
    .from("notification_preferences")
    .select("metadata")
    .eq("user_profile_id", viewer.profileId)
    .maybeSingle();
  const metadata = toJsonObject(existing?.metadata);

  const { error } = await viewer.supabase
    .from("notification_preferences")
    .upsert(
      {
        in_app_enabled: true,
        metadata: {
          ...metadata,
          tray_hidden_categories: hiddenCategories,
        },
        updated_by: viewer.authUserId,
        user_profile_id: viewer.profileId,
      },
      { onConflict: "user_profile_id" },
    );

  if (error) {
    return { ok: false, message: error.message };
  }

  return getNotificationTrayAction(accessToken, centerRole);
}

export async function markNotificationReadAction(
  accessToken: string,
  centerRole: NotificationCenterRole,
  notificationId: string,
): Promise<ActionResult<NotificationCenterData>> {
  const viewer = await requireNotificationViewer(accessToken, centerRole);

  if (!viewer.ok) {
    return viewer;
  }

  const { data: notification, error: notificationError } = await viewer.supabase
    .from("notifications")
    .select("*")
    .eq("id", notificationId)
    .maybeSingle();

  if (notificationError || !notification) {
    return {
      ok: false,
      message: notificationError?.message ?? "Notification was not found.",
    };
  }

  if (
    !canTouchNotification(
      notification,
      viewer.profileId,
      viewer.roles,
      centerRole,
    )
  ) {
    return {
      ok: false,
      message: "This notification is not available to your account.",
    };
  }

  const { error } = await viewer.supabase
    .from("notifications")
    .update({
      read_at: new Date().toISOString(),
      status: "read",
    })
    .eq("id", notification.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  return listNotificationsAction(accessToken, centerRole);
}

export async function markAllNotificationsReadAction(
  accessToken: string,
  centerRole: NotificationCenterRole,
): Promise<ActionResult<NotificationCenterData>> {
  const viewer = await requireNotificationViewer(accessToken, centerRole);

  if (!viewer.ok) {
    return viewer;
  }

  const { data: rows, error: listError } = await viewer.supabase
    .from("notifications")
    .select("id")
    .or(buildRoleFilter(viewer.profileId, centerRole))
    .is("read_at", null);

  if (listError) {
    return { ok: false, message: listError.message };
  }

  const ids = (rows ?? []).map((row) => row.id);

  if (ids.length > 0) {
    const { error } = await viewer.supabase
      .from("notifications")
      .update({
        read_at: new Date().toISOString(),
        status: "read",
      })
      .in("id", ids);

    if (error) {
      return { ok: false, message: error.message };
    }
  }

  return listNotificationsAction(accessToken, centerRole);
}
