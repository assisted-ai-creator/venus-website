import Link from "next/link";
import { Icon } from "@/components/chart/Icon";
import { InView } from "@/components/chart/InView";
import { CampusCutaway } from "@/components/diagrams/CampusCutaway";
import { GrowthStages } from "@/components/diagrams/GrowthStages";
import { childPages } from "@/lib/site";
import { liveNotices } from "@/lib/notices";
import { thumb } from "@/lib/img";
import { Buttons, Img, Intro, SectionHeading, links, num, rows, str } from "./parts";
import type { SectionProps } from "./types";

const COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/**
 * The four coding inks, in the order the register bar prints them. A run of
 * cards or steps takes them in turn, so the colour is an index rather than a
 * decoration — the same key the header and footer strips use.
 */
const KEY_INKS = ["#ffab1f", "#c8321e", "#0b4b8f", "#1b6e4a"];
const ink = (i: number) => KEY_INKS[i % KEY_INKS.length];

/** "01", "02" — the filing index printed beside a list entry. */
const index2 = (i: number) => String(i + 1).padStart(2, "0");

/* -------------------------------------------------------- numbered list --- */

export function NumberedList({ data }: SectionProps) {
  const items = rows(data.items);
  if (!items.length) return null;

  const marker = str(data.marker, "numbers");
  const two = str(data.columns, "1") === "2";
  const mark = (i: number) =>
    marker === "letters" ? String.fromCharCode(65 + i) : marker === "none" ? "" : index2(i);

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

      <ol className={`grid gap-x-[clamp(1.75rem,4vw,3.5rem)] ${two ? "sm:grid-cols-2" : ""}`}>
        {items.map((item, i) => (
          <li
            key={`${str(item.title)}-${i}`}
            className="flex gap-4 border-t border-paper-shade py-4"
          >
            {marker !== "none" ? <span className="callout-num pt-1">{mark(i)}</span> : null}
            <span className="flex-1">
              <span className="block text-[0.99rem] font-semibold on-ground">{str(item.title)}</span>
              {str(item.detail) ? (
                <span className="mt-1 block text-[0.95rem] leading-[1.6] on-ground-soft">
                  {str(item.detail)}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>

      {str(data.note) ? (
        <p className="mt-5 text-[0.88rem] leading-[1.6] on-ground-faint">{str(data.note)}</p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- steps --- */

export function Steps({ data }: SectionProps) {
  const steps = rows(data.steps);

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      {steps.length ? (
        <InView
          className={`grid gap-[clamp(1.5rem,3vw,2.75rem)] sm:grid-cols-2 lg:grid-cols-4 ${
            str(data.heading) || str(data.intro) ? "mt-[clamp(2rem,4vw,3.25rem)]" : ""
          }`}
        >
          {steps.map((s, i) => (
            <div
              key={`${str(s.title)}-${i}`}
              className="rise border-t-2 pt-5.5"
              style={{ "--delay": `${i * 90}ms`, borderTopColor: ink(i) } as React.CSSProperties}
            >
              <span className="chart-label tabular on-ground-faint">Step {index2(i)}</span>
              <h3 className="display-sm mt-3 text-[1.32rem] on-ground">{str(s.title)}</h3>
              {str(s.detail) ? (
                <p className="mt-2.5 text-[0.95rem] leading-[1.7] on-ground-soft">{str(s.detail)}</p>
              ) : null}
            </div>
          ))}
        </InView>
      ) : null}

      <Buttons items={links(data.ctas)} className="mt-10" />
    </div>
  );
}

/* ------------------------------------------------------------ card grid --- */

interface Card {
  title: string;
  deva: string;
  band: string;
  plateNumber: string;
  text: string;
  src: string;
  alt: string;
  href: string;
}

export function CardGrid({ data, site }: SectionProps) {
  const cards: Card[] =
    str(data.source, "manual") === "childPages"
      ? childPages(site, str(data.parent)).map((p) => ({
          title: p.header.title || p.title,
          deva: p.header.deva ?? "",
          band: p.header.meta?.[0]?.value ?? "",
          plateNumber: "",
          text: p.header.standfirst ?? "",
          src: "",
          alt: "",
          href: `/${p.slug}`,
        }))
      : rows(data.cards).map((c) => ({
          title: str(c.title),
          deva: str(c.deva),
          band: str(c.band),
          plateNumber: str(c.plateNumber),
          text: str(c.text),
          src: str(c.src),
          alt: str(c.alt),
          href: str(c.href),
        }));

  if (!cards.length) return null;
  const compact = str(data.variant, "card") === "link";
  const cols = COLS[str(data.columns, "3")] ?? COLS["3"];

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      <ul
        className={`grid ${compact ? "gap-x-10" : "gap-[clamp(1.5rem,3vw,2.75rem)]"} ${cols} ${
          str(data.heading) || str(data.intro) ? "mt-[clamp(2rem,4vw,3.5rem)]" : ""
        }`}
      >
        {cards.map((c, i) => (
          <li key={`${c.href}-${i}`} className={compact ? "border-t border-paper-shade" : ""}>
            {compact ? (
              <Link
                href={c.href || "#"}
                className="group flex items-center justify-between gap-4 py-4 on-ground transition-colors hover-accent"
              >
                <span className="display-sm text-[1.05rem]">{c.title}</span>
                <Icon name="arrow" size={15} className="flex-none opacity-60" />
              </Link>
            ) : (
              <Link href={c.href || "#"} className="group block on-ground transition-colors hover-accent">
                {c.src ? (
                  <span className="block overflow-hidden bg-image-bed">
                    <Img
                      src={thumb(c.src)}
                      alt={c.alt || c.title}
                      width={800}
                      height={600}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </span>
                ) : null}

                {c.band || c.plateNumber ? (
                  <span className="mt-5 flex items-center gap-2.5">
                    <i
                      aria-hidden="true"
                      className="block h-[3px] w-5.5 flex-none"
                      style={{ background: ink(i) }}
                    />
                    <span className="chart-label on-ground-faint">
                      {[c.band, c.plateNumber].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                ) : null}

                <span className={`display-sm block text-[1.45rem] ${c.band || c.src ? "mt-3" : ""}`}>
                  {c.title}
                </span>
                {c.deva ? <span className="deva mt-1 block text-base on-ground-faint">{c.deva}</span> : null}
                {c.text ? (
                  <span className="mt-2.5 block text-[0.95rem] leading-[1.7] on-ground-soft">
                    {c.text}
                  </span>
                ) : null}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----------------------------------------------------------- callout key --- */

export function CalloutKey({ data }: SectionProps) {
  const items = rows(data.items);
  const diagram = str(data.diagram, "campus");

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      {diagram === "growth" ? (
        <InView className="mt-[clamp(2rem,4vw,3.25rem)]">
          <GrowthStages />
        </InView>
      ) : diagram === "campus" ? (
        <InView className="mt-[clamp(2rem,4vw,3.25rem)] grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-[clamp(2.5rem,5vw,4.5rem)]">
          <CampusCutaway className="h-auto w-full" />
          <KeyList items={items} />
        </InView>
      ) : items.length ? (
        <InView className="mt-[clamp(2rem,4vw,3.25rem)]">
          <KeyList items={items} className="sm:grid-cols-2 lg:grid-cols-3" />
        </InView>
      ) : null}
    </div>
  );
}

function KeyList({
  items,
  className = "sm:grid-cols-2 lg:grid-cols-1",
}: {
  items: Record<string, unknown>[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <ol className={`grid gap-x-8 self-center ${className}`}>
      {items.map((k, i) => (
        <li
          key={i}
          className="rise flex gap-4 border-t border-paper-shade py-3.5"
          style={{ "--delay": `${300 + i * 70}ms` } as React.CSSProperties}
        >
          <span className="callout-num pt-1">{index2(i)}</span>
          <span>
            <span className="display-sm block text-[1.05rem] on-ground">{str(k.label)}</span>
            <span className="text-[0.92rem] leading-[1.6] on-ground-soft">{str(k.detail)}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/* --------------------------------------------------------- facility key --- */

export function FacilityKeySection({ data }: SectionProps) {
  const items = rows(data.items);
  const letter = (n: number) => String.fromCharCode(65 + n);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
        <SectionHeading>{str(data.heading)}</SectionHeading>
        {str(data.plateTitle) || str(data.plateNumber) ? (
          <p className="chart-label on-ground-faint">
            {[str(data.plateTitle), str(data.plateNumber)].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>
      <Intro>{str(data.intro)}</Intro>

      {items.length ? (
        <ol
          className={`grid gap-x-[clamp(1.75rem,4vw,3.5rem)] sm:grid-cols-2 ${
            str(data.heading) || str(data.intro) ? "mt-[clamp(2rem,4vw,3.25rem)]" : ""
          }`}
        >
          {items.map((f, i) => (
            <li key={i} className="flex gap-4 border-t border-paper-shade py-4">
              <span aria-hidden="true" className="callout-num pt-1">
                {letter(i)}
              </span>
              <span>
                <span className="display-sm block text-[1.05rem] on-ground">
                  {str(f.name)}
                  {str(f.deva) ? (
                    <span className="deva ml-2.5 text-[0.95rem] font-normal on-ground-accent">
                      {str(f.deva)}
                    </span>
                  ) : null}
                </span>
                <span className="mt-1 block text-[0.92rem] leading-[1.6] on-ground-soft">
                  {str(f.detail)}
                </span>
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------- programme stages --- */

/** The three stages, as one row of open cards — no boxes, no borders. */
export function ProgrammeStages({ data }: SectionProps) {
  const items = rows(data.items);
  if (!items.length) return null;

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      <InView
        className={`grid gap-[clamp(1.5rem,3vw,2.75rem)] sm:grid-cols-2 lg:grid-cols-3 ${
          str(data.heading) || str(data.intro) ? "mt-[clamp(2.25rem,4vw,3.5rem)]" : ""
        }`}
      >
        {items.map((p, i) => {
          const src = str(p.src);
          const href = str(p.href);
          const callouts = rows(p.callouts);

          const body = (
            <>
              {src ? (
                <span className="block overflow-hidden bg-image-bed">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={thumb(src)}
                    srcSet={`${thumb(src)} 800w, ${src} 1600w`}
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    alt={str(p.alt)}
                    width={800}
                    height={600}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </span>
              ) : null}

              {str(p.band) ? (
                <span className="mt-5 flex items-center gap-2.5">
                  <i
                    aria-hidden="true"
                    className="block h-[3px] w-5.5 flex-none"
                    style={{ background: ink(i) }}
                  />
                  <span className="chart-label on-ground-faint">{str(p.band)}</span>
                </span>
              ) : null}

              <span className="display-sm mt-3 block text-[1.6rem] font-medium">{str(p.name)}</span>
              {str(p.deva) ? (
                <span className="deva mt-1 block text-base on-ground-faint">{str(p.deva)}</span>
              ) : null}
              {str(p.summary) ? (
                <span className="mt-2.5 block text-[0.95rem] leading-[1.7] on-ground-soft">
                  {str(p.summary)}
                </span>
              ) : null}
            </>
          );

          return (
            <article
              key={i}
              className="rise"
              style={{ "--delay": `${i * 90}ms` } as React.CSSProperties}
            >
              {href ? (
                <Link href={href} className="group block on-ground transition-colors hover-accent">
                  {body}
                </Link>
              ) : (
                <div className="on-ground">{body}</div>
              )}

              {callouts.length ? (
                <ul className="mt-5">
                  {callouts.map((c, n) => (
                    <li key={n} className="flex gap-3.5 border-t border-paper-shade py-2.5">
                      <span className="callout-num pt-0.5">{index2(n)}</span>
                      <span className="flex-1">
                        <span className="block text-[0.9rem] font-semibold on-ground">
                          {str(c.label)}
                        </span>
                        {str(c.detail) ? (
                          <span className="block text-[0.88rem] leading-[1.55] on-ground-soft">
                            {str(c.detail)}
                          </span>
                        ) : null}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          );
        })}
      </InView>
    </div>
  );
}

/* ------------------------------------------------------------ news panel --- */

/** The shape typed inline into a block, and the shape the notice board publishes. */
interface PanelNotice {
  title: string;
  kind: string;
  date: string;
  body: string;
  href: string;
  pinned: boolean;
  file: { url: string; filename: string; size: number } | null;
}

const KB = 1024;

/** "1.4 MB" — so a parent on mobile data knows the cost before tapping. */
function fileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < KB * KB) return `${Math.max(1, Math.round(bytes / KB))} KB`;
  return `${(bytes / (KB * KB)).toFixed(1)} MB`;
}

/** Notices are coded by kind, in the same four inks the register bar uses. */
const KIND_INK: Record<string, string> = {
  admission: "#0b4b8f",
  achievement: "#1b6e4a",
  event: "#c8321e",
  notice: "#8a4b00",
};

export function NewsPanel({ data, site }: SectionProps) {
  const inline = rows(data.items);

  // `source` post-dates this block, so a section saved before the notice board
  // existed has no value for it. Absent means whatever that block already had:
  // a filled list keeps printing, an empty one takes the board.
  const source = str(data.source) || (inline.length ? "manual" : "board");

  const items: PanelNotice[] =
    source === "manual"
      ? inline.map((n) => ({
          title: str(n.title),
          kind: str(n.kind),
          date: str(n.date),
          body: str(n.body),
          href: str(n.href),
          pinned: false,
          file: null,
        }))
      : liveNotices(site, {
          kinds: rows(data.kinds).map((k) => str(k.kind)),
          limit: num(data.limit, 0),
        }).map((n) => ({
          title: n.title,
          kind: n.kind,
          date: n.date,
          body: n.body,
          href: n.href,
          pinned: n.pinned,
          file: n.file ? { url: n.file.url, filename: n.file.filename, size: n.file.size } : null,
        }));

  const empty = str(data.emptyText);
  const ctas = links(data.ctas);

  // A board with nothing current on it says so rather than vanishing: a parent
  // who came looking for notices needs to be told they have all lapsed, not
  // left wondering whether the page failed to load. Left blank, it vanishes.
  if (!items.length && !(source === "board" && empty)) return null;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-3 border-b-2 border-ink pb-4">
        <h2 className="display text-[clamp(1.5rem,2.8vw,2.25rem)] leading-[1.1] on-ground">
          {str(data.plateTitle, "Notices")}
        </h2>
        {ctas.length ? (
          <Link href={ctas[0].href} className="chart-label on-ground-accent hover-accent">
            {ctas[0].label}
          </Link>
        ) : str(data.plateNumber) ? (
          <p className="chart-label on-ground-faint">{str(data.plateNumber)}</p>
        ) : null}
      </div>

      {items.length ? (
        <ul>
          {items.map((n, i) => {
            const parsed = n.date ? new Date(n.date) : null;
            const readable =
              parsed && !Number.isNaN(parsed.getTime())
                ? parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                : n.date;
            const kindInk = KIND_INK[n.kind.toLowerCase()] ?? "#0b4b8f";

            const heading = (
              <span className="display-sm block text-[1.18rem] on-ground">{n.title}</span>
            );

            return (
              <li key={`${n.title}-${i}`} className="border-b border-hairline last:border-b-0">
                <div className="grid gap-x-6 gap-y-2 py-6 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                  <div className="pt-1">
                    {readable ? (
                      <time dateTime={n.date} className="chart-label tabular block on-ground-faint">
                        {readable}
                      </time>
                    ) : null}
                    {n.kind ? (
                      <span className="chart-label mt-1.5 block" style={{ color: kindInk }}>
                        {n.kind}
                      </span>
                    ) : null}
                    {/* Named, not merely coloured — the marker has to survive
                        greyscale and a screen reader. */}
                    {n.pinned ? (
                      <span className="chart-label mt-1.5 inline-block border border-current px-1.5 on-ground-faint">
                        Pinned
                      </span>
                    ) : null}
                  </div>

                  <div>
                    {n.href ? (
                      <Link href={n.href} className="group block on-ground transition-colors hover-accent">
                        {heading}
                      </Link>
                    ) : (
                      heading
                    )}

                    {n.body ? (
                      <p className="mt-2 text-[0.95rem] leading-[1.65] on-ground-soft">{n.body}</p>
                    ) : null}

                    {n.file ? (
                      <a
                        href={n.file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chart-label mt-3 inline-flex items-center gap-2 on-ground-accent hover-accent"
                      >
                        <Icon name="arrow" size={12} />
                        {n.file.filename || "Open the attachment"}
                        {fileSize(n.file.size) ? (
                          <span className="tabular on-ground-faint">{fileSize(n.file.size)}</span>
                        ) : null}
                      </a>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="py-6 text-[0.95rem] on-ground-soft">{empty}</p>
      )}
    </div>
  );
}

/* -------------------------------------------------------- profile cards --- */

export function ProfileCards({ data }: SectionProps) {
  const cards = rows(data.cards);
  if (!cards.length) return null;

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      <div
        className={`grid gap-[clamp(1.75rem,4vw,3.5rem)] md:grid-cols-2 ${
          str(data.heading) || str(data.intro) ? "mt-[clamp(2.25rem,4vw,3.5rem)]" : ""
        }`}
      >
        {cards.map((m, i) => {
          const positions = rows(m.positions).map((p) => str(p.text)).filter(Boolean);
          const honours = rows(m.honours).map((h) => str(h.text)).filter(Boolean);

          return (
            <div key={i} className="border-t-2 border-ink pt-6">
              {str(m.src) ? (
                <Img
                  src={thumb(str(m.src))}
                  alt={str(m.alt) || str(m.name)}
                  width={400}
                  height={400}
                  className="mb-5 h-24 w-24 object-cover"
                />
              ) : null}

              <h3 className="display text-[1.6rem] font-medium on-ground">{str(m.name)}</h3>
              {str(m.role) ? <p className="chart-label mt-2 on-ground-accent">{str(m.role)}</p> : null}

              {positions.length ? (
                <ul className="mt-5.5 grid gap-2.5">
                  {positions.map((p) => (
                    <li key={p} className="text-[0.97rem] leading-[1.6] on-ground-soft">
                      {p}
                    </li>
                  ))}
                </ul>
              ) : null}

              {honours.length ? (
                <>
                  <p className="chart-label mt-6 mb-2 on-ground-faint">Honours</p>
                  <p className="text-[0.95rem] leading-[1.7] on-ground-soft">
                    {honours.join(" · ")}
                  </p>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- blog list --- */

const readableDate = (value: number) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function BlogList({ data, site }: SectionProps) {
  const tag = str(data.tag).trim().toLowerCase();
  const limit = num(data.limit, 0);

  let posts = site.posts ?? [];
  if (tag) posts = posts.filter((p) => p.tags?.some((t) => t.toLowerCase() === tag));
  if (limit > 0) posts = posts.slice(0, limit);

  const compact = str(data.variant, "card") === "list";
  const spaced = str(data.heading) || str(data.intro) ? "mt-[clamp(2.25rem,4vw,3.5rem)]" : "";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <SectionHeading>{str(data.heading)}</SectionHeading>
          <Intro>{str(data.intro)}</Intro>
        </div>
        <Buttons items={links(data.ctas)} />
      </div>

      {posts.length === 0 ? (
        <p className={`chart-label on-ground-faint ${spaced || "mt-6"}`}>
          No posts have been published yet.
        </p>
      ) : compact ? (
        <ul className={`border-t border-rule-strong ${spaced}`}>
          {posts.map((p) => (
            <li key={p.slug} className="border-b border-paper-shade py-5">
              <Link href={`/blog/${p.slug}`} className="group block on-ground transition-colors hover-accent">
                <span className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <span className="display-sm text-[1.15rem]">{p.title}</span>
                  {p.publishedAt ? (
                    <time
                      dateTime={new Date(p.publishedAt).toISOString()}
                      className="chart-label tabular on-ground-faint"
                    >
                      {readableDate(p.publishedAt)}
                    </time>
                  ) : null}
                </span>
              </Link>
              {p.excerpt ? (
                <p className="mt-1.5 text-[0.95rem] leading-[1.65] on-ground-soft">{p.excerpt}</p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <ul className={`grid gap-[clamp(1.5rem,3vw,2.5rem)] sm:grid-cols-2 lg:grid-cols-3 ${spaced}`}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="group block on-ground transition-colors hover-accent">
                {p.cover ? (
                  <span className="block overflow-hidden bg-image-bed">
                    <Img
                      src={thumb(p.cover)}
                      alt={p.coverAlt || p.title}
                      width={800}
                      height={600}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </span>
                ) : null}
                <span className="block pt-5">
                  {p.publishedAt ? (
                    <span className="chart-label tabular block on-ground-faint">
                      {readableDate(p.publishedAt)}
                    </span>
                  ) : null}
                  <span className="display-sm mt-2 block text-[1.2rem]">{p.title}</span>
                  {p.excerpt ? (
                    <span className="mt-2 block text-[0.95rem] leading-[1.65] on-ground-soft">
                      {p.excerpt}
                    </span>
                  ) : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
