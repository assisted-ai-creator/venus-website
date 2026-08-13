import Link from "next/link";
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
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <SectionHeading>{str(data.heading)}</SectionHeading>
          <Intro>{str(data.intro)}</Intro>
        </div>
        <Buttons items={links(data.ctas)} />
      </div>

      {albums.length === 0 ? (
        <p className="chart-label mt-6 on-ground-faint">No albums have been published yet.</p>
      ) : (
        categories.map((cat) => {
          const inGroup = grouped ? albums.filter((a) => (a.category || "Albums") === cat) : albums;
          return (
            <div key={cat} className="mb-[clamp(2.5rem,5vw,4.5rem)] last:mb-0">
              {grouped ? (
                <h3 className="display mt-[clamp(2rem,4vw,3.25rem)] text-[clamp(1.45rem,2.8vw,2.15rem)] on-ground">
                  {cat}
                </h3>
              ) : null}
              <ul
                className={`grid gap-[clamp(1rem,2vw,1.625rem)] sm:grid-cols-2 lg:grid-cols-3 ${
                  grouped ? "mt-6" : "mt-[clamp(2rem,4vw,3.25rem)]"
                }`}
              >
                {inGroup.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/gallery/${a.slug}`}
                      className="group block on-ground transition-colors hover-accent"
                    >
                      <span className="block overflow-hidden bg-image-bed">
                        <Img
                          src={thumb(a.cover)}
                          alt={a.coverAlt || a.title}
                          width={800}
                          height={1000}
                          className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </span>
                      <span className="mt-3.5 block text-[0.97rem] font-semibold">{a.title}</span>
                      <span className="chart-label mt-1 block on-ground-faint">
                        {a.category ? `${a.category} · ` : ""}
                        {a.photos.length} photograph{a.photos.length === 1 ? "" : "s"}
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
        <div className={str(data.heading) ? "mt-[clamp(2rem,4vw,3.25rem)]" : ""}>
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
      <ul
        className={`grid gap-[clamp(1rem,2vw,1.625rem)] ${cols} ${
          str(data.heading) ? "mt-[clamp(2rem,4vw,3.25rem)]" : ""
        }`}
      >
        {photos.map((p, i) => (
          <li key={i}>
            <figure>
              <span className="block overflow-hidden bg-image-bed">
                <Img
                  src={thumb(p.src)}
                  alt={p.alt}
                  width={p.width ?? 800}
                  height={p.height ?? 600}
                  className="aspect-[4/3] w-full object-cover"
                />
              </span>
              {p.caption ? (
                <figcaption className="chart-label mt-3 on-ground-faint">{p.caption}</figcaption>
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
    <figure>
      <span className="block overflow-hidden bg-image-bed">
        <Img
          src={src}
          alt={str(data.alt)}
          width={data.width ? num(data.width) : 1600}
          height={data.height ? num(data.height) : 1200}
          className={`w-full object-cover ${ratio}`}
        />
      </span>
      {str(data.caption) ? (
        <figcaption className="chart-label mt-3 on-ground-faint">{str(data.caption)}</figcaption>
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
    <div>
      {str(data.plateTitle) ? (
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
          <SectionHeading>{str(data.plateTitle)}</SectionHeading>
          {str(data.plateNumber) ? (
            <p className="chart-label on-ground-faint">{str(data.plateNumber)}</p>
          ) : null}
        </div>
      ) : null}

      {videos.length ? (
        <ul className="grid gap-[clamp(1.25rem,3vw,2.25rem)] sm:grid-cols-2">
          {videos.map((v) => (
            <li key={v.youtubeId}>
              <div className="aspect-video overflow-hidden bg-image-bed">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.youtubeId)}`}
                  title={v.title || "School film"}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="h-full w-full border-0"
                />
              </div>
              {v.title ? <p className="chart-label mt-3 on-ground-faint">{v.title}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <Intro className="">{str(data.intro)}</Intro>
      )}

      {str(data.channelUrl) ? (
        <a
          href={str(data.channelUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary mt-8"
        >
          {str(data.channelLabel, "Open the school channel")}
          <Icon name="arrow" size={14} />
        </a>
      ) : null}
    </div>
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
        <div className="mb-[clamp(2rem,4vw,3.25rem)]">
          <SectionHeading>{heading}</SectionHeading>
          <Intro>{str(data.intro)}</Intro>
        </div>
      ) : null}

      <ul className={`grid gap-[clamp(1.25rem,3vw,2.25rem)] ${cols}`}>
        {items.map((item, i) => (
          <li key={`${item.url}-${i}`}>
            <figure>
              {item.embed ? (
                <div className={`${EMBED_SHAPE[item.embed.shape]} w-full overflow-hidden bg-image-bed`}>
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
                <div className="border border-hairline p-5">
                  <p className="chart-label on-ground-faint">Not a YouTube or Instagram address</p>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 block break-all text-sm on-ground-accent underline underline-offset-2"
                  >
                    {item.url}
                  </a>
                </div>
              )}

              {item.title || item.caption || item.embed ? (
                <figcaption className="pt-4">
                  {item.title ? (
                    <span className="display-sm block text-[1.1rem] on-ground">{item.title}</span>
                  ) : null}
                  {item.caption ? (
                    <span className="mt-1 block text-[0.92rem] leading-[1.6] on-ground-soft">
                      {item.caption}
                    </span>
                  ) : null}
                  {item.embed ? (
                    <a
                      href={item.embed.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="chart-label mt-2.5 inline-flex items-center gap-2 on-ground-accent hover-accent"
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
