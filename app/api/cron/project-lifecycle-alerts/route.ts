import { NextResponse } from "next/server";
import { USER_ROLES } from "@/lib/auth/roles";
import { generateProjectLifecycleAlertNotifications } from "@/lib/projects/project-lifecycle-alerts";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "Project lifecycle cron is not configured.",
      },
      { status: 503 },
    );
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized.",
      },
      { status: 401 },
    );
  }

  const result = await generateProjectLifecycleAlertNotifications({
    actorRole: USER_ROLES.admin,
  });

  return NextResponse.json({
    ok: true,
    result,
  });
}
