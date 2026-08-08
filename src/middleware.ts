import { NextResponse, type NextRequest } from "next/server";

/**
 * The /admin gate.
 *
 * The panel decides which addresses may reach it, and this is where that
 * decision is enforced — before the route renders, and before the proxy will
 * forward anything to the API. The API applies the same policy again on its
 * own routes, so a bypass here is not a way in.
 *
 * Two rules govern this file:
 *
 *   1. The shipped default is open. `security.enabled` is false until the
 *      school turns it on, so nobody is locked out of a fresh install.
 *   2. It fails open, not closed. If the policy cannot be read — a cold API, a
 *      network blip — the gate stands down and the password takes over. A CMS
 *      outage must not also be a lockout with no way to fix it.
 */

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

/** Decisions are held briefly per isolate so a click-through is not a fetch storm. */
const CACHE_MS = 15_000;
const decisions = new Map<string, { at: number; allowed: boolean }>();

function clientIp(req: NextRequest): string {
  const raw =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    "";
  return raw.trim().replace(/^\[|\]$/g, "").split("%")[0];
}

async function isAllowed(apiBase: string, siteKey: string, ip: string): Promise<boolean> {
  const cached = decisions.get(ip);
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.allowed;

  try {
    const res = await fetch(`${apiBase}/v1/security/check?ip=${encodeURIComponent(ip)}`, {
      headers: siteKey ? { "x-site-key": siteKey } : {},
      cache: "no-store",
    });
    if (!res.ok) return true;

    const body = (await res.json()) as { allowed?: boolean };
    const allowed = body.allowed !== false;
    decisions.set(ip, { at: Date.now(), allowed });
    // The map is per-isolate and short-lived, but a long-running one should not
    // grow without bound.
    if (decisions.size > 500) decisions.clear();
    return allowed;
  } catch {
    return true;
  }
}

function blocked(ip: string, isApi: boolean) {
  if (isApi) {
    return NextResponse.json(
      { error: "This address is not permitted to reach the admin panel." },
      { status: 403 }
    );
  }

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex">
<title>Not permitted — Venus World Schools</title>
<style>
  :root{color-scheme:dark}
  body{margin:0;min-height:100dvh;display:grid;place-items:center;padding:2rem;
    background:#002147;color:#f4efe3;
    font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;line-height:1.6}
  .plate{max-width:34rem;background:#f4efe3;color:#0a1826;border:2px solid #0a1826;border-radius:2px}
  .band{background:#ffab1f;border-bottom:2px solid #0a1826;padding:.65rem 1.35rem;
    font-weight:700;text-transform:uppercase;letter-spacing:.14em;font-size:.78rem}
  .body{padding:1.6rem 1.35rem}
  h1{margin:0 0 .6rem;font-size:1.5rem;letter-spacing:-.02em}
  p{margin:.6rem 0}
  code{background:#e6dfcd;padding:.15rem .4rem;border-radius:2px;font-size:.95em}
</style></head>
<body><div class="plate">
  <div class="band">Access restricted · 403</div>
  <div class="body">
    <h1>This address cannot reach the panel</h1>
    <p>The admin panel is limited to an approved list of IP addresses, and this
       request came from <code>${ip || "an unknown address"}</code>.</p>
    <p>Ask whoever administers the site to add this address on the panel's
       Security screen, or connect from an approved network.</p>
  </div>
</div></body></html>`;

  return new NextResponse(html, {
    status: 403,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function middleware(req: NextRequest) {
  const apiBase = (process.env.CMS_API_URL ?? "").replace(/\/+$/, "");
  if (!apiBase) return NextResponse.next();

  const ip = clientIp(req);
  const allowed = await isAllowed(apiBase, process.env.CMS_SITE_KEY ?? "", ip);
  if (allowed) return NextResponse.next();

  return blocked(ip, req.nextUrl.pathname.startsWith("/api/"));
}
