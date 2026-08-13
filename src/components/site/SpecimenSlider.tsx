"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/types";
import { Icon } from "@/components/chart/Icon";
import { thumb } from "@/lib/img";

/**
 * The photographic half of the opening spread: one image at a time, filling
 * its column to the window's edge, with the caption printed on a navy ribbon
 * across the foot the way a press photograph carries its cutline.
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
      className="relative min-h-[26rem] w-full overflow-hidden bg-[#dfe4ea]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKey}
    >
      <div className="absolute inset-0">
        {slides.map((s, n) =>
          mounted.has(n) ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={s.src}
              src={s.src}
              // A phone draws this ~350px wide; without a srcset it would pull
              // the full 1600px master over mobile data for no visible gain.
              srcSet={`${thumb(s.src)} 800w, ${s.src} 1600w`}
              sizes="(min-width: 1024px) 50vw, 100vw"
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

      </div>

      {/* The cutline. Navy at 88% so the photograph still reads through it at
          the edges, and wide enough only for the words it carries. */}
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4">
        <p
          className="chart-label max-w-[34ch] bg-navy-900/88 px-5 py-3 text-white"
          aria-live="polite"
          aria-atomic="true"
        >
          {slides.length > 1 ? (
            <span className="tabular mr-2.5 text-navy-200">
              {String(i + 1).padStart(2, "0")}/{String(slides.length).padStart(2, "0")}
            </span>
          ) : null}
          {current.caption || current.alt}
        </p>

        {slides.length > 1 ? (
          <div className="flex flex-none">
            <button
              type="button"
              onClick={() => go(i - 1)}
              className="grid h-11 w-11 place-items-center bg-navy-900/88 text-white transition-colors hover:bg-saffron hover:text-ink"
            >
              <Icon name="chevron" size={13} className="rotate-180" />
              <span className="sr-only">Previous photograph</span>
            </button>
            <button
              type="button"
              onClick={() => go(i + 1)}
              className="grid h-11 w-11 place-items-center border-l border-navy-750 bg-navy-900/88 text-white transition-colors hover:bg-saffron hover:text-ink"
            >
              <Icon name="chevron" size={13} />
              <span className="sr-only">Next photograph</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
