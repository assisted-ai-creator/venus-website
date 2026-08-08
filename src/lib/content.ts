/**
 * The website's read path.
 *
 * Every page asks `getSite()` for the published snapshot. The API answers from
 * a single KV read, so this is one fast edge round-trip and the content is
 * never stale: a save in the panel is visible on the next request, which is
 * what "updates the site in realtime" has to mean for a server-rendered site.
 *
 * If the API is unreachable — a bad deploy, an expired key, a Cloudflare
 * incident — the in-repo seed renders instead. The school's site does not go
 * down because the CMS did.
 */

import { cache } from "react";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SEED_SITE } from "@/content/seed";
import type { SiteContent, SitePost } from "./site";

/**
 * A service binding, structurally.
 *
 * Declared here rather than imported: the project has no dependency on
 * @cloudflare/workers-types, and the generated cloudflare-env.d.ts is
 * git-ignored, so it is not there when CI typechecks.
 */
export interface ServiceBinding {
  fetch: (input: string, init?: RequestInit) => Promise<Response>;
}

interface CmsEnv {
  /** Service binding to the venus-backend worker. Absent under `next dev`. */
  CMS?: ServiceBinding;
  CMS_API_URL?: string;
  CMS_SITE_KEY?: string;
  /** Milliseconds a snapshot may be reused within one worker isolate. 0 = never. */
  CMS_CACHE_MS?: string;
}

function cmsEnv(): CmsEnv {
  // Bindings and vars come from the Workers runtime in production; process.env
  // covers `next dev` and any Node-side tooling.
  let fromWorker: Record<string, unknown> = {};
  try {
    fromWorker = (getCloudflareContext().env ?? {}) as unknown as Record<string, unknown>;
  } catch {
    /* Not running on Workers — `next dev` falls through to process.env. */
  }

  const cms = fromWorker.CMS as ServiceBinding | undefined;
  return {
    CMS: typeof cms?.fetch === "function" ? cms : undefined,
    CMS_API_URL: String(fromWorker.CMS_API_URL ?? process.env.CMS_API_URL ?? ""),
    CMS_SITE_KEY: String(fromWorker.CMS_SITE_KEY ?? process.env.CMS_SITE_KEY ?? ""),
    CMS_CACHE_MS: String(fromWorker.CMS_CACHE_MS ?? process.env.CMS_CACHE_MS ?? "0"),
  };
}

export function apiBase(): string {
  return (cmsEnv().CMS_API_URL ?? "").replace(/\/+$/, "");
}

/** False only when neither the binding nor a URL is available to reach the API. */
export function cmsConfigured(): boolean {
  return Boolean(cmsEnv().CMS) || apiBase() !== "";
}

/**
 * One request to the content API.
 *
 * In production this travels the `CMS` service binding: worker to worker
 * inside Cloudflare, never over the public internet, so the API needs no
 * hostname of its own. `next dev` has no bindings, so it falls back to
 * CMS_API_URL — which is how a local `wrangler dev` on the API is reached.
 */
export async function cmsFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const env = cmsEnv();
  const headers = new Headers(init.headers);
  if (env.CMS_SITE_KEY) headers.set("x-site-key", env.CMS_SITE_KEY);

  // The bound worker routes on the path alone, so the origin is a formality.
  if (env.CMS) return env.CMS.fetch(`https://venus-backend${path}`, { ...init, headers });

  return fetch(`${apiBase()}${path}`, { ...init, headers, cache: "no-store" });
}

/**
 * A very short reuse window inside one isolate.
 *
 * Defaults to zero — every render reads the live snapshot. Set `CMS_CACHE_MS`
 * to a few thousand if the site ever takes enough traffic that the KV reads
 * are worth collapsing; edits then take up to that long to appear.
 */
let memo: { at: number; site: SiteContent } | null = null;

async function fetchSite(): Promise<SiteContent> {
  if (!cmsConfigured()) return SEED_SITE;

  const ttl = Number(cmsEnv().CMS_CACHE_MS ?? 0) || 0;
  if (memo && ttl > 0 && Date.now() - memo.at < ttl) return memo.site;

  try {
    const res = await cmsFetch("/v1/site");
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const site = (await res.json()) as SiteContent;
    if (!site || !Array.isArray(site.pages)) throw new Error("Snapshot was not in the expected shape");

    // A snapshot with no pages means the CMS is reachable but has nothing in
    // it — a database that has been migrated but not yet seeded, or one that
    // has been wiped. Rendering that verbatim turns every route into a 404, so
    // it is treated as an outage and the in-repo seed renders instead.
    if (site.pages.length === 0) throw new Error("Snapshot contained no pages");

    // Settings the panel has never been given still need to render. So does a
    // collection an older API does not publish yet — a website deployed ahead
    // of the API sees no notices rather than crashing on an absent array.
    const merged: SiteContent = {
      ...site,
      settings: { ...SEED_SITE.settings, ...site.settings },
      notices: Array.isArray(site.notices) ? site.notices : [],
    };
    if (ttl > 0) memo = { at: Date.now(), site: merged };
    return merged;
  } catch (err) {
    console.error("[cms] falling back to the in-repo seed:", err);
    return SEED_SITE;
  }
}

/** Deduplicated for the lifetime of one render. */
export const getSite = cache(fetchSite);

export const getPost = cache(async (slug: string): Promise<SitePost | null> => {
  if (!cmsConfigured()) return null;
  try {
    const res = await cmsFetch(`/v1/blog/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const body = (await res.json()) as { post?: SitePost };
    return body.post ?? null;
  } catch (err) {
    console.error("[cms] post fetch failed:", err);
    return null;
  }
});

/** Used by the /admin gate. Returns null when the policy cannot be read. */
export async function getIpPolicy(): Promise<{ enabled: boolean; allow: string[] } | null> {
  if (!cmsConfigured()) return null;
  try {
    const res = await cmsFetch("/v1/security/policy");
    if (!res.ok) return null;
    return (await res.json()) as { enabled: boolean; allow: string[] };
  } catch {
    return null;
  }
}
