import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { pageBySlug, type SitePage } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionList } from "@/components/sections";

/**
 * Every page on the site.
 *
 * A page is a slug and an ordered list of sections, so adding one in the panel
 * adds a real URL here with no deployment. Explicit routes — /gallery/[slug]
 * and /blog/[slug] — are more specific and are matched before this.
 */

interface Params {
  params: Promise<{ slug?: string[] }>;
}

const slugOf = (segments?: string[]) => (segments ?? []).join("/");

/** The trail printed at the top of an inner sheet, derived from the slug. */
function trailFor(page: SitePage, pages: SitePage[]) {
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

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite();
  const page = pageBySlug(site, slugOf(slug));
  if (!page) return {};

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

export default async function CmsPage({ params }: Params) {
  const { slug } = await params;
  const site = await getSite();
  const page = pageBySlug(site, slugOf(slug));

  if (!page || page.status !== "published") notFound();

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
