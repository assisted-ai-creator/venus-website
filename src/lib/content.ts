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

interface CmsEnv {
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

  return {
    CMS_API_URL: String(fromWorker.CMS_API_URL ?? process.env.CMS_API_URL ?? ""),
    CMS_SITE_KEY: String(fromWorker.CMS_SITE_KEY ?? process.env.CMS_SITE_KEY ?? ""),
    CMS_CACHE_MS: String(fromWorker.CMS_CACHE_MS ?? process.env.CMS_CACHE_MS ?? "0"),
  };
}

export function apiBase(): string {
  return (cmsEnv().CMS_API_URL ?? "").replace(/\/+$/, "");
}

function headers(): HeadersInit {
  const key = cmsEnv().CMS_SITE_KEY;
  return key ? { "x-site-key": key } : {};
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
  const base = apiBase();
  if (!base) return SEED_SITE;

  const ttl = Number(cmsEnv().CMS_CACHE_MS ?? 0) || 0;
  if (memo && ttl > 0 && Date.now() - memo.at < ttl) return memo.site;

  try {
    const res = await fetch(`${base}/v1/site`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const site = (await res.json()) as SiteContent;
    if (!site || !Array.isArray(site.pages)) throw new Error("Snapshot was not in the expected shape");

    // Settings the panel has never been given still need to render.
    const merged: SiteContent = {
      ...site,
      settings: { ...SEED_SITE.settings, ...site.settings },
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
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/v1/blog/${encodeURIComponent(slug)}`, {
      headers: headers(),
      cache: "no-store",
    });
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
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/v1/security/policy`, { headers: headers(), cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as { enabled: boolean; allow: string[] };
  } catch {
    return null;
  }
}
