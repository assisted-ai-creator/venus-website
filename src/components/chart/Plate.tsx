import type { ReactNode } from "react";

/**
 * A plate: one ruled-off region of the sheet, used where the border earns its
 * place — a form, a summary card, a table that has to be told apart from the
 * page around it. Hairline and square, never a card floating above the page.
 */
export function Plate({
  children,
  className = "",
  tone = "paper",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "dark";
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <Tag className={`${tone === "dark" ? "plate plate-dark" : "plate"} ${className}`}>
      {children}
    </Tag>
  );
}

/**
 * The label strip that opens a plate. `plate` is the reference that runs at
 * the right-hand end — the form number, the return it is taken from — the way
 * a filed document is numbered.
 */
export function TitleBand({
  children,
  plate,
  tone = "saffron",
}: {
  children: ReactNode;
  plate?: string;
  tone?: "saffron" | "navy";
}) {
  if (!children && !plate) return null;
  return (
    <div
      className={`${
        tone === "navy" ? "title-band-navy" : "title-band"
      } flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-7`}
    >
      <span className="chart-label">{children}</span>
      {plate ? <span className="chart-label tabular opacity-70">{plate}</span> : null}
    </div>
  );
}

/** The hairline that separates one part of a sheet from the next. */
export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`rule-double ${className}`} />;
}

/**
 * The registration block printed at the foot of a document — the small print
 * that makes the sheet a record rather than a poster.
 */
export function PublisherBlock({
  items,
  className = "",
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  if (!items.length) return null;
  return (
    <dl className={`flex flex-wrap items-baseline gap-x-10 gap-y-2.5 ${className}`}>
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline gap-2.5">
          <dt className="chart-label on-ground-faint">{it.label}</dt>
          <dd className="chart-label tabular on-ground">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
