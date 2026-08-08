/**
 * Whether the admission window is actually open, today.
 *
 * The panel holds the window as free text a school secretary can type —
 * "1 January 2026", "15 Jun 2026" — because that is what gets printed on the
 * strip. So the dates are read back with a tolerant parser rather than a date
 * picker, and anything unreadable falls through to `unknown`, where the site
 * keeps saying what the school wrote instead of guessing.
 *
 * Dates are judged in India Standard Time. The site is read from Pune; a
 * window that closes on 15 June closes at midnight there, not at midnight UTC.
 */

import type { SchoolSettings } from "./site";

export type AdmissionState = "open" | "upcoming" | "closed" | "unknown";

export interface AdmissionStatus {
  state: AdmissionState;
  /** The strip's headline. */
  label: string;
  /** The dates line printed beside it, when there is one worth printing. */
  detail: string;
  /** False once the window has closed — the Register buttons come down with it. */
  showRegister: boolean;
}

const MONTHS = [
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
];

/** IST has no daylight saving, so a fixed offset is the whole of it. */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * A written date as a UTC midnight stamp, or null if it cannot be read.
 *
 * Handles the forms a person actually types — "15 June 2026", "1 Jan 2026",
 * "15th June 2026", "June 15, 2026" — and ISO, which is what a future date
 * field in the panel would send.
 */
function parseWrittenDate(value: string): number | null {
  const raw = (value ?? "").trim();
  if (!raw) return null;

  const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(raw);
  if (iso) return Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const tokens = raw
    .toLowerCase()
    .replace(/(\d)(st|nd|rd|th)\b/g, "$1")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  let day: number | null = null;
  let month: number | null = null;
  let year: number | null = null;

  for (const token of tokens) {
    if (/^\d{4}$/.test(token)) {
      if (year === null) year = Number(token);
      continue;
    }
    if (/^\d{1,2}$/.test(token)) {
      if (day === null) day = Number(token);
      continue;
    }
    if (month === null && token.length >= 3) {
      const index = MONTHS.findIndex((name) => name.startsWith(token));
      if (index >= 0) month = index;
    }
  }

  if (day === null || month === null || year === null) return null;
  if (day < 1 || day > 31) return null;

  const stamp = Date.UTC(year, month, day);
  // Rejects the impossible — "31 February 2026" rolls over to March.
  return new Date(stamp).getUTCDate() === day ? stamp : null;
}

/**
 * Today in Pune, as the same kind of UTC-midnight stamp.
 *
 * Exported because notices lapse on the same clock this window closes on, and
 * a school reading "expired" a day early because the server is on UTC is the
 * bug both are avoiding.
 */
export function todayInIndia(now: number): number {
  const shifted = new Date(now + IST_OFFSET_MS);
  return Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate());
}

/**
 * The window's state, and the words the header prints for it.
 *
 * The closing date is inclusive: a window that closes on 15 June is open all
 * of 15 June and closed from the 16th.
 */
export function admissionStatus(
  window: SchoolSettings["admissionWindow"],
  now: number = Date.now()
): AdmissionStatus {
  const session = window?.session?.trim() ?? "";
  const opens = window?.opens?.trim() ?? "";
  const closes = window?.closes?.trim() ?? "";
  const suffix = session ? ` · ${session}` : "";
  const span = opens && closes ? `${opens} – ${closes}` : opens || closes;

  const today = todayInIndia(now);
  const opensOn = parseWrittenDate(opens);
  const closesOn = parseWrittenDate(closes);

  if (closesOn !== null && today > closesOn) {
    return {
      state: "closed",
      label: `Admissions closed${suffix}`,
      detail: `Registration closed ${closes}`,
      showRegister: false,
    };
  }

  if (opensOn !== null && today < opensOn) {
    return {
      state: "upcoming",
      label: `Registration opens ${opens}${suffix}`,
      detail: closes ? `Closes ${closes}` : "",
      showRegister: true,
    };
  }

  return {
    // With neither date readable the site says what the school wrote and
    // nothing more — the same strip it printed before this check existed.
    state: opensOn === null && closesOn === null ? "unknown" : "open",
    label: `Admissions open${suffix}`,
    detail: span,
    showRegister: true,
  };
}
