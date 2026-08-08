import type { ReactNode } from "react";

/**
 * A plate: one sheet of chart stock, keylined and pinned to the wall. Every
 * region of dense reading on this site sits on one.
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
 * The printed header strip across the top of a chart. `plate` is the plate
 * number that runs at the right-hand end, the way a chart series is numbered.
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
  return (
    <div
      className={`${
        tone === "navy" ? "title-band-navy" : "title-band"
      } flex items-center justify-between gap-4 px-5 py-2.5 sm:px-7`}
    >
      <span className="chart-label">{children}</span>
      {plate ? (
        <span className="chart-label tabular opacity-80">{plate}</span>
      ) : null}
    </div>
  );
}

/** The double rule that separates chart sections. */
export function Rule({ className = "" }: { className?: string }) {
  return <hr className={`rule-double ${className}`} />;
}

/**
 * The publisher / registration block printed at the foot of a chart — the
 * small print that makes the sheet a document rather than a poster.
 */
export function PublisherBlock({
  items,
  className = "",
}: {
  items: { label: string; value: string }[];
  className?: string;
}) {
  return (
    <dl
      className={`flex flex-wrap items-baseline gap-x-6 gap-y-2 sm:gap-x-10 ${className}`}
    >
      {items.map((it) => (
        <div key={it.label} className="flex items-baseline gap-2">
          <dt className="chart-label opacity-70">{it.label}</dt>
          <dd className="chart-label tabular">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
