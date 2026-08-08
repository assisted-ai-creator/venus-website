import Link from "next/link";
import { Plate, TitleBand } from "@/components/chart/Plate";
import { Icon } from "@/components/chart/Icon";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { thumb } from "@/lib/img";
import type { SiteAlbum } from "@/lib/site";
import { Buttons, Img, Intro, SectionHeading, links, num, photo, rows, str } from "./parts";
import type { SectionProps } from "./types";

/* ---------------------------------------------------------- album grid --- */

export function GalleryGrid({ data, site }: SectionProps) {
  const mode = str(data.mode, "all");
  const limit = num(data.limit, 0);

  let albums: SiteAlbum[] = site.albums ?? [];
  if (mode === "category") {
    const wanted = str(data.category).toLowerCase();
    albums = albums.filter((a) => a.category.toLowerCase() === wanted);
  } else if (mode === "selected") {
    const wanted = rows(data.albumSlugs).map((s) => str(s.slug));
    albums = wanted.map((slug) => albums.find((a) => a.slug === slug)).filter((a): a is SiteAlbum => !!a);
  }
  if (limit > 0) albums = albums.slice(0, limit);

  const grouped = (data.groupByCategory ?? true) && mode !== "category";
  const categories = grouped ? [...new Set(albums.map((a) => a.category || "Albums"))] : [""];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <SectionHeading>{str(data.heading)}</SectionHeading>
          <Intro>{str(data.intro)}</Intro>
        </div>
        <Buttons items={links(data.ctas)} />
      </div>

      {albums.length === 0 ? (
        <Plate className={str(data.heading) ? "mt-8 p-6" : "p-6"}>
          <p className="chart-label text-ink-soft">No albums have been published yet.</p>
        </Plate>
      ) : (
        categories.map((cat) => {
          const inGroup = grouped ? albums.filter((a) => (a.category || "Albums") === cat) : albums;
          return (
            <div key={cat} className="mb-14 last:mb-0">
              {grouped ? (
                <h3 className="display mt-10 text-[clamp(1.6rem,3.6vw,2.4rem)] text-paper">{cat}</h3>
              ) : null}
              <ul className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${grouped ? "mt-7" : "mt-10"}`}>
                {inGroup.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/gallery/${a.slug}`} className="plate group block overflow-hidden">
                      <span className="relative block aspect-[4/3] overflow-hidden bg-navy-900">
                        <Img
                          src={thumb(a.cover)}
                          alt={a.coverAlt || a.title}
                          width={800}
                          height={600}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      </span>
                      <span className="flex items-center justify-between gap-3 border-t-2 border-ink px-4 py-3">
                        <span>
                          <span className="display block text-lg">{a.title}</span>
                          <span className="chart-label block opacity-70">
                            {a.photos.length} photograph{a.photos.length === 1 ? "" : "s"}
                          </span>
                        </span>
                        <Icon name="arrow" size={16} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}

/* --------------------------------------------------------- photograph row --- */

export function PhotoStrip({ data }: SectionProps) {
  const photos = rows(data.photos).map(photo).filter((p) => p.src);
  if (!photos.length) return null;

  if (data.lightbox ?? true) {
    return (
      <div>
        <SectionHeading>{str(data.heading)}</SectionHeading>
        <div className={str(data.heading) ? "mt-8" : ""}>
          <PhotoGrid photos={photos} />
        </div>
      </div>
    );
  }

  const cols =
    { "2": "sm:grid-cols-2", "3": "sm:grid-cols-2 lg:grid-cols-3", "4": "sm:grid-cols-2 lg:grid-cols-4" }[
      str(data.columns, "3")
    ] ?? "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <ul className={`grid gap-5 ${cols} ${str(data.heading) ? "mt-8" : ""}`}>
        {photos.map((p, i) => (
          <li key={i}>
            <figure className="plate overflow-hidden">
              <Img
                src={thumb(p.src)}
                alt={p.alt}
                width={p.width ?? 800}
                height={p.height ?? 600}
                className="aspect-[4/3] w-full object-cover"
              />
              {p.caption ? (
                <figcaption className="chart-label border-t-2 border-ink px-4 py-2.5">{p.caption}</figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------------------------------------------- one photo --- */

const RATIO: Record<string, string> = {
  "4/3": "aspect-[4/3]",
  "16/9": "aspect-[16/9]",
  "1/1": "aspect-square",
};

export function ImagePlate({ data }: SectionProps) {
  const src = str(data.src);
  if (!src) return null;
  const ratio = RATIO[str(data.ratio, "auto")] ?? "";

  return (
    <figure className="plate overflow-hidden">
      <Img
        src={src}
        alt={str(data.alt)}
        width={data.width ? num(data.width) : 1600}
        height={data.height ? num(data.height) : 1200}
        className={`w-full object-cover ${ratio}`}
      />
      {str(data.caption) ? (
        <figcaption className="chart-label border-t-2 border-ink px-4 py-2.5">{str(data.caption)}</figcaption>
      ) : null}
    </figure>
  );
}

/* ------------------------------------------------------------ video panel --- */

export function VideoPanel({ data }: SectionProps) {
  const videos = rows(data.videos)
    .map((v) => ({ title: str(v.title), youtubeId: str(v.youtubeId).trim() }))
    .filter((v) => v.youtubeId);

  return (
    <Plate tone="dark">
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand tone="navy" plate={str(data.plateNumber) || undefined}>
          {str(data.plateTitle)}
        </TitleBand>
      ) : null}
      <div className="p-6 sm:p-8">
        {videos.length ? (
          <ul className="grid gap-6 sm:grid-cols-2">
            {videos.map((v) => (
              <li key={v.youtubeId}>
                <div className="aspect-video overflow-hidden border-2 border-navy-300 bg-navy-900">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtubeId)}`}
                    title={v.title || "School film"}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
                {v.title ? <p className="chart-label mt-2.5 text-navy-100">{v.title}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="prose-chart text-navy-100">{str(data.intro)}</p>
        )}

        {str(data.channelUrl) ? (
          <a
            href={str(data.channelUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-6"
          >
            <Icon name="play" size={14} filled />
            {str(data.channelLabel, "Open the school channel")}
          </a>
        ) : null}
      </div>
    </Plate>
  );
}
