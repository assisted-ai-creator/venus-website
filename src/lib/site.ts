/**
 * The published site, as the CMS hands it over.
 *
 * `getSite()` in lib/content.ts returns exactly this shape whether it came
 * from the API or from the in-repo seed, so nothing downstream needs to know
 * which. Every page on the site is a slug plus an ordered list of sections;
 * adding a page in the panel adds a route here without a deployment.
 */

export interface SitePhoto {
  mediaId?: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  kind?: string;
}

export interface SiteLink {
  label: string;
  href: string;
  /** Rendered as a button when set; a plain link otherwise. */
  style?: "primary" | "ghost" | "ink" | "link";
  external?: boolean;
  note?: string;
}

export type SectionGround =
  | "wall"
  | "wall-dense"
  | "navy"
  | "navy-saffron"
  | "plain";

export interface SectionLayout {
  ground?: SectionGround;
  /** `left` and `right` sections pair up into a two-column band. */
  column?: "full" | "left" | "right";
  width?: "wide" | "narrow";
  /** Anchor id, so a nav item or a button can jump straight to this block. */
  anchor?: string;
}

export interface SiteSection {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
  data: Record<string, unknown> & { layout?: SectionLayout };
}

export interface SitePage {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  showInNav: boolean;
  status: string;
  isSystem?: boolean;
  seo: {
    title?: string;
    description?: string;
    image?: string;
    noindex?: boolean;
  };
  header: {
    /** `none` drops the standard sheet header — the home page does this. */
    variant?: "sheet" | "none";
    title?: string;
    deva?: string;
    standfirst?: string;
    meta?: { label: string; value: string }[];
    trail?: { name: string; href: string }[];
  };
  sections: SiteSection[];
}

export interface SiteAlbum {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  cover: string;
  coverAlt: string;
  photos: SitePhoto[];
}

export interface SitePostSummary {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  cover: string;
  coverAlt: string;
  author: string;
  tags: string[];
  publishedAt: number | null;
  updatedAt: number;
  seo?: { title?: string; description?: string };
}

export interface SitePost extends SitePostSummary {
  bodyHtml: string;
}

export interface SchoolSettings {
  name: string;
  shortName: string;
  motto: string;
  mottoDeva: string;
  tagline: string;
  board: string;
  affiliationNo: string;
  schoolCode: string;
  established: string;
  address: {
    line1: string;
    line2: string;
    postcode: string;
    state: string;
    country: string;
    locality: string;
  };
  phones: { label: string; number: string; href: string }[];
  emails: { helpdesk: string; principal: string };
  hours: { days: string; time: string }[];
  social: { youtube: string; facebook: string; instagram?: string };
  registrationUrl: string;
  siteUrl: string;
  map: { query: string; lat: string; lng: string };
  admissionWindow: {
    session: string;
    opens: string;
    closes: string;
    onlineWindow: string;
    officeWindow: string;
    selection: string;
  };
  record: Record<string, string>;
}

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; note?: string }[];
}

export interface FooterSettings {
  blurb: string;
  columns: { heading: string; links: SiteLink[] }[];
  legal: string;
  showSocial: boolean;
}

export interface SeoSettings {
  titleTemplate: string;
  defaultTitle: string;
  description: string;
  keywords: string[];
  ogImage: string;
}

export interface SiteSettings {
  school: SchoolSettings;
  nav: NavItem[];
  footer: FooterSettings;
  seo: SeoSettings;
  security?: { enabled: boolean; allow: string[]; note?: string };
  [key: string]: unknown;
}

export interface SiteContent {
  version: number;
  builtAt: number;
  settings: SiteSettings;
  pages: SitePage[];
  albums: SiteAlbum[];
  posts: SitePostSummary[];
  /** True when the API could not be reached and the in-repo seed is showing. */
  fallback?: boolean;
}

/* ------------------------------------------------------------- lookups --- */

export const pageBySlug = (site: SiteContent, slug: string): SitePage | undefined =>
  site.pages.find((p) => p.slug === slug);

export const albumBySlug = (site: SiteContent, slug: string): SiteAlbum | undefined =>
  site.albums.find((a) => a.slug === slug);

/** Direct children of a slug prefix — `academics` returns `academics/primary` etc. */
export function childPages(site: SiteContent, parent: string): SitePage[] {
  const prefix = `${parent.replace(/\/+$/, "")}/`;
  return site.pages.filter(
    (p) => p.slug.startsWith(prefix) && !p.slug.slice(prefix.length).includes("/")
  );
}
