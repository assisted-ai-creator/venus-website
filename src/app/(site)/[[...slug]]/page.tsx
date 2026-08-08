import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { pageBySlug } from "@/lib/site";
import { CmsPageView, cmsMetadata } from "@/components/site/CmsPage";

/**
 * Every page on the site.
 *
 * A page is a slug and an ordered list of sections, so adding one in the panel
 * adds a real URL here with no deployment. Explicit routes — /gallery/[slug]
 * and /blog/[slug] — are more specific and are matched before this; each of
 * them falls back to a CMS page when its own lookup finds nothing.
 */

interface Params {
  params: Promise<{ slug?: string[] }>;
}

const slugOf = (segments?: string[]) => (segments ?? []).join("/");

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite();
  const page = pageBySlug(site, slugOf(slug));
  return page ? cmsMetadata(page, site) : {};
}

export default async function CmsPage({ params }: Params) {
  const { slug } = await params;
  const site = await getSite();
  const page = pageBySlug(site, slugOf(slug));

  if (!page || page.status !== "published") notFound();

  return <CmsPageView page={page} site={site} />;
}
