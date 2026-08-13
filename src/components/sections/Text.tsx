import { Plate, TitleBand, Rule } from "@/components/chart/Plate";
import { Buttons, Intro, RichBody, SectionHeading, links, rows, str } from "./parts";
import type { SectionProps } from "./types";

/** Heading, standfirst and body copy — the workhorse text block. */
export function Prose({ data }: SectionProps) {
  const onPlate = str(data.tone, "dark") === "plate";
  const heading = str(data.heading);
  const standfirst = str(data.standfirst);

  const body = (
    <>
      <SectionHeading>{heading}</SectionHeading>
      {str(data.deva) ? (
        <p className="deva mt-2.5 text-xl on-ground-accent">{str(data.deva)}</p>
      ) : null}

      {/* The standfirst is set in the serif, one size under the heading: it is
          the sentence the section is about, not an introduction to one. */}
      {standfirst ? (
        <p
          className={`display max-w-[38ch] text-[clamp(1.35rem,2.2vw,1.75rem)] leading-[1.4] on-ground ${
            heading ? "mt-6" : ""
          }`}
        >
          {standfirst}
        </p>
      ) : null}

      <RichBody html={str(data.body)} className={standfirst || heading ? "mt-7" : ""} />
      <Buttons items={links(data.ctas)} className="mt-9" />
    </>
  );

  return onPlate ? <Plate className="p-6 sm:p-9">{body}</Plate> : <div>{body}</div>;
}

/**
 * The editor's own output, given a plate to sit on. This is the block that
 * covers anything the typed sections do not — the school is never stuck.
 */
export function RichText({ data }: SectionProps) {
  const html = str(data.body);
  if (!html.trim()) return null;

  if (!(data.plated ?? true)) {
    return <RichBody html={html} />;
  }

  return (
    <Plate>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}
      <div className="p-6 sm:p-9">
        <RichBody html={html} />
      </div>
    </Plate>
  );
}

/** The name and role that close a director's or principal's message. */
export function Signature({ data }: SectionProps) {
  if (!str(data.name)) return null;
  return (
    <div className="max-w-4xl border-t border-hairline pt-5">
      <p className="text-[0.97rem] font-semibold on-ground">{str(data.name)}</p>
      {str(data.role) ? (
        <p className="mt-1 text-[0.92rem] on-ground-faint">{str(data.role)}</p>
      ) : null}
    </div>
  );
}

export function SectionRule({ data }: SectionProps) {
  const gap = { tight: "my-4", normal: "my-10", loose: "my-16" }[str(data.spacing, "normal")] ?? "my-10";
  return <Rule className={`${gap} rule-ground`} />;
}

/**
 * Parent voices.
 *
 * A slot with no quote prints as a visibly reserved line rather than as
 * invented copy — the rule PRODUCT.md sets for this section, enforced here so
 * an empty field can never become a fabricated testimonial.
 */
export function Testimonials({ data }: SectionProps) {
  const items = rows(data.items);
  if (!items.length) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-[clamp(2.5rem,5vw,5rem)]">
      <div>
        <SectionHeading>{str(data.heading)}</SectionHeading>
        <Intro>{str(data.intro)}</Intro>
      </div>

      <ol className="border-t border-rule-strong">
        {items.map((t, i) => {
          const quote = str(t.quote).trim();
          return (
            <li key={i} className="flex gap-5 border-b border-paper-shade py-6">
              <span className="callout-num pt-1">{String(i + 1).padStart(2, "0")}</span>
              <div className="flex-1">
                {quote ? (
                  <>
                    <blockquote className="display text-[1.2rem] leading-[1.5] on-ground">
                      “{quote}”
                    </blockquote>
                    <p className="chart-label mt-3.5 on-ground-faint">
                      {str(t.name)}
                      {str(t.name) && str(t.relation) ? " · " : ""}
                      {str(t.relation)}
                    </p>
                  </>
                ) : (
                  <>
                    <span
                      aria-hidden="true"
                      className="block h-2 w-full max-w-[30rem] border-y border-dashed border-paper-shade"
                    />
                    <span
                      aria-hidden="true"
                      className="mt-2.5 block h-2 w-full max-w-[22rem] border-y border-dashed border-paper-shade"
                    />
                    <span className="chart-label mt-3.5 block on-ground-faint">
                      Awaiting parent testimonial
                    </span>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function VisionMission({ data }: SectionProps) {
  const objectives = rows(data.objectives).map((o) => str(o.text)).filter(Boolean);

  return (
    <div>
      <div className="grid gap-[clamp(2rem,4vw,4rem)] md:grid-cols-2">
        <div className="border-t-2 border-navy-700 pt-6">
          <p className="chart-label text-navy-700">{str(data.visionTitle, "Vision")}</p>
          <p className="display mt-4 text-[1.3rem] leading-[1.5] on-ground">{str(data.vision)}</p>
        </div>
        <div className="border-t-2 border-saffron pt-6">
          <p className="chart-label text-amber-ink">{str(data.missionTitle, "Mission")}</p>
          <p className="display mt-4 text-[1.3rem] leading-[1.5] on-ground">{str(data.mission)}</p>
        </div>
      </div>

      {objectives.length ? (
        <>
          {str(data.objectivesTitle) ? (
            <h3 className="display mt-[clamp(3rem,6vw,5rem)] text-[clamp(1.45rem,2.6vw,2rem)] leading-[1.2] on-ground">
              {str(data.objectivesTitle)}
            </h3>
          ) : null}
          <ol className="mt-7 grid gap-x-[clamp(1.75rem,4vw,3.5rem)] sm:grid-cols-2 lg:grid-cols-3">
            {objectives.map((o, i) => (
              <li key={o} className="flex gap-4 border-t border-paper-shade py-4">
                <span className="callout-num pt-0.5">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-[0.97rem] leading-[1.6] on-ground-soft">{o}</span>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </div>
  );
}
