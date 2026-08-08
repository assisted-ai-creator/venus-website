/**
 * Content schema for Venus World Schools.
 *
 * Every page renders from these shapes and nothing else. The admin panel that
 * comes later writes exactly these objects — so adding an academics page, a
 * gallery album or a news item never requires touching a component.
 *
 * `PLACEHOLDER` marks content the school must supply before launch. Anything
 * carrying it renders as a visible "awaiting copy" state, never as fiction.
 */

export type Placeholder = { readonly PLACEHOLDER: true; readonly awaiting: string };

export const awaiting = (what: string): Placeholder => ({
  PLACEHOLDER: true,
  awaiting: what,
});

export const isPlaceholder = (v: unknown): v is Placeholder =>
  typeof v === "object" && v !== null && "PLACEHOLDER" in v;

/** A numbered callout on a leader line — the world's core annotation. */
export interface Callout {
  n: number;
  label: string;
  detail?: string;
  /** Percentage coordinates within the diagram viewBox, for the leader line. */
  at?: { x: number; y: number };
}

export interface Photo {
  src: string;
  alt: string;
  caption?: string;
}

export interface Program {
  slug: string;
  /** Chart plate number, e.g. "PLATE II". */
  plate: string;
  name: string;
  deva?: string;
  grades: string;
  /** Compact form of `grades`, for title bands too narrow for the full list. */
  shortGrades: string;
  ages?: string;
  hours?: string;
  summary: string;
  body: string[];
  callouts: Callout[];
  photo?: Photo;
}

export interface StaticPage {
  slug: string;
  plate: string;
  title: string;
  deva?: string;
  standfirst?: string;
  body: string[];
  signature?: { name: string; role: string };
  photo?: Photo;
}

export interface Album {
  slug: string;
  title: string;
  category: string;
  date?: string;
  cover: string;
  photos: Photo[];
}

export interface VideoItem {
  title: string;
  youtubeId: string;
  date?: string;
}

export interface NewsItem {
  slug: string;
  date: string;
  kind: "Notice" | "Achievement" | "Admission" | "Event";
  title: string;
  body: string;
  href?: string;
}

export interface Facility {
  n: number;
  name: string;
  deva?: string;
  detail: string;
}

export interface Testimonial {
  quote: string | Placeholder;
  name: string | Placeholder;
  relation: string | Placeholder;
}

export interface ResultRow {
  year: string;
  registered: number | Placeholder;
  passPercent: number | Placeholder;
}
