/**
 * The school's logo, as the browser tab already carries it: the VENUS WORLD
 * SCHOOLS lockup with the four-figure emblem.
 *
 * On the white masthead it prints straight onto the page. On the navy footer
 * and the navy menu sheet it is laid on a white card, because the emblem's
 * fourth figure is navy and disappears into that ground. The card is part of
 * the school's own artwork, not a device invented here.
 *
 * The name is not set as type beside it. The lockup contains the words
 * already, and printing both said "Venus World Schools" twice.
 *
 * `/logo-lockup.png` is cropped from that same artwork — the 192px touch icon
 * in /public/photos, trimmed to the card at {27,59,137,69} and doubled for 2x
 * screens. That icon is the largest copy of the logo in this repo, so the
 * second line is small once the lockup fits a header; regenerate the crop from
 * the original artwork if the school still holds it.
 */

/** Intrinsic ratio of /logo-lockup.png (274×138). */
const RATIO = 274 / 138;

export function Wordmark({
  className = "",
  compact = false,
  size,
  onDark = false,
}: {
  className?: string;
  /** The menu sheet's smaller lockup. */
  compact?: boolean;
  /** Explicit height in px, when neither default suits. */
  size?: number;
  /** Lay it on a white card, for the navy footer and menu sheet. */
  onDark?: boolean;
}) {
  const height = size ?? (compact ? 44 : 54);
  const width = Math.round(height * RATIO);

  return (
    <span className={`inline-flex ${onDark ? "bg-white px-3 py-2.5" : ""} ${className}`}>
      <img
        src="/logo-lockup.png"
        width={width}
        height={height}
        alt="Venus World Schools"
        decoding="async"
        className="block flex-none"
        style={{ height, width }}
      />
    </span>
  );
}
