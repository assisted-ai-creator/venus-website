/**
 * The school's logo, as the browser tab already carries it: the VENUS WORLD
 * SCHOOLS lockup with the four-figure emblem, on its own white card.
 *
 * It is set on white rather than dropped straight onto the chrome because the
 * emblem's fourth figure is navy — on the navy header, footer and panel that
 * figure disappeared into the background. The card is part of the school's
 * artwork, not a device invented here.
 *
 * The name is no longer set as type beside it. The lockup contains the words
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
}: {
  className?: string;
  compact?: boolean;
}) {
  const height = compact ? 34 : 46;
  const width = Math.round(height * RATIO);

  return (
    <span className={`inline-flex ${className}`}>
      <img
        src="/logo-lockup.png"
        width={width}
        height={height}
        alt="Venus World Schools"
        decoding="async"
        className="block flex-none rounded-[2px]"
        style={{ height, width }}
      />
    </span>
  );
}
