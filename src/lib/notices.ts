/**
 * Which notices a parent actually sees.
 *
 * The snapshot carries every published notice, lapsed ones included, because
 * it is only rebuilt when someone saves something in the panel — a notice set
 * to come down on 15 June would otherwise still be up on the 20th if nobody
 * happened to edit the site that week. So the question "has this lapsed?" is
 * asked here, against the day the page is being read.
 */

import { todayInIndia } from "./admissions";
import type { SiteContent, SiteNotice } from "./site";

/** An ISO yyyy-mm-dd as a UTC-midnight stamp, or null if it is not one. */
function isoStamp(value: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? "").trim());
  if (!m) return null;
  const stamp = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(stamp) ? null : stamp;
}

export interface NoticeQuery {
  /** Only these kinds, matched case-insensitively. Empty means every kind. */
  kinds?: string[];
  /** 0 or absent means no limit. */
  limit?: number;
}

/**
 * Notices in the order a notice board is read: pinned first, then newest.
 *
 * Undated notices sort last within their group rather than first — an empty
 * date is missing information, not a very old one.
 */
export function liveNotices(
  site: Pick<SiteContent, "notices">,
  query: NoticeQuery = {},
  now: number = Date.now()
): SiteNotice[] {
  const today = todayInIndia(now);
  const wanted = (query.kinds ?? []).map((k) => k.trim().toLowerCase()).filter(Boolean);

  const live = (site.notices ?? []).filter((n) => {
    // An expiry date is inclusive: a notice that lapses on 15 June is up all
    // of the 15th and gone on the 16th.
    const expires = isoStamp(n.expiresOn);
    if (expires !== null && today > expires) return false;
    return wanted.length === 0 || wanted.includes((n.kind ?? "").trim().toLowerCase());
  });

  const sorted = [...live].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    const at = isoStamp(a.date);
    const bt = isoStamp(b.date);
    if (at === null && bt === null) return 0;
    if (at === null) return 1;
    if (bt === null) return -1;
    return bt - at;
  });

  const limit = Number(query.limit ?? 0) || 0;
  return limit > 0 ? sorted.slice(0, limit) : sorted;
}

/** Every kind currently in use, for the panel's filter and the section form. */
export function noticeKinds(site: Pick<SiteContent, "notices">): string[] {
  return [...new Set((site.notices ?? []).map((n) => n.kind.trim()).filter(Boolean))].sort();
}
