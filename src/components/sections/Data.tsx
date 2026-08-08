import { Plate, TitleBand, Rule } from "@/components/chart/Plate";
import { Icon } from "@/components/chart/Icon";
import { Buttons, Intro, SectionHeading, links, rows, str } from "./parts";
import type { SectionProps } from "./types";

/** The filed record: a grid of headline figures with the source printed under it. */
export function StatPlate({ data }: SectionProps) {
  const stats = rows(data.stats);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.25fr] lg:gap-16">
      <div>
        <SectionHeading>{str(data.heading)}</SectionHeading>
        <Intro>{str(data.intro)}</Intro>
        <Buttons items={links(data.ctas)} className="mt-7" />
      </div>

      <Plate>
        {str(data.plateTitle) || str(data.plateNumber) ? (
          <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
        ) : null}
        <div className="p-5 sm:p-7">
          <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3">
            {stats.map((s, i) => (
              <div key={`${str(s.label)}-${i}`}>
                <dt className="chart-label opacity-70">{str(s.label)}</dt>
                <dd className="display tabular mt-1 text-[clamp(1.6rem,4vw,2.2rem)]">{str(s.value)}</dd>
                {str(s.note) ? <dd className="text-xs text-ink-soft">{str(s.note)}</dd> : null}
              </div>
            ))}
          </dl>
          {str(data.footnote) ? (
            <>
              <Rule className="my-6 text-ink opacity-30" />
              <p className="text-sm text-ink-soft">{str(data.footnote)}</p>
            </>
          ) : null}
        </div>
      </Plate>
    </div>
  );
}

/** Label-and-value rows: the school at a glance, or one disclosure table. */
export function FactTable({ data }: SectionProps) {
  const entries = rows(data.rows);
  if (!entries.length) return null;

  return (
    <Plate>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}
      <dl className="divide-y-2 divide-paper-shade">
        {entries.map((r, i) => (
          <div
            key={`${str(r.label)}-${i}`}
            className="grid gap-1 px-5 py-3 sm:grid-cols-[1fr_1.2fr] sm:gap-6 sm:py-3.5"
          >
            <dt className="chart-label opacity-65">{str(r.label)}</dt>
            <dd className="text-sm font-semibold">{str(r.value)}</dd>
          </div>
        ))}
      </dl>
    </Plate>
  );
}

/**
 * A ruled table.
 *
 * Cells are stored as one bar-separated string per row, which is the shape a
 * non-technical editor can actually maintain in a text field. An empty cell
 * prints as "awaiting school figures" rather than as a blank the reader has to
 * interpret — the rule the board-results table needs.
 */
export function DataTable({ data }: SectionProps) {
  const columns = rows(data.columns).map((c) => str(c.label));
  const body = rows(data.rows).map((r) =>
    str(r.cells)
      .split("|")
      .map((cell) => cell.trim())
  );
  if (!columns.length || !body.length) return null;

  return (
    <Plate>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[26rem] border-collapse text-left">
          <thead>
            <tr className="border-b-2 border-ink">
              {columns.map((c) => (
                <th key={c} scope="col" className="chart-label px-5 py-3">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((cells, i) => (
              <tr key={i} className="border-b-2 border-paper-shade last:border-0">
                {columns.map((_, n) => {
                  const value = cells[n] ?? "";
                  const content = value ? (
                    <span className="tabular">{value}</span>
                  ) : (
                    <span className="chart-label text-ink-soft">Awaiting school figures</span>
                  );
                  return n === 0 ? (
                    <th key={n} scope="row" className="tabular px-5 py-3.5 font-semibold">
                      {value || content}
                    </th>
                  ) : (
                    <td key={n} className="px-5 py-3.5">
                      {content}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {str(data.note) ? (
        <p className="border-t-2 border-paper-shade px-5 py-3 text-sm text-ink-soft">{str(data.note)}</p>
      ) : null}
    </Plate>
  );
}

export function FeesPanel({ data }: SectionProps) {
  const oneTime = rows(data.oneTime);
  const instalments = rows(data.instalments);
  const conditions = rows(data.conditions).map((c) => str(c.text)).filter(Boolean);

  return (
    <Plate>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}

      <div className="grid gap-0 md:grid-cols-2 md:divide-x-2 md:divide-paper-shade">
        <div className="p-5 sm:p-7">
          <h3 className="chart-label mb-4 opacity-65">{str(data.oneTimeHeading)}</h3>
          <dl className="space-y-2.5">
            {oneTime.map((f, i) => (
              <div key={`${str(f.label)}-${i}`} className="flex justify-between gap-6">
                <dt>{str(f.label)}</dt>
                <dd className="tabular font-semibold">{str(f.amount)}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="border-t-2 border-paper-shade p-5 sm:p-7 md:border-t-0">
          <h3 className="chart-label mb-4 opacity-65">{str(data.instalmentHeading)}</h3>
          <dl className="space-y-2.5">
            {instalments.map((f, i) => (
              <div key={`${str(f.label)}-${i}`} className="flex justify-between gap-6">
                <dt>{str(f.label)}</dt>
                <dd className="tabular font-semibold">{str(f.amount)}</dd>
              </div>
            ))}
          </dl>
          {str(data.total) ? (
            <>
              <Rule className="my-4 text-ink opacity-30" />
              <div className="flex items-baseline justify-between gap-6">
                <span className="chart-label">{str(data.totalLabel, "Annual total")}</span>
                <span className="display tabular text-2xl">{str(data.total)}</span>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {conditions.length ? (
        <div className="border-t-2 border-paper-shade px-5 py-4">
          <h3 className="chart-label mb-2 opacity-65">Please note</h3>
          <ul className="space-y-1.5">
            {conditions.map((c) => (
              <li key={c} className="flex gap-2.5 text-sm text-ink-soft">
                <span className="mt-1 flex-none text-alert">
                  <Icon name="chevron" size={11} />
                </span>
                {c}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {str(data.note) ? (
        <p className="border-t-2 border-paper-shade px-5 py-3 text-sm text-ink-soft">{str(data.note)}</p>
      ) : null}
    </Plate>
  );
}
