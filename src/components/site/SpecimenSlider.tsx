"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/types";
import { Icon } from "@/components/chart/Icon";
import { thumb } from "@/lib/img";

/**
 * The banner slider, built as the specimen plate mounted inside the chart: a
 * keylined photographic window with a numbered caption strip, the way a printed
 * chart tips in a photograph beside its diagram.
 *
 * Advances on a timer, pauses on hover, focus and when the tab is hidden, stops
 * entirely under prefers-reduced-motion, and is fully keyboard operable.
 */
export function SpecimenSlider({
  slides,
  interval = 6000,
}: {
  slides: Photo[];
  interval?: number;
}) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const region = useRef<HTMLDivElement | null>(null);
  /**
   * Slides are stacked in the viewport, so `loading="lazy"` would not defer
   * them — the browser fetches every one on load. Mounting only the slides
   * that have actually been shown keeps the first paint to a single
   * photograph instead of four.
   */
  const [mounted, setMounted] = useState<Set<number>>(() => new Set([0]));

  useEffect(() => {
    setMounted((prev) => (prev.has(i) ? prev : new Set(prev).add(i)));
  }, [i]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  const go = useCallback(
    (n: number) => setI((prev) => (n + slides.length) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    if (paused || reduced || slides.length < 2) return;
    const id = window.setInterval(() => go(i + 1), interval);
    return () => window.clearInterval(id);
  }, [i, paused, reduced, interval, go, slides.length]);

  useEffect(() => {
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(i - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(i + 1);
    }
  };

  const current = slides[i];

  return (
    <div
      ref={region}
      role="region"
      aria-label="School photographs"
      aria-roledescription="carousel"
      className="plate overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKey}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-navy-100 sm:aspect-[3/2]">
        {slides.map((s, n) =>
          mounted.has(n) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={s.src}
              src={s.src}
              // A phone draws this ~350px wide; without a srcset it would pull
              // the full 1600px master over mobile data for no visible gain.
              srcSet={`${thumb(s.src)} 800w, ${s.src} 1600w`}
              sizes="(min-width: 1024px) 580px, 100vw"
              alt={n === i ? s.alt : ""}
              aria-hidden={n === i ? undefined : true}
              width={1600}
              height={1200}
              loading={n === 0 ? "eager" : "lazy"}
              fetchPriority={n === 0 ? "high" : "auto"}
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
              style={{ opacity: n === i ? 1 : 0 }}
            />
          ) : null
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 border-t-2 border-ink bg-paper px-3 py-2">
          <p
            className="chart-label truncate"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="mr-2 opacity-70">
              {String(i + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
            </span>
            {current.caption}
          </p>
          <div className="flex flex-none items-center gap-1.5">
            <button
              type="button"
              onClick={() => go(i - 1)}
              className="grid h-8 w-8 place-items-center border-2 border-ink text-ink transition-colors hover:bg-saffron"
            >
              <Icon name="chevron" size={13} className="rotate-180" />
              <span className="sr-only">Previous photograph</span>
            </button>
            <button
              type="button"
              onClick={() => go(i + 1)}
              className="grid h-8 w-8 place-items-center border-2 border-ink text-ink transition-colors hover:bg-saffron"
            >
              <Icon name="chevron" size={13} />
              <span className="sr-only">Next photograph</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 border-t-2 border-ink bg-paper-shade px-3 py-2">
        {slides.map((s, n) => (
          <button
            key={s.src}
            type="button"
            onClick={() => go(n)}
            aria-current={n === i ? "true" : undefined}
            className="group h-2.5 flex-1 border-2 border-ink transition-colors"
            style={{ background: n === i ? "#ffab1f" : "transparent" }}
          >
            <span className="sr-only">
              Photograph {n + 1}: {s.caption}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
