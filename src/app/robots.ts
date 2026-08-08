import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await getSite();
  const base = site.settings.school.siteUrl.replace(/\/+$/, "");

  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
