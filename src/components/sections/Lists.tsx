import Link from "next/link";
import { Plate, TitleBand, Rule } from "@/components/chart/Plate";
import { Icon } from "@/components/chart/Icon";
import { InView } from "@/components/chart/InView";
import { CampusCutaway } from "@/components/diagrams/CampusCutaway";
import { GrowthStages } from "@/components/diagrams/GrowthStages";
import { childPages } from "@/lib/site";
import { thumb } from "@/lib/img";
import { Buttons, Img, Intro, SectionHeading, links, num, rows, str } from "./parts";
import type { SectionProps } from "./types";

const COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/* -------------------------------------------------------- numbered list --- */

export function NumberedList({ data }: SectionProps) {
  const items = rows(data.items);
  if (!items.length) return null;

  const marker = str(data.marker, "numbers");
  const two = str(data.columns, "1") === "2";
  const mark = (i: number) =>
    marker === "letters" ? String.fromCharCode(65 + i) : marker === "none" ? "" : String(i + 1);

  return (
    <Plate>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}
      <ol className={`gap-x-10 gap-y-4 p-5 sm:p-6 ${two ? "grid sm:grid-cols-2" : "space-y-3"}`}>
        {items.map((item, i) => (
          <li key={`${str(item.title)}-${i}`} className="flex gap-3.5">
            {marker !== "none" ? (
              <span
                className={`callout-num mt-0.5 flex-none !h-6 !w-6 !text-[0.7rem] ${
                  marker === "letters" ? "!rounded-none" : ""
                }`}
              >
                {mark(i)}
              </span>
            ) : null}
            <span className="pt-0.5">
              <span className="block text-sm font-semibold">{str(item.title)}</span>
              {str(item.detail) ? (
                <span className="block text-sm text-ink-soft">{str(item.detail)}</span>
              ) : null}
            </span>
          </li>
        ))}
      </ol>
      {str(data.note) ? (
        <p className="border-t-2 border-paper-shade px-5 py-3 text-sm text-ink-soft">{str(data.note)}</p>
      ) : null}
    </Plate>
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
        <InView className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={`${str(s.title)}-${i}`} className="rise" style={{ "--delay": `${i * 100}ms` } as React.CSSProperties}>
              <span className="callout-num callout-num-filled !h-11 !w-11 !text-lg">{i + 1}</span>
              <h3 className="display mt-4 text-xl text-paper">{str(s.title)}</h3>
              {str(s.detail) ? <p className="mt-2 text-sm text-navy-200">{str(s.detail)}</p> : null}
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

      <ul className={`grid ${compact ? "gap-3" : "gap-6"} ${cols} ${str(data.heading) ? "mt-8" : ""}`}>
        {cards.map((c, i) => (
          <li key={`${c.href}-${i}`}>
            {compact ? (
              <Link
                href={c.href || "#"}
                className="plate flex h-full items-center justify-between gap-4 px-4 py-3.5 transition-transform hover:-translate-y-0.5"
              >
                <span className="display text-base">{c.title}</span>
                <Icon name="arrow" size={16} />
              </Link>
            ) : (
              <Link href={c.href || "#"} className="plate group flex h-full flex-col overflow-hidden">
                {c.src ? (
                  <Img
                    src={thumb(c.src)}
                    alt={c.alt || c.title}
                    width={800}
                    height={600}
                    className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                ) : null}
                {c.band || c.plateNumber ? (
                  <TitleBand plate={c.plateNumber || undefined}>{c.band}</TitleBand>
                ) : null}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="display text-2xl">{c.title}</h3>
                  {c.deva ? <p className="deva mt-0.5 text-base text-ink-soft">{c.deva}</p> : null}
                  {c.text ? <p className="mt-3 flex-1 text-sm">{c.text}</p> : null}
                  <span className="chart-label mt-5 inline-flex items-center gap-2 text-amber-ink">
                    {c.title}
                    <Icon name="arrow" size={14} />
                  </span>
                </div>
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
        <InView className="mt-10">
          <GrowthStages />
        </InView>
      ) : diagram === "campus" ? (
        <InView className="mt-10 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <CampusCutaway className="h-auto w-full" />
          <KeyList items={items} />
        </InView>
      ) : items.length ? (
        <InView className="mt-10">
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
    <ol className={`grid gap-x-8 gap-y-5 self-center ${className}`}>
      {items.map((k, i) => (
        <li key={i} className="rise flex gap-4" style={{ "--delay": `${300 + i * 70}ms` } as React.CSSProperties}>
          <span className="callout-num callout-num-filled mt-0.5">{i + 1}</span>
          <span>
            <span className="display block text-lg text-paper">{str(k.label)}</span>
            <span className="text-sm text-navy-200">{str(k.detail)}</span>
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
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      {items.length ? (
        <Plate className={str(data.heading) || str(data.intro) ? "mt-10" : ""}>
          <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
          <ol className="grid sm:grid-cols-2">
            {items.map((f, i) => (
              <li
                key={i}
                className={`flex gap-4 px-5 py-4 ${
                  i < items.length - 1 ? "border-b-2 border-paper-shade" : ""
                } ${i % 2 === 0 ? "sm:border-r-2 sm:border-r-paper-shade" : ""} ${
                  i >= items.length - 2 ? "sm:border-b-0" : ""
                }`}
              >
                <span
                  aria-hidden="true"
                  className="callout-num mt-0.5 !h-7 !w-7 flex-none !rounded-none !text-[0.72rem]"
                >
                  {letter(i)}
                </span>
                <span>
                  <span className="display block text-[1.05rem] leading-tight">
                    {str(f.name)}
                    {str(f.deva) ? (
                      <span className="deva ml-2 text-base font-normal text-amber-ink">{str(f.deva)}</span>
                    ) : null}
                  </span>
                  <span className="mt-1 block text-sm text-ink-soft">{str(f.detail)}</span>
                </span>
              </li>
            ))}
          </ol>
        </Plate>
      ) : null}
    </div>
  );
}

/* ----------------------------------------------------- programme plates --- */

export function ProgrammeStages({ data }: SectionProps) {
  const items = rows(data.items);
  if (!items.length) return null;

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      <div className="mt-10 space-y-8">
        {items.map((p, i) => {
          const src = str(p.src);
          const href = str(p.href);
          const callouts = rows(p.callouts);

          return (
            <InView key={i} as="article" className="plate grid gap-0 overflow-hidden md:grid-cols-[1fr_1.1fr]">
              <div className={i % 2 ? "md:order-2" : ""}>
                {src ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={src}
                    srcSet={`${thumb(src)} 800w, ${src} 1600w`}
                    sizes="(min-width: 768px) 560px, 100vw"
                    alt={str(p.alt)}
                    width={1200}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    className="h-56 w-full object-cover sm:h-72 md:h-full"
                  />
                ) : null}
              </div>

              <div className="flex flex-col">
                <TitleBand plate={str(p.plateNumber) || undefined} tone={i === 1 ? "navy" : "saffron"}>
                  {str(p.band)}
                </TitleBand>
                <div className="flex-1 p-5 sm:p-7">
                  <h3 className="display text-[clamp(1.6rem,3.4vw,2.3rem)]">{str(p.name)}</h3>
                  {str(p.deva) ? <p className="deva mt-1 text-lg text-ink-soft">{str(p.deva)}</p> : null}
                  {str(p.summary) ? <p className="prose-chart mt-3">{str(p.summary)}</p> : null}

                  {callouts.length ? (
                    <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                      {callouts.map((c, n) => (
                        <li
                          key={n}
                          className="rise flex gap-3"
                          style={{ "--delay": `${n * 60}ms` } as React.CSSProperties}
                        >
                          <span className="callout-num mt-0.5 !h-6 !w-6 !text-[0.7rem]">{n + 1}</span>
                          <span>
                            <span className="block text-sm font-semibold">{str(c.label)}</span>
                            <span className="block text-sm text-ink-soft">{str(c.detail)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {href ? (
                    <Link href={href} className="btn btn-ink mt-6 self-start">
                      {str(p.name)}
                      <Icon name="arrow" size={15} />
                    </Link>
                  ) : null}
                </div>
              </div>
            </InView>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------ news panel --- */

export function NewsPanel({ data }: SectionProps) {
  const items = rows(data.items);
  if (!items.length) return null;

  return (
    <Plate tone="dark">
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand tone="navy" plate={str(data.plateNumber) || undefined}>
          {str(data.plateTitle)}
        </TitleBand>
      ) : null}
      <ul className="divide-y-2 divide-navy-700">
        {items.map((n, i) => {
          const date = str(n.date);
          const href = str(n.href);
          const parsed = date ? new Date(date) : null;
          const readable =
            parsed && !Number.isNaN(parsed.getTime())
              ? parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : date;

          return (
            <li key={i} className="p-5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {str(n.kind) ? <span className="chart-label text-saffron">{str(n.kind)}</span> : null}
                {readable ? (
                  <time dateTime={date} className="chart-label tabular text-navy-300">
                    {readable}
                  </time>
                ) : null}
              </div>
              <h3 className="display mt-1.5 text-lg text-paper">
                {href ? (
                  <Link href={href} className="hover:text-saffron">
                    {str(n.title)}
                  </Link>
                ) : (
                  str(n.title)
                )}
              </h3>
              {str(n.body) ? <p className="mt-1 text-sm text-navy-200">{str(n.body)}</p> : null}
            </li>
          );
        })}
      </ul>
    </Plate>
  );
}

/* -------------------------------------------------------- profile cards --- */

export function ProfileCards({ data }: SectionProps) {
  const cards = rows(data.cards);
  if (!cards.length) return null;

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <div className={`mx-auto grid max-w-5xl gap-8 md:grid-cols-2 ${str(data.heading) ? "mt-8" : ""}`}>
        {cards.map((m, i) => {
          const positions = rows(m.positions).map((p) => str(p.text)).filter(Boolean);
          const honours = rows(m.honours).map((h) => str(h.text)).filter(Boolean);

          return (
            <Plate key={i}>
              <TitleBand plate={str(m.plateNumber) || undefined} tone={i % 2 === 0 ? "saffron" : "navy"}>
                {str(m.role)}
              </TitleBand>
              <div className="p-6 sm:p-8">
                {str(m.src) ? (
                  <Img
                    src={thumb(str(m.src))}
                    alt={str(m.alt) || str(m.name)}
                    width={400}
                    height={400}
                    className="mb-5 h-28 w-28 border-2 border-ink object-cover"
                  />
                ) : null}
                <h2 className="display text-2xl">{str(m.name)}</h2>
                {positions.length ? (
                  <ul className="mt-4 space-y-2">
                    {positions.map((p) => (
                      <li key={p} className="flex gap-3 text-sm">
                        <span className="mt-1 flex-none text-amber-ink">
                          <Icon name="chevron" size={11} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {honours.length ? (
                  <>
                    <Rule className="my-6 text-ink opacity-30" />
                    <h3 className="chart-label mb-3 opacity-65">Honours</h3>
                    <ul className="flex flex-wrap gap-2">
                      {honours.map((h) => (
                        <li key={h} className="border-2 border-ink px-2.5 py-1 text-xs font-semibold">
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : null}
              </div>
            </Plate>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- blog list --- */

export function BlogList({ data, site }: SectionProps) {
  const tag = str(data.tag).trim().toLowerCase();
  const limit = num(data.limit, 0);

  let posts = site.posts ?? [];
  if (tag) posts = posts.filter((p) => p.tags?.some((t) => t.toLowerCase() === tag));
  if (limit > 0) posts = posts.slice(0, limit);

  const compact = str(data.variant, "card") === "list";

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <SectionHeading>{str(data.heading)}</SectionHeading>
          <Intro>{str(data.intro)}</Intro>
        </div>
        <Buttons items={links(data.ctas)} />
      </div>

      {posts.length === 0 ? (
        <Plate className={str(data.heading) ? "mt-8 p-6 sm:p-8" : "p-6 sm:p-8"}>
          <p className="chart-label text-ink-soft">No posts have been published yet.</p>
        </Plate>
      ) : compact ? (
        <ul className={`divide-y-2 divide-navy-700 ${str(data.heading) ? "mt-8" : ""}`}>
          {posts.map((p) => (
            <li key={p.slug} className="py-4">
              <Link href={`/blog/${p.slug}`} className="group flex flex-wrap items-baseline gap-x-4">
                <span className="display text-lg text-paper group-hover:text-saffron">{p.title}</span>
                {p.publishedAt ? (
                  <time
                    dateTime={new Date(p.publishedAt).toISOString()}
                    className="chart-label tabular text-navy-300"
                  >
                    {new Date(p.publishedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </time>
                ) : null}
              </Link>
              {p.excerpt ? <p className="mt-1 text-sm text-navy-200">{p.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <ul className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${str(data.heading) ? "mt-8" : ""}`}>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`} className="plate group flex h-full flex-col overflow-hidden">
                {p.cover ? (
                  <span className="relative block aspect-[4/3] overflow-hidden bg-navy-900">
                    <Img
                      src={thumb(p.cover)}
                      alt={p.coverAlt || p.title}
                      width={800}
                      height={600}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </span>
                ) : null}
                <span className="flex flex-1 flex-col border-t-2 border-ink p-4">
                  {p.publishedAt ? (
                    <span className="chart-label tabular opacity-65">
                      {new Date(p.publishedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  ) : null}
                  <span className="display mt-1 text-lg">{p.title}</span>
                  {p.excerpt ? <span className="mt-2 flex-1 text-sm text-ink-soft">{p.excerpt}</span> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
