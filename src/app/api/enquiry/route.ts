import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { enquirySchema } from "@/lib/enquiry";
import { school } from "@/content/school";

export const runtime = "edge";

interface EnquiryEnv {
  DB?: D1Database;
  RESEND_API_KEY?: string;
  ENQUIRY_TO?: string;
  ENQUIRY_FROM?: string;
}

/** Very small fixed-window limiter, keyed on client IP. */
async function rateLimited(db: D1Database | undefined, ip: string) {
  if (!db) return false;
  const since = Date.now() - 60 * 60 * 1000;
  try {
    const row = await db
      .prepare("SELECT COUNT(*) AS n FROM enquiries WHERE ip = ?1 AND created_at > ?2")
      .bind(ip, since)
      .first<{ n: number }>();
    return (row?.n ?? 0) >= 6;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "That request could not be read. Please try again." },
      { status: 400 }
    );
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return NextResponse.json(
      {
        ok: false,
        message: "Some details need checking before this can be sent.",
        fieldErrors,
      },
      { status: 422 }
    );
  }

  const data = parsed.data;

  // Honeypot filled — accept silently so bots learn nothing.
  if (data.website) return NextResponse.json({ ok: true });

  let env: EnquiryEnv = {};
  try {
    env = (getCloudflareContext().env ?? {}) as unknown as EnquiryEnv;
  } catch {
    // Running outside the Workers runtime (next dev). Fall through.
  }

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (await rateLimited(env.DB, ip)) {
    return NextResponse.json(
      {
        ok: false,
        message: `You have sent several enquiries already. Please call the school on ${school.phones[1].number}.`,
      },
      { status: 429 }
    );
  }

  const record = {
    ...data,
    ip,
    created_at: Date.now(),
  };

  // 1. Persist first — an enquiry that reaches D1 is never lost, even if the
  //    mail provider is down or unconfigured.
  let stored = false;
  if (env.DB) {
    try {
      await env.DB.prepare(
        `INSERT INTO enquiries
           (parent_name, phone, email, child_name, seeking_class, message, ip, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`
      )
        .bind(
          record.parentName,
          record.phone,
          record.email ?? "",
          record.childName ?? "",
          record.seekingClass,
          record.message ?? "",
          record.ip,
          record.created_at
        )
        .run();
      stored = true;
    } catch (err) {
      console.error("D1 insert failed", err);
    }
  }

  // 2. Then notify the school by email.
  let mailed = false;
  if (env.RESEND_API_KEY) {
    const to = env.ENQUIRY_TO ?? school.emails.helpdesk;
    const from = env.ENQUIRY_FROM ?? "Venus World Schools <website@venusworldschools.org>";
    const lines = [
      `Parent / guardian: ${record.parentName}`,
      `Phone: ${record.phone}`,
      `Email: ${record.email || "—"}`,
      `Child: ${record.childName || "—"}`,
      `Class applied for: ${record.seekingClass}`,
      "",
      "Message:",
      record.message || "—",
      "",
      `Received: ${new Date(record.created_at).toISOString()}`,
    ];

    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [to],
          reply_to: record.email || undefined,
          subject: `Website enquiry — ${record.parentName} (${record.seekingClass})`,
          text: lines.join("\n"),
        }),
      });
      mailed = res.ok;
      if (!res.ok) console.error("Resend failed", res.status, await res.text());
    } catch (err) {
      console.error("Resend request threw", err);
    }
  }

  if (!stored && !mailed) {
    // Nothing was persisted and nothing was sent — tell the truth rather than
    // showing a success screen for an enquiry that went nowhere.
    console.error("Enquiry could not be delivered", record);
    return NextResponse.json(
      {
        ok: false,
        message: `The enquiry could not be delivered just now. Please call ${school.phones[1].number} or email ${school.emails.helpdesk}.`,
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
