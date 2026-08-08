import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSite } from "@/lib/content";
import { albumBySlug } from "@/lib/site";
import { PageHeader } from "@/components/site/PageHeader";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { Icon } from "@/components/chart/Icon";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSite();
  const album = albumBySlug(site, slug);
  if (!album) return {};

  return {
    title: album.title,
    description:
      album.description ||
      `${album.title} — ${album.photos.length} photographs from ${site.settings.school.name}.`,
    alternates: { canonical: `/gallery/${album.slug}` },
    openGraph: album.cover ? { images: [{ url: album.cover }] } : undefined,
  };
}

export default async function AlbumPage({ params }: Params) {
  const { slug } = await params;
  const site = await getSite();
  const album = albumBySlug(site, slug);
  if (!album) notFound();

  const i = site.albums.findIndex((a) => a.slug === slug);
  const next = site.albums[(i + 1) % Math.max(site.albums.length, 1)];

  const meta = [
    ...(album.category ? [{ label: "Category", value: album.category }] : []),
    { label: "Photographs", value: String(album.photos.length) },
    ...(album.date ? [{ label: "Date", value: album.date }] : []),
  ];

  return (
    <>
      <PageHeader
        title={album.title}
        standfirst={album.description || undefined}
        trail={[
          { name: "Home", href: "/" },
          { name: "Gallery", href: "/gallery" },
          { name: album.title, href: `/gallery/${album.slug}` },
        ]}
        meta={meta}
      />

      <section className="wall wall-dense">
        <div className="shell py-14 sm:py-20">
          {album.photos.length ? (
            <PhotoGrid photos={album.photos} />
          ) : (
            <p className="chart-label on-ground-soft">This album has no photographs yet.</p>
          )}

          <nav
            aria-label="Other albums"
            className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 keyline-ground pt-7"
          >
            <Link href="/gallery" className="btn btn-ghost">
              <Icon name="chevron" size={13} className="rotate-180" />
              All albums
            </Link>
            {next && next.slug !== album.slug ? (
              <Link href={`/gallery/${next.slug}`} className="btn btn-ghost">
                {next.title}
                <Icon name="chevron" size={13} />
              </Link>
            ) : null}
          </nav>
        </div>
      </section>
    </>
  );
}
