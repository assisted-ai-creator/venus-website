import { Plate, TitleBand, Rule } from "@/components/chart/Plate";
import { Buttons, Intro, RichBody, SectionHeading, links, rows, str } from "./parts";
import type { SectionProps } from "./types";

/** Heading, standfirst and body copy — the workhorse text block. */
export function Prose({ data }: SectionProps) {
  const onPlate = str(data.tone, "dark") === "plate";

  const body = (
    <>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      {str(data.deva) ? (
        <p className="deva on-ground-accent mt-2 text-xl">{str(data.deva)}</p>
      ) : null}
      <Intro className={str(data.heading) ? "mt-4 text-lg" : "text-lg"}>
        {str(data.standfirst)}
      </Intro>
      <RichBody html={str(data.body)} className={str(data.standfirst) || str(data.heading) ? "mt-5" : ""} />
      <Buttons items={links(data.ctas)} className="mt-7" />
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
    return <RichBody html={html} className="prose-chart on-ground-soft" />;
  }

  return (
    <Plate>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}
      <div className="p-6 sm:p-10">
        <RichBody html={html} />
      </div>
    </Plate>
  );
}

/** The name and role that close a director's or principal's message. */
export function Signature({ data }: SectionProps) {
  if (!str(data.name)) return null;
  return (
    <div className="mx-auto max-w-4xl">
      <Rule className="mb-6 rule-ground" />
      <p className="display text-xl on-ground">{str(data.name)}</p>
      {str(data.role) ? <p className="chart-label mt-1 on-ground-faint">{str(data.role)}</p> : null}
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
    <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-14">
      <div>
        <SectionHeading>{str(data.heading)}</SectionHeading>
        <Intro>{str(data.intro)}</Intro>
      </div>

      <Plate>
        {str(data.plateTitle) || str(data.plateNumber) ? (
          <TitleBand plate={str(data.plateNumber) || undefined} tone="navy">
            {str(data.plateTitle)}
          </TitleBand>
        ) : null}
        <ol className="divide-y-2 divide-paper-shade">
          {items.map((t, i) => {
            const quote = str(t.quote).trim();
            return (
              <li key={i} className="flex items-start gap-4 px-5 py-6">
                <span className={`callout-num mt-0.5 flex-none ${quote ? "" : "opacity-50"}`}>{i + 1}</span>
                <span className="flex-1">
                  {quote ? (
                    <>
                      <blockquote className="text-lg leading-relaxed">“{quote}”</blockquote>
                      <p className="chart-label mt-3 text-ink-soft">
                        {str(t.name)}
                        {str(t.name) && str(t.relation) ? " · " : ""}
                        {str(t.relation)}
                      </p>
                    </>
                  ) : (
                    <>
                      <span
                        aria-hidden="true"
                        className="block h-2.5 w-full max-w-[30rem] border-2 border-dashed border-ink/30"
                      />
                      <span
                        aria-hidden="true"
                        className="mt-2 block h-2.5 w-full max-w-[22rem] border-2 border-dashed border-ink/30"
                      />
                      <span className="chart-label mt-3 block text-ink-soft">
                        Awaiting parent testimonial
                      </span>
                    </>
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      </Plate>
    </div>
  );
}

export function VisionMission({ data }: SectionProps) {
  const objectives = rows(data.objectives).map((o) => str(o.text)).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="grid gap-8 md:grid-cols-2">
        <Plate>
          <TitleBand plate="I">{str(data.visionTitle, "Vision")}</TitleBand>
          <p className="p-6 text-lg leading-relaxed sm:p-8">{str(data.vision)}</p>
        </Plate>
        <Plate tone="dark">
          <TitleBand tone="navy" plate="II">
            {str(data.missionTitle, "Mission")}
          </TitleBand>
          <p className="p-6 text-lg leading-relaxed on-ground-soft sm:p-8">{str(data.mission)}</p>
        </Plate>
      </div>

      {objectives.length ? (
        <Plate>
          <TitleBand plate="III">{str(data.objectivesTitle)}</TitleBand>
          <ol className="grid gap-x-10 gap-y-4 p-6 sm:grid-cols-2 sm:p-8">
            {objectives.map((o, i) => (
              <li key={o} className="flex gap-3.5">
                <span className="callout-num callout-num-filled mt-0.5 !h-7 !w-7 !text-[0.75rem]">
                  {i + 1}
                </span>
                <span className="pt-0.5">{o}</span>
              </li>
            ))}
          </ol>
        </Plate>
      ) : null}
    </div>
  );
}
