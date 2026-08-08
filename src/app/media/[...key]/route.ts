import { cmsConfigured, cmsFetch } from "@/lib/content";

/**
 * Photographs and videos, served from the school's own domain.
 *
 * The files live in an R2 bucket that only the venus-backend worker can read,
 * so this handler passes the request to that worker over the service binding
 * and streams the answer straight back. Two things fall out of that: the API
 * needs no public hostname of its own, and every image on the site is
 * same-origin — one domain, no CORS, one cache to reason about.
 *
 * Upstream sets `immutable` cache headers and honours `if-none-match`. Both
 * are passed through untouched, so after the first fetch a photograph is
 * served from Cloudflare's edge cache rather than from R2.
 */

export const dynamic = "force-dynamic";

/** Response headers worth forwarding. Anything else is upstream's business. */
const PASS_THROUGH = [
  "content-type",
  "etag",
  "cache-control",
  "last-modified",
  "x-content-type-options",
];

type Ctx = { params: Promise<{ key: string[] }> };

export async function GET(request: Request, ctx: Ctx) {
  if (!cmsConfigured()) return new Response("Not found", { status: 404 });

  const { key } = await ctx.params;
  // Re-encoded segment by segment: the key may contain slashes, and upstream
  // decodes the whole path in one go.
  const path = (key ?? []).map(encodeURIComponent).join("/");
  if (!path) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  const ifNoneMatch = request.headers.get("if-none-match");
  if (ifNoneMatch) headers.set("if-none-match", ifNoneMatch);

  let upstream: Response;
  try {
    upstream = await cmsFetch(`/media/${path}`, { headers });
  } catch (err) {
    console.error("[media] upstream failed", err);
    return new Response("The media store could not be reached.", { status: 502 });
  }

  const out = new Headers();
  for (const name of PASS_THROUGH) {
    const value = upstream.headers.get(name);
    if (value) out.set(name, value);
  }

  return new Response(upstream.body, { status: upstream.status, headers: out });
}
