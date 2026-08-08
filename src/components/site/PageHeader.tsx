import Link from "next/link";
import { Icon } from "@/components/chart/Icon";
import { PublisherBlock } from "@/components/chart/Plate";

/**
 * Every inner page opens as another sheet in the same chart series: a trail,
 * the sheet's title, and its own numbering block.
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
    <section className="wall border-b-2 border-navy-700">
      <div className="shell py-10 sm:py-14">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {trail.map((t, i) => (
              <li key={t.href} className="flex items-center gap-2">
                {i > 0 ? (
                  <Icon name="chevron" size={10} className="text-navy-300" />
                ) : null}
                {i === trail.length - 1 ? (
                  <span className="chart-label text-saffron" aria-current="page">
                    {t.name}
                  </span>
                ) : (
                  <Link
                    href={t.href}
                    className="chart-label text-navy-200 transition-colors hover:text-saffron"
                  >
                    {t.name}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <h1 className="display mt-6 text-[clamp(2.2rem,6vw,4.2rem)] text-paper">
          {title}
        </h1>
        {deva ? <p className="deva mt-2 text-xl text-saffron">{deva}</p> : null}
        {standfirst ? (
          <p className="prose-chart mt-5 text-lg text-navy-100">{standfirst}</p>
        ) : null}
        {meta?.length ? (
          <PublisherBlock className="mt-8 text-navy-200" items={meta} />
        ) : null}
      </div>
    </section>
  );
}
