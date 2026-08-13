import { Buttons, Intro, SectionHeading, links, rows, str } from "./parts";
import type { SectionProps } from "./types";

/**
 * The filed record: a ruled grid of headline figures with the source printed
 * under it. Every cell is one number a parent can check the school against, so
 * the note under each figure carries what it was measured from.
 */
export function StatPlate({ data }: SectionProps) {
  const stats = rows(data.stats);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-4">
        <SectionHeading>{str(data.heading)}</SectionHeading>
        {str(data.plateTitle) || str(data.plateNumber) ? (
          <p className="chart-label on-ground-faint">
            {[str(data.plateTitle), str(data.plateNumber)].filter(Boolean).join(" · ")}
          </p>
        ) : null}
      </div>

      <Intro>{str(data.intro)}</Intro>

      {/*
        The cell is sized off the widest figure the school actually files —
        "97.22%" — rather than off a column count, so a sixth statistic wraps to
        a second row instead of squeezing the percentage past its rule.
      */}
      {stats.length ? (
        <dl className="mt-[clamp(2rem,4vw,3.25rem)] grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] border-t border-l border-paper-shade">
          {stats.map((s, i) => (
            <div
              key={`${str(s.label)}-${i}`}
              className="border-r border-b border-paper-shade bg-white px-6 py-7"
            >
              <dd className="display tabular text-[clamp(2rem,3.6vw,3rem)] leading-none tracking-[-0.03em] text-navy-900">
                {str(s.value)}
              </dd>
              <dt className="chart-label mt-3.5 text-ink">{str(s.label)}</dt>
              {str(s.note) ? (
                <dd className="mt-1 text-[0.88rem] text-ink-faint">{str(s.note)}</dd>
              ) : null}
            </div>
          ))}
        </dl>
      ) : null}

      {str(data.footnote) ? (
        <p className="mt-5 max-w-[80ch] text-[0.85rem] leading-[1.6] on-ground-faint">
          {str(data.footnote)}
        </p>
      ) : null}

      <Buttons items={links(data.ctas)} className="mt-8" />
    </div>
  );
}

/** Label-and-value rows: the school at a glance, or one disclosure table. */
export function FactTable({ data }: SectionProps) {
  const entries = rows(data.rows);
  if (!entries.length) return null;

  return (
    <div>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <p className="chart-label mb-4 on-ground-accent">
          {[str(data.plateTitle), str(data.plateNumber)].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <dl className="border-t border-rule-strong">
        {entries.map((r, i) => (
          <div
            key={`${str(r.label)}-${i}`}
            className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-paper-shade py-4"
          >
            <dt className="text-[0.97rem] on-ground-faint">{str(r.label)}</dt>
            <dd className="tabular text-[0.97rem] font-semibold on-ground sm:text-right">
              {str(r.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
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
    <div>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <p className="chart-label mb-4 on-ground-accent">
          {[str(data.plateTitle), str(data.plateNumber)].filter(Boolean).join(" · ")}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] border-collapse text-left">
          <thead>
            <tr>
              {columns.map((c, n) => (
                <th
                  key={c}
                  scope="col"
                  className={`chart-label border-b-2 border-ink pb-3 on-ground ${
                    n === 0 ? "pr-4" : "px-4 last:pr-0"
                  }`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((cells, i) => (
              <tr key={i}>
                {columns.map((_, n) => {
                  const value = cells[n] ?? "";
                  const pad = n === 0 ? "pr-4" : "px-4 last:pr-0";

                  if (n === 0) {
                    return (
                      <th
                        key={n}
                        scope="row"
                        className={`border-b border-paper-shade py-4 text-left text-[1.02rem] font-semibold on-ground ${pad}`}
                      >
                        {value}
                      </th>
                    );
                  }
                  return (
                    <td key={n} className={`border-b border-paper-shade py-4 ${pad}`}>
                      {value ? (
                        <span className="tabular text-[0.97rem] on-ground-soft">{value}</span>
                      ) : (
                        <span className="chart-label on-ground-faint">Awaiting school figures</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {str(data.note) ? (
        <p className="mt-4 text-[0.85rem] leading-[1.6] on-ground-faint">{str(data.note)}</p>
      ) : null}
    </div>
  );
}

/** One column of a fee schedule. */
function FeeColumn({
  heading,
  entries,
}: {
  heading: string;
  entries: Record<string, unknown>[];
}) {
  if (!entries.length) return null;
  return (
    <div className="flex-1 basis-[18rem]">
      {heading ? <p className="chart-label mb-3.5 on-ground-accent">{heading}</p> : null}
      <dl className="border-t border-rule-strong">
        {entries.map((f, i) => (
          <div
            key={`${str(f.label)}-${i}`}
            className="flex justify-between gap-5 border-b border-paper-shade py-4"
          >
            <dt className="text-[0.97rem] on-ground-faint">{str(f.label)}</dt>
            <dd className="tabular text-[0.97rem] font-semibold on-ground">{str(f.amount)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function FeesPanel({ data }: SectionProps) {
  const oneTime = rows(data.oneTime);
  const instalments = rows(data.instalments);
  const conditions = rows(data.conditions).map((c) => str(c.text)).filter(Boolean);

  return (
    <div>
      {str(data.plateTitle) || str(data.plateNumber) ? (
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-x-10 gap-y-3">
          <SectionHeading>{str(data.plateTitle)}</SectionHeading>
          {str(data.plateNumber) ? (
            <p className="chart-label on-ground-faint">{str(data.plateNumber)}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-start gap-x-[clamp(2rem,5vw,4.5rem)] gap-y-9">
        <FeeColumn heading={str(data.oneTimeHeading)} entries={oneTime} />
        <FeeColumn heading={str(data.instalmentHeading)} entries={instalments} />

        {str(data.total) ? (
          <div className="flex-1 basis-[15rem] border-t-2 border-ink pt-5">
            <p className="chart-label on-ground">{str(data.totalLabel, "Annual total")}</p>
            <p className="display tabular mt-3 text-[clamp(2.25rem,4.2vw,3.25rem)] leading-none tracking-[-0.03em] text-navy-900">
              {str(data.total)}
            </p>
            {str(data.note) ? (
              <p className="mt-3 text-[0.92rem] leading-[1.65] on-ground-faint">{str(data.note)}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {conditions.length ? (
        <ul className="mt-[clamp(2rem,4vw,3rem)] grid gap-x-[clamp(1.75rem,4vw,3.5rem)] sm:grid-cols-2 lg:grid-cols-3">
          {conditions.map((c) => (
            <li
              key={c}
              className="flex gap-3.5 border-t border-rule-strong py-4 text-[0.95rem] leading-[1.65] on-ground-soft"
            >
              <span aria-hidden="true" className="mt-[0.55em] h-2 w-2 flex-none bg-alert" />
              {c}
            </li>
          ))}
        </ul>
      ) : null}

      {!str(data.total) && str(data.note) ? (
        <p className="mt-5 text-[0.88rem] leading-[1.6] on-ground-faint">{str(data.note)}</p>
      ) : null}
    </div>
  );
}
