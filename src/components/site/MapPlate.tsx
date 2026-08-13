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
      {/* The map well is navy whatever the page around it is, so it declares
          the navy contract: the Load button reverts to saffron here. */}
      <div className="on-ink relative aspect-[4/3] w-full bg-navy-900 sm:aspect-[16/10]">
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
          <div className="absolute inset-0 grid place-items-center p-6 text-center" aria-hidden="true">
            {/* A drawn locator standing in for the map until it is asked for. */}
            <div>
              <span className="mx-auto grid h-14 w-14 place-items-center border border-saffron text-saffron">
                <Icon name="pin" size={24} />
              </span>
              {postcodeLine ? (
                <p className="chart-label mt-4 text-navy-100">{postcodeLine}</p>
              ) : null}
            </div>
          </div>
        )}

        {!live ? (
          <button
            type="button"
            onClick={() => setLive(true)}
            className="absolute inset-0 grid place-items-end justify-center p-6"
          >
            <span className="btn btn-primary">
              Load the map
              <Icon name="pin" size={14} />
            </span>
            <span className="sr-only">Load the interactive Google map of the campus</span>
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 border-t border-hairline px-5 py-4">
        <p className="chart-label text-ink-faint">{addressLine}</p>
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="chart-label inline-flex items-center gap-2 text-navy-700 transition-colors hover:text-navy-900"
        >
          Directions
          <Icon name="arrow" size={12} />
        </a>
      </div>
    </div>
  );
}
