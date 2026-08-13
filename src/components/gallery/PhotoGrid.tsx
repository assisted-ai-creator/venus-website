"use client";

import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/content/types";
import { Icon } from "@/components/chart/Icon";
import { thumb } from "@/lib/img";

/**
 * Photographs in a grid, each opening into a lightbox. The lightbox closes on
 * Escape and on backdrop click, and moves with arrow keys.
 */
export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const move = useCallback(
    (d: number) =>
      setOpen((i) => (i === null ? null : (i + d + photos.length) % photos.length)),
    [photos.length]
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") move(-1);
      if (e.key === "ArrowRight") move(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, move]);

  const current = open === null ? null : photos[open];

  return (
    <>
      <ul className="grid gap-[clamp(1rem,2vw,1.625rem)] sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <li key={p.src}>
            <button
              type="button"
              onClick={() => setOpen(i)}
              className="group block w-full text-left on-ground transition-colors hover-accent"
            >
              <span className="block overflow-hidden bg-image-bed">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb(p.src)}
                  alt={p.alt}
                  width={800}
                  height={600}
                  loading={i < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </span>
              <span className="mt-3 flex items-baseline justify-between gap-4">
                <span className="chart-label truncate on-ground-faint">
                  {p.caption ?? "Photograph"}
                </span>
                <span className="chart-label tabular flex-none on-ground-faint">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption ?? "Photograph"}
          className="on-ink fixed inset-0 z-[60] flex flex-col bg-navy-950/96 p-3 sm:p-6"
          onClick={close}
        >
          <div className="flex items-center justify-between gap-4">
            <p className="chart-label tabular text-white">
              {String((open ?? 0) + 1).padStart(2, "0")} /{" "}
              {String(photos.length).padStart(2, "0")}
            </p>
            <button
              type="button"
              onClick={close}
              autoFocus
              className="btn btn-ghost !px-3 !py-2"
            >
              <Icon name="close" size={16} />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div
            className="flex min-h-0 flex-1 items-center gap-2 py-3 sm:gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => move(-1)}
              className="btn btn-ghost !px-2.5 !py-4 sm:!px-3"
            >
              <Icon name="chevron" size={18} className="rotate-180" />
              <span className="sr-only">Previous photograph</span>
            </button>

            <figure className="flex min-h-0 flex-1 flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.src}
                alt={current.alt}
                className="min-h-0 flex-1 object-contain"
              />
              {current.caption ? (
                <figcaption className="chart-label mt-4 text-center text-navy-100">
                  {current.caption}
                </figcaption>
              ) : null}
            </figure>

            <button
              type="button"
              onClick={() => move(1)}
              className="btn btn-ghost !px-2.5 !py-4 sm:!px-3"
            >
              <Icon name="chevron" size={18} />
              <span className="sr-only">Next photograph</span>
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
