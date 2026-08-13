import { SpecimenSlider } from "@/components/site/SpecimenSlider";
import { Buttons, links, photo, rows, str } from "./parts";
import type { SectionProps } from "./types";

/**
 * The first viewport: a split sheet. The claim and the two things a parent can
 * do about it on one side, the school itself on the other.
 *
 * It is rendered edge to edge by the section list, which is why the padding is
 * carried here rather than by the band — the photograph has to reach the right
 * margin of the window for the split to read as one printed spread.
 */
export function Hero({ data, site }: SectionProps) {
  const slides = rows(data.slides).map(photo).filter((p) => p.src);
  const meta = rows(data.meta).map((m) => ({ label: str(m.label), value: str(m.value) }));
  const school = site.settings.school;

  // The standing line above the title: board, place, year. What the school is,
  // before what it claims — and all three are checkable.
  const standing = [
    school.board,
    school.address.locality,
    school.established ? `Established ${school.established}` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <div className="grid min-h-[min(40rem,72vh)] grid-cols-1 border-b border-hairline lg:grid-cols-2">
        <div className="flex items-center justify-start px-[var(--gutter)] py-[clamp(3.5rem,7vw,6rem)] lg:justify-end">
          <div className="max-w-[37.5rem]">
            {standing ? <p className="eyebrow">{standing}</p> : null}

            <h1 className="display mt-5 text-[clamp(2.6rem,4.9vw,4.75rem)] leading-[1.04] tracking-[-0.022em] text-ink">
              {str(data.titleLead)}
              {str(data.titleLead) && str(data.titleHighlight) ? " " : null}
              {str(data.titleHighlight)}
            </h1>

            {str(data.mottoDeva) ? (
              <p className="deva mt-5 text-xl text-ink-soft">{str(data.mottoDeva)}</p>
            ) : null}

            {str(data.intro) ? (
              <p className="mt-7 max-w-[52ch] text-[1.12rem] leading-[1.7] text-ink-soft text-pretty">
                {str(data.intro)}
              </p>
            ) : null}

            <Buttons items={links(data.ctas)} className="mt-9" />
          </div>
        </div>

        {slides.length ? (
          <SpecimenSlider slides={slides} />
        ) : (
          <div aria-hidden="true" className="min-h-[26rem] bg-image-bed" />
        )}
      </div>

      {/* The registration line, printed across the foot of the spread the way
          a prospectus carries its imprint. */}
      {meta.length ? (
        <div className="border-b border-hairline">
          <div className="shell flex flex-wrap gap-x-12 gap-y-3 py-5">
            {meta.map((m) => (
              <div key={m.label} className="flex gap-2.5">
                <span className="chart-label text-ink-faint">{m.label}</span>
                <span className="chart-label tabular text-ink">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

/**
 * The closing band: one claim, the reason to act on it, and the two ways to do
 * so. Printed on navy so it reads as the end of the sheet rather than another
 * section of it.
 */
export function CtaBand({ data }: SectionProps) {
  const facts = rows(data.facts).map((f) => ({ label: str(f.label), value: str(f.value) }));

  return (
    <div className="on-ink bg-navy-900 px-[clamp(1.5rem,4vw,3.5rem)] py-[clamp(2.75rem,5vw,4.5rem)]">
      {/*
        Flex rather than a column grid: this band is used both across a page and
        inside one half of a split, and a two-column grid that only knows the
        viewport would set the narrow case in two 15ch columns.
      */}
      <div className="flex flex-wrap items-start gap-x-[clamp(2rem,4vw,4rem)] gap-y-8">
        <h2 className="display max-w-[16ch] flex-[1_1_20rem] text-[clamp(1.75rem,3.2vw,2.75rem)] leading-[1.12] tracking-[-0.018em] text-white">
          {str(data.heading)}
        </h2>

        <div className="flex-[1_1_22rem]">
          {str(data.intro) ? (
            <p className="max-w-[46ch] text-[1.06rem] leading-[1.75] text-navy-200 text-pretty">
              {str(data.intro)}
            </p>
          ) : null}

          {facts.length ? (
            <dl className="mt-8 grid gap-x-10 gap-y-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,13rem),1fr))]">
              {facts.map((f) => (
                <div key={f.label} className="border-t border-navy-750 pt-3.5">
                  <dt className="chart-label text-navy-300">{f.label}</dt>
                  <dd className="tabular mt-1.5 text-[0.97rem] text-white">{f.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          <Buttons items={links(data.ctas)} className="mt-9" />
        </div>
      </div>
    </div>
  );
}
