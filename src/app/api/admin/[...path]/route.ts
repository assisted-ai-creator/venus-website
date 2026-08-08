import { NextResponse } from "next/server";
import { apiBase } from "@/lib/content";

/**
 * The panel's only route to the API.
 *
 * Everything under /admin talks to this handler, which forwards to the Hono
 * worker with the session attached. The session itself lives in a first-party
 * HttpOnly cookie on this domain, so:
 *
 *   — no token is ever readable from JavaScript, which takes XSS off the table
 *     as a session-theft route;
 *   — there are no cross-site cookies and no CORS preflights to configure, so
 *     the panel works on workers.dev, on a custom domain, or on localhost with
 *     no change;
 *   — the IP gate in middleware.ts covers this path too, so a blocked address
 *     cannot reach the API through the proxy either.
 */

export const runtime = "edge";
export const dynamic = "force-dynamic";

const COOKIE = "vws_admin";
const MAX_AGE = 12 * 60 * 60; // matches the API's session lifetime

type Ctx = { params: Promise<{ path: string[] }> };

function sessionCookie(request: Request, value: string, maxAge: number): string {
  const secure = new URL(request.url).protocol === "https:";
  return [
    `${COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    secure ? "Secure" : "",
    `Max-Age=${maxAge}`,
  ]
    .filter(Boolean)
    .join("; ");
}

function readCookie(request: Request): string {
  const header = request.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq > 0 && part.slice(0, eq).trim() === COOKIE) {
      return decodeURIComponent(part.slice(eq + 1).trim());
    }
  }
  return "";
}

function notConfigured() {
  return NextResponse.json(
    {
      error:
        "CMS_API_URL is not set on this deployment, so the panel has no API to talk to. See README → Environment.",
    },
    { status: 503 }
  );
}

/* ----------------------------------------------------------------- login --- */

async function signIn(request: Request, base: string) {
  const body = await request.text();
  const upstream = await fetch(`${base}/v1/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });

  const payload = (await upstream.json().catch(() => ({}))) as { token?: string; user?: unknown; error?: string };
  if (!upstream.ok || !payload.token) {
    return NextResponse.json({ error: payload.error ?? "Sign-in failed." }, { status: upstream.status || 401 });
  }

  // The token is dropped from the response body: the browser only ever needs
  // the cookie, and a token in JSON is a token in a log somewhere.
  const res = NextResponse.json({ ok: true, user: payload.user });
  res.headers.set("set-cookie", sessionCookie(request, payload.token, MAX_AGE));
  return res;
}

async function signOut(request: Request, base: string) {
  const token = readCookie(request);
  if (token) {
    await fetch(`${base}/v1/auth/logout`, {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  res.headers.set("set-cookie", sessionCookie(request, "", 0));
  return res;
}

/* ----------------------------------------------------------------- proxy --- */

/** Paths that reach the API's public auth routes rather than /v1/admin. */
const AUTH_ROUTES: Record<string, string> = {
  bootstrap: "/v1/auth/bootstrap",
  password: "/v1/auth/password",
  me: "/v1/auth/me",
};

async function proxy(request: Request, ctx: Ctx) {
  const base = apiBase();
  if (!base) return notConfigured();

  const { path } = await ctx.params;
  const segments = path ?? [];
  const head = segments[0] ?? "";
  const method = request.method.toUpperCase();

  if (head === "session") {
    if (method === "POST") return signIn(request, base);
    if (method === "DELETE") return signOut(request, base);
  }

  const token = readCookie(request);
  const upstreamPath =
    head in AUTH_ROUTES && segments.length === 1
      ? AUTH_ROUTES[head]
      : `/v1/admin/${segments.join("/")}`;

  const search = new URL(request.url).search;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const hasBody = method !== "GET" && method !== "HEAD";
  const init: RequestInit & { duplex?: "half" } = {
    method,
    headers,
    // Streamed through rather than buffered, so a large photograph upload does
    // not have to fit in this worker's memory before it reaches R2.
    body: hasBody ? request.body : undefined,
    duplex: hasBody ? "half" : undefined,
    redirect: "manual",
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${base}${upstreamPath}${search}`, init);
  } catch (err) {
    console.error("[admin proxy] upstream failed", err);
    return NextResponse.json(
      { error: "The content API could not be reached. Check that it is deployed and CMS_API_URL is correct." },
      { status: 502 }
    );
  }

  const out = new Headers();
  const type = upstream.headers.get("content-type");
  if (type) out.set("content-type", type);
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) out.set("content-disposition", disposition);
  out.set("cache-control", "no-store");

  // A rejected session clears the cookie, so the panel lands on the sign-in
  // screen instead of looping through 401s.
  if (upstream.status === 401 && token) {
    out.append("set-cookie", sessionCookie(request, "", 0));
  }

  return new Response(upstream.body, { status: upstream.status, headers: out });
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const PUT = proxy;
export const DELETE = proxy;
