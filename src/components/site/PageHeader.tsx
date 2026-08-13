import Link from "next/link";

/**
 * Every inner page opens the same way: the trail printed as the eyebrow, the
 * title set at masthead scale, one standfirst paragraph, and the page's own
 * filing line ruled off beneath it.
 *
 * The trail doubles as the section label — the last entry is the page you are
 * on — so the opener carries a breadcrumb without spending a second line on
 * one.
 */
export function PageHeader({
  title,
  deva,
  standfirst,
  trail,
  meta,
}: {
  title: string;
  deva?: string;
  standfirst?: string;
  trail: { name: string; href: string }[];
  meta?: { label: string; value: string }[];
}) {
  return (
    <section className="wall">
      <div className="shell pt-[clamp(2.5rem,5vw,4.5rem)] pb-[clamp(2.25rem,4vw,3.5rem)]">
        {trail.length ? (
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              {trail.map((t, i) => (
                <li key={t.href} className="flex items-center gap-2.5">
                  {i > 0 ? (
                    <span aria-hidden="true" className="chart-label text-hairline">
                      /
                    </span>
                  ) : null}
                  {i === trail.length - 1 ? (
                    <span className="eyebrow" aria-current="page">
                      {t.name}
                    </span>
                  ) : (
                    <Link
                      href={t.href}
                      className="chart-label text-ink-faint transition-colors hover:text-navy-700"
                    >
                      {t.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <h1 className="display mt-5 max-w-[15ch] text-[clamp(2.5rem,4.6vw,4.25rem)] leading-[1.06] tracking-[-0.022em] on-ground">
          {title}
        </h1>
        {deva ? <p className="deva mt-2.5 text-xl on-ground-accent">{deva}</p> : null}
        {standfirst ? (
          <p className="mt-6 max-w-[56ch] text-[1.15rem] leading-[1.65] text-ink-soft text-pretty">
            {standfirst}
          </p>
        ) : null}

        {meta?.length ? (
          <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-3 border-t border-hairline pt-5">
            {meta.map((m) => (
              <div key={m.label} className="flex gap-2.5">
                <dt className="chart-label text-ink-faint">{m.label}</dt>
                <dd className="chart-label tabular text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
