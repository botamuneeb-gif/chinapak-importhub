import { NextResponse } from "next/server";
import { USER_ROLES } from "@/lib/auth/roles";
import { generateDailyOperationsDigest } from "@/lib/operations/daily-operations-digest";

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        message: "Daily operations digest cron is not configured.",
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

  const result = await generateDailyOperationsDigest({
    actorRole: USER_ROLES.admin,
    mode: "cron",
  });

  return NextResponse.json({
    ok: true,
    result: {
      date: result.date,
      emailDelivery: result.emailDelivery,
      notificationsCreated: result.notificationsCreated,
      notificationsSkipped: result.notificationsSkipped,
    },
  });
}
