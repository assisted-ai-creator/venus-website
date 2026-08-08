import { Rule, PublisherBlock } from "@/components/chart/Plate";
import { SpecimenSlider } from "@/components/site/SpecimenSlider";
import { Buttons, Intro, SectionHeading, links, photo, rows, str } from "./parts";
import type { SectionProps } from "./types";

/** The first viewport: the chart, hung. */
export function Hero({ data }: SectionProps) {
  const slides = rows(data.slides).map(photo).filter((p) => p.src);
  const meta = rows(data.meta).map((m) => ({ label: str(m.label), value: str(m.value) }));

  return (
    <div className="relative">
      <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14">
        <div>
          <h1 className="display text-[clamp(2.6rem,7.5vw,5.4rem)] on-ground">
            {str(data.titleLead)}
            {str(data.titleLead) && str(data.titleHighlight) ? <br /> : null}
            {str(data.titleHighlight) ? (
              <span className="on-ground-accent">{str(data.titleHighlight)}</span>
            ) : null}
          </h1>

          {str(data.mottoDeva) ? (
            <p className="deva mt-6 text-xl on-ground-soft sm:text-2xl">{str(data.mottoDeva)}</p>
          ) : null}
          {str(data.motto) ? (
            <p className="chart-label mt-1 on-ground-accent">{str(data.motto)}</p>
          ) : null}

          {str(data.intro) ? (
            <p className="prose-chart mt-7 text-lg on-ground-soft">{str(data.intro)}</p>
          ) : null}

          <Buttons items={links(data.ctas)} className="mt-8" />
        </div>

        {slides.length ? <SpecimenSlider slides={slides} /> : null}
      </div>

      {meta.length ? (
        <>
          <Rule className="mt-12 rule-ground sm:mt-14" />
          <PublisherBlock className="mt-5 on-ground-soft" items={meta} />
        </>
      ) : null}
    </div>
  );
}

/** A band carrying a heading, a short fact list and the buttons that follow it. */
export function CtaBand({ data }: SectionProps) {
  const facts = rows(data.facts).map((f) => ({ label: str(f.label), value: str(f.value) }));

  return (
    <div>
      <SectionHeading>{str(data.heading)}</SectionHeading>
      <Intro>{str(data.intro)}</Intro>

      {facts.length ? (
        <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {facts.map((f) => (
            <div key={f.label}>
              <dt className="chart-label on-ground-accent">{f.label}</dt>
              <dd className="mt-1 on-ground-soft">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <Buttons items={links(data.ctas)} className="mt-8" />
    </div>
  );
}
