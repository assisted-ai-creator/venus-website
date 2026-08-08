import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/chart/Icon";
import type { SiteLink, SitePhoto } from "@/lib/site";

/* ----------------------------------------------------------------- data --- */

/**
 * Section data arrives as untyped JSON from the panel, so each reader coerces
 * rather than asserts. A field the school has not filled in yet must render as
 * nothing, never as `undefined` on the page.
 */
export const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : typeof v === "number" ? String(v) : fallback;

export const num = (v: unknown, fallback = 0): number => {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export const bool = (v: unknown, fallback = false): boolean =>
  typeof v === "boolean" ? v : fallback;

export const rows = (v: unknown): Record<string, unknown>[] =>
  Array.isArray(v) ? v.filter((x): x is Record<string, unknown> => !!x && typeof x === "object") : [];

export const links = (v: unknown): SiteLink[] =>
  rows(v)
    .map((l) => ({
      label: str(l.label),
      href: str(l.href),
      style: (str(l.style, "ghost") as SiteLink["style"]) ?? "ghost",
    }))
    .filter((l) => l.label && l.href);

export const photo = (v: Record<string, unknown>): SitePhoto => ({
  mediaId: str(v.mediaId) || undefined,
  src: str(v.src),
  alt: str(v.alt),
  caption: str(v.caption) || undefined,
  width: v.width ? num(v.width) : undefined,
  height: v.height ? num(v.height) : undefined,
});

const isExternal = (href: string) => /^https?:\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

/* -------------------------------------------------------------- controls --- */

const BTN_CLASS: Record<string, string> = {
  primary: "btn btn-primary",
  ghost: "btn btn-ghost",
  ink: "btn btn-ink",
  link: "chart-label inline-flex items-center gap-2 underline underline-offset-2",
};

export function Btn({ link, className = "" }: { link: SiteLink; className?: string }) {
  const cls = `${BTN_CLASS[link.style ?? "ghost"] ?? BTN_CLASS.ghost} ${className}`.trim();
  const body = (
    <>
      {link.label}
      <Icon name="arrow" size={15} />
    </>
  );

  if (isExternal(link.href)) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={cls}>
        {body}
      </a>
    );
  }
  return (
    <Link href={link.href} className={cls}>
      {body}
    </Link>
  );
}

export function Buttons({ items, className = "" }: { items: SiteLink[]; className?: string }) {
  if (!items.length) return null;
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((l, i) => (
        <Btn key={`${l.href}-${i}`} link={l} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- type --- */

/**
 * A heading that keeps its scale whether it opens a page or sits mid-page.
 *
 * It no longer takes a tone: `.on-ground` resolves against whatever band or
 * plate it lands on, so the same heading sets correctly on white, on amber and
 * on blue without the caller having to know where it is.
 */
export function SectionHeading({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return (
    <h2 className={`display on-ground text-[clamp(1.9rem,4.5vw,3.1rem)] ${className}`}>
      {children}
    </h2>
  );
}

export function Intro({
  children,
  className = "mt-4",
}: {
  children: ReactNode;
  className?: string;
}) {
  if (!children) return null;
  return <p className={`prose-chart on-ground-soft ${className}`}>{children}</p>;
}

/**
 * Editor HTML.
 *
 * The API sanitises on the way in — allowlisted tags only, no scripts, no
 * inline handlers, embeds limited to YouTube, Vimeo and Google Maps — so what
 * reaches here has already been through a real HTML parser. `.rich` in
 * globals.css gives it the chart's typography.
 */
export function RichBody({ html, className = "" }: { html: string; className?: string }) {
  if (!html?.trim()) return null;
  return <div className={`rich ${className}`} dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ---------------------------------------------------------------- images --- */

export function Img({
  src,
  alt,
  width,
  height,
  className = "",
  sizes,
  priority = false,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!src) return null;
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 900}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
