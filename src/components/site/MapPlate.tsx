"use client";

import { useState } from "react";
import { Icon } from "@/components/chart/Icon";

/*
 * The keyless embed form. `www.google.com/maps?q=…` refuses to be framed;
 * `maps.google.com/maps?q=…&output=embed` is the form that renders in an
 * iframe without an Embed API key. Swap to the Embed API `place` endpoint if
 * the school supplies a Google Maps key.
 */

/**
 * Google Maps, held behind a click. The embed pulls several hundred kilobytes
 * of third-party script, and most visitors to this page want the address and a
 * directions link rather than a live map — so it loads when asked for.
 *
 * The query and the printed address come from the CMS, so moving the pin is an
 * edit in the panel rather than a change here.
 */
export function MapPlate({
  query,
  addressLine,
  postcodeLine,
  title,
  className = "",
}: {
  query: string;
  addressLine: string;
  postcodeLine?: string;
  title?: string;
  className?: string;
}) {
  const [live, setLive] = useState(false);
  if (!query) return null;

  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  return (
    <div className={`plate overflow-hidden ${className}`}>
      {/* The map well is dark whatever the page around it is, so it declares
          the blue contract: the Load button reverts to saffron here. */}
      <div className="on-ink relative aspect-[4/3] w-full bg-navy-850 sm:aspect-[16/10]">
        {live ? (
          <iframe
            src={embed}
            title={title ?? `Map showing ${addressLine}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
          />
        ) : (
          <div
            className="ground-ink wall-dense absolute inset-0 grid place-items-center p-6 text-center"
            aria-hidden="true"
          >
            {/* A drawn locator standing in for the map until it is asked for. */}
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-2 border-saffron text-saffron">
                <Icon name="pin" size={26} />
              </span>
              {postcodeLine ? <p className="chart-label mt-4 text-paper">{postcodeLine}</p> : null}
            </div>
          </div>
        )}

        {!live ? (
          <button
            type="button"
            onClick={() => setLive(true)}
            className="absolute inset-0 grid place-items-end justify-center p-5"
          >
            <span className="btn btn-primary">
              Load the map
              <Icon name="pin" size={15} />
            </span>
            <span className="sr-only">Load the interactive Google map of the campus</span>
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink bg-paper-shade px-4 py-3">
        <p className="chart-label">{addressLine}</p>
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="chart-label inline-flex items-center gap-1.5 underline underline-offset-2"
        >
          Directions
          <Icon name="arrow" size={13} />
        </a>
      </div>
    </div>
  );
}
