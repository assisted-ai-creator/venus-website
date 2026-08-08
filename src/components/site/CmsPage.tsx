import type { Metadata } from "next";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionList } from "@/components/sections";
import type { SiteContent, SitePage } from "@/lib/site";

/**
 * A CMS page, rendered.
 *
 * Lives here rather than in the catch-all route because the explicit routes
 * are matched first and have to be able to hand back: /gallery/<slug> is an
 * album if one exists by that name, and a page filed under Gallery in the
 * panel if not. Without that, adding a page under an explicit route in the
 * panel would produce a URL that 404s with nothing to say why.
 */

/** The trail printed at the top of an inner sheet, derived from the slug. */
export function trailFor(page: SitePage, pages: SitePage[]) {
  if (page.header.trail?.length) return page.header.trail;
  if (!page.slug) return [];

  const parts = page.slug.split("/");
  const trail = [{ name: "Home", href: "/" }];
  for (let i = 0; i < parts.length; i++) {
    const slug = parts.slice(0, i + 1).join("/");
    const match = pages.find((p) => p.slug === slug);
    trail.push({
      name: match?.navLabel || match?.title || parts[i].replace(/-/g, " "),
      href: `/${slug}`,
    });
  }
  return trail;
}

export function cmsMetadata(page: SitePage, site: SiteContent): Metadata {
  const canonical = page.slug ? `/${page.slug}` : "/";

  // The home page carries the site title whole; inner sheets run through the
  // "%s — Venus World Schools" template set on the layout.
  const title = page.slug
    ? page.seo.title || page.title
    : { absolute: page.seo.title || site.settings.seo.defaultTitle };

  return {
    title,
    description: page.seo.description || page.header.standfirst,
    alternates: { canonical },
    openGraph: page.seo.image ? { images: [{ url: page.seo.image }] } : undefined,
    robots: page.seo.noindex ? { index: false, follow: true } : undefined,
  };
}

export function CmsPageView({ page, site }: { page: SitePage; site: SiteContent }) {
  const showHeader = page.header.variant !== "none";

  return (
    <>
      {showHeader ? (
        <PageHeader
          title={page.header.title || page.title}
          deva={page.header.deva}
          standfirst={page.header.standfirst}
          trail={trailFor(page, site.pages)}
          meta={page.header.meta}
        />
      ) : null}

      <SectionList sections={page.sections} site={site} />
    </>
  );
}
