/**
 * Wordmark. The school has no vector logo — only a 192px favicon — so the mark
 * is set as type with a drawn device: a compass rose of five rays, for the five
 * stages from Playgroup to Standard X. Replace with the official artwork when
 * the school supplies it.
 */
export function Wordmark({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        width={compact ? 30 : 38}
        height={compact ? 30 : 38}
        aria-hidden="true"
        focusable="false"
        className="flex-none"
      >
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <circle cx="20" cy="20" r="4.5" fill="#ffab1f" />
        {[0, 72, 144, 216, 288].map((deg) => (
          <path
            key={deg}
            d="M20 6.5 22.6 15 20 13.4 17.4 15z"
            fill="currentColor"
            transform={`rotate(${deg} 20 20)`}
          />
        ))}
      </svg>
      <span className="leading-[0.95]">
        <span
          className="display block text-[1.05rem] sm:text-[1.2rem]"
          style={{ letterSpacing: "-0.02em" }}
        >
          Venus World
        </span>
        <span className="chart-label block text-[0.58rem] opacity-75 sm:text-[0.62rem]">
          Schools · Pune
        </span>
      </span>
    </span>
  );
}
