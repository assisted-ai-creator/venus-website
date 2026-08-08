import Link from "next/link";
import { Plate, TitleBand } from "@/components/chart/Plate";
import { Icon } from "@/components/chart/Icon";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { thumb } from "@/lib/img";
import { parseEmbed, type Embed } from "@/lib/embeds";
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
                <h3 className="display mt-10 text-[clamp(1.6rem,3.6vw,2.4rem)] on-ground">{cat}</h3>
              ) : null}
              <ul className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${grouped ? "mt-7" : "mt-10"}`}>
                {inGroup.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/gallery/${a.slug}`} className="plate group block overflow-hidden">
                      <span className="relative block aspect-[4/3] overflow-hidden bg-navy-100">
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
    // The field is named for an id but a pasted watch address is what usually
    // arrives, so both are read.
    .map((v) => ({ title: str(v.title), embed: parseEmbed(str(v.youtubeId)) }))
    .filter((v): v is { title: string; embed: Embed } => v.embed?.provider === "youtube")
    .map((v) => ({ title: v.title, youtubeId: v.embed.id }));

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
                <div className="aspect-video overflow-hidden border-2 border-ink bg-navy-100">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtubeId)}`}
                    title={v.title || "School film"}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full border-0"
                  />
                </div>
                {v.title ? <p className="chart-label mt-2.5 on-ground-soft">{v.title}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="prose-chart on-ground-soft">{str(data.intro)}</p>
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

/* ------------------------------------------------------------ embed panel --- */

const EMBED_COLUMNS: Record<string, string> = {
  "1": "",
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
};

/** Reels are shot portrait; films and posts are not. */
const EMBED_SHAPE: Record<Embed["shape"], string> = {
  landscape: "aspect-video",
  portrait: "aspect-[9/16]",
};

const PROVIDER_LABEL: Record<Embed["provider"], string> = {
  youtube: "Watch on YouTube",
  instagram: "Open on Instagram",
};

/**
 * Films and reels, wherever the school wants them.
 *
 * Each entry is one pasted address. An address that is not a YouTube film or
 * an Instagram reel or post is printed as a plain link rather than framed:
 * the school can put anything in the field, but only these two hosts are ever
 * loaded into the page.
 */
export function EmbedPanel({ data }: SectionProps) {
  const items = rows(data.items)
    .map((v) => ({
      url: str(v.url).trim(),
      title: str(v.title),
      caption: str(v.caption),
      embed: parseEmbed(str(v.url)),
    }))
    .filter((v) => v.url);

  if (!items.length) return null;

  const cols = EMBED_COLUMNS[str(data.columns, "2")] ?? EMBED_COLUMNS["2"];
  const heading = str(data.heading);

  return (
    <div>
      {heading || str(data.intro) ? (
        <div className="mb-8">
          <SectionHeading>{heading}</SectionHeading>
          <Intro>{str(data.intro)}</Intro>
        </div>
      ) : null}

      <ul className={`grid gap-6 ${cols}`}>
        {items.map((item, i) => (
          <li key={`${item.url}-${i}`}>
            <figure className="plate overflow-hidden">
              {item.embed ? (
                <div
                  className={`${EMBED_SHAPE[item.embed.shape]} w-full overflow-hidden border-b-2 border-ink bg-navy-100`}
                >
                  <iframe
                    src={item.embed.src}
                    title={item.title || (item.embed.provider === "youtube" ? "School film" : "School reel")}
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    scrolling="no"
                    className="h-full w-full border-0"
                  />
                </div>
              ) : (
                <div className="border-b-2 border-ink p-5">
                  <p className="chart-label text-ink-soft">Not a YouTube or Instagram address</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 block break-all text-sm underline"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {item.title || item.caption || item.embed ? (
                <figcaption className="px-4 py-3">
                  {item.title ? <span className="display block text-lg">{item.title}</span> : null}
                  {item.caption ? (
                    <span className="mt-0.5 block text-sm text-ink-soft">{item.caption}</span>
                  ) : null}
                  {item.embed ? (
                    <a
                      href={item.embed.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chart-label mt-2 inline-flex items-center gap-1.5 text-ink-soft transition-colors hover:text-ink"
                    >
                      {PROVIDER_LABEL[item.embed.provider]}
                      <Icon name="arrow" size={12} />
                    </a>
                  ) : null}
                </figcaption>
              ) : null}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  );
}
