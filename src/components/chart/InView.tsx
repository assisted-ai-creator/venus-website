"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Marks a region so its leader lines draw and callout pins land once scrolled
 * to. `data-reveal` is rendered as "pending" on the server, but the CSS that
 * hides pending content is gated behind the `.js` class the boot script adds —
 * so without JavaScript, or if this component never hydrates, everything stays
 * visible. If IntersectionObserver is missing the region reveals immediately.
 */
export function InView({
  children,
  className = "",
  threshold = 0.2,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  threshold?: number;
  as?: "div" | "section" | "figure" | "article" | "ol" | "ul";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }

    // Already on screen at mount (or taller than the viewport) — reveal now.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setSeen(true);
            io.disconnect();
          }
        }
      },
      { threshold, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [seen, threshold]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      data-reveal={seen ? "in" : "pending"}
      className={className}
    >
      {children}
    </Tag>
  );
}
