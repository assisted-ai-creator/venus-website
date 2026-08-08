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
          <h1 className="display text-[clamp(2.6rem,7.5vw,5.4rem)] text-paper">
            {str(data.titleLead)}
            {str(data.titleLead) && str(data.titleHighlight) ? <br /> : null}
            {str(data.titleHighlight) ? (
              <span className="text-saffron">{str(data.titleHighlight)}</span>
            ) : null}
          </h1>

          {str(data.mottoDeva) ? (
            <p className="deva mt-6 text-xl text-navy-100 sm:text-2xl">{str(data.mottoDeva)}</p>
          ) : null}
          {str(data.motto) ? (
            <p className="chart-label mt-1 text-saffron">{str(data.motto)}</p>
          ) : null}

          {str(data.intro) ? (
            <p className="prose-chart mt-7 text-lg text-navy-100">{str(data.intro)}</p>
          ) : null}

          <Buttons items={links(data.ctas)} className="mt-8" />
        </div>

        {slides.length ? <SpecimenSlider slides={slides} /> : null}
      </div>

      {meta.length ? (
        <>
          <Rule className="mt-12 text-navy-700 sm:mt-14" />
          <PublisherBlock className="mt-5 text-navy-200" items={meta} />
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
              <dt className="chart-label text-saffron">{f.label}</dt>
              <dd className="mt-1 text-navy-100">{f.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      <Buttons items={links(data.ctas)} className="mt-8" />
    </div>
  );
}
