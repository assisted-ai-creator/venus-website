/**
 * Wordmark. The school's own emblem — the four figures from the Venus World
 * Schools logo — set beside the name. The emblem is lifted from the school's
 * artwork rather than drawn here, so nothing on the header is invented.
 *
 * The name is set as type instead of using the full logo lockup, which already
 * contains the words: printing both would say "Venus World Schools" twice.
 */
export function Wordmark({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const size = compact ? 30 : 38;

  return (
    <span className={`flex items-center gap-2.5 ${className}`}>
      <img
        src="/logo-mark.png"
        width={size}
        height={size}
        alt=""
        aria-hidden="true"
        decoding="async"
        className="flex-none"
        style={{ width: size, height: size }}
      />
      <span
        className={`display block ${compact ? "text-[1rem]" : "text-[1.05rem] sm:text-[1.2rem]"}`}
        style={{ letterSpacing: "-0.02em" }}
      >
        Venus World Schools
      </span>
    </span>
  );
}
