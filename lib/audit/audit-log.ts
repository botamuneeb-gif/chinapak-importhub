import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import type { Database, Json } from "@/lib/supabase/types";

type SupabaseAdmin = ReturnType<typeof createAdminSupabaseClient>;
type UserRole = Database["public"]["Enums"]["user_role"];

export type AuditLogInput = {
  action: string;
  actorRole: UserRole;
  actorUserId?: string | null;
  afterData?: Json | null;
  beforeData?: Json | null;
  entityId?: string | null;
  entityType: string;
  metadata?: Json;
};

export async function writeAuditLog(
  input: AuditLogInput,
  supabase: SupabaseAdmin = createAdminSupabaseClient(),
) {
  const { error } = await supabase.from("audit_logs").insert({
    action: input.action,
    actor_role: input.actorRole,
    actor_user_id: input.actorUserId ?? null,
    after_data: input.afterData ?? null,
    before_data: input.beforeData ?? null,
    entity_id: input.entityId ?? null,
    entity_type: input.entityType,
    metadata: {
      ...(input.metadata && typeof input.metadata === "object"
        ? input.metadata
        : {}),
      no_passwords_tokens_or_secrets_stored: true,
    },
  });

  if (error) {
    return { ok: false as const, message: error.message };
  }

  return { ok: true as const };
}
