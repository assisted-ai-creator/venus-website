import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

// Rendered per request: a page added in the panel must appear here without a
// redeploy, which a build-time snapshot could not do.
export const dynamic = "force-dynamic";

/** Built from the published snapshot, so a page added in the panel is indexed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await getSite();
  const base = site.settings.school.siteUrl.replace(/\/+$/, "");
  const now = new Date();

  const priorityFor = (slug: string) => {
    if (!slug) return 1;
    if (slug === "admissions" || slug === "contact") return 0.9;
    return slug.includes("/") ? 0.5 : 0.7;
  };

  return [
    ...site.pages
      .filter((p) => p.status === "published" && !p.seo.noindex)
      .map((p) => ({
        url: `${base}/${p.slug}`.replace(/\/$/, "/"),
        priority: priorityFor(p.slug),
        changeFrequency: (p.slug ? "monthly" : "weekly") as "monthly" | "weekly",
        lastModified: now,
      })),
    ...site.albums.map((a) => ({
      url: `${base}/gallery/${a.slug}`,
      priority: 0.4,
      changeFrequency: "monthly" as const,
      lastModified: now,
    })),
    ...site.posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      priority: 0.5,
      changeFrequency: "monthly" as const,
      lastModified: p.publishedAt ? new Date(p.publishedAt) : now,
    })),
  ];
}
