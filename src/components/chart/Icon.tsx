/**
 * Icons drawn in the chart's own grammar: a 24-unit grid, 1.75 stroke, butt
 * caps and mitre joins — the line weight of a printed classroom diagram, not
 * a rounded UI set.
 */
export type IconName =
  | "board"
  | "flask"
  | "abacus"
  | "computer"
  | "book"
  | "lamp"
  | "ball"
  | "swing"
  | "camera"
  | "masks"
  | "phone"
  | "mail"
  | "pin"
  | "clock"
  | "arrow"
  | "chevron"
  | "play"
  | "close"
  | "menu"
  | "check"
  | "compass";

const paths: Record<IconName, React.ReactNode> = {
  board: (
    <>
      <rect x="2.5" y="3.5" width="19" height="13" />
      <path d="M12 16.5v4M8 20.5h8M6 7.5h7M6 11h5" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 2.5v6.2L4 19a1.6 1.6 0 0 0 1.4 2.5h13.2A1.6 1.6 0 0 0 20 19l-5.5-10.3V2.5" />
      <path d="M8 2.5h8M7.2 14.5h9.6" />
    </>
  ),
  abacus: (
    <>
      <rect x="3" y="3.5" width="18" height="17" />
      <path d="M3 9h18M3 15h18" />
      <path d="M7 3.5v5.5M13 3.5v5.5M9 9v6M16 9v6M6 15v5.5M12 15v5.5" />
    </>
  ),
  computer: (
    <>
      <rect x="2.5" y="4" width="19" height="12.5" />
      <path d="M9 20.5h6M12 16.5v4M6 7.5h6" />
    </>
  ),
  book: (
    <>
      <path d="M4 3.5h6a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h6v15h-6a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H4z" />
      <path d="M12 4.5v15" />
    </>
  ),
  lamp: (
    <>
      <path d="M12 2.5v3M12 21.5v-3" />
      <path d="M4.5 13.5c0-3 3.3-5.5 7.5-5.5s7.5 2.5 7.5 5.5-3.3 5-7.5 5-7.5-2-7.5-5z" />
      <path d="M9.5 13.5a2.5 2.5 0 0 1 5 0" />
    </>
  ),
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3c2.5 2.5 3.8 5.5 3.8 9S14.5 18.5 12 21M12 3C9.5 5.5 8.2 8.5 8.2 12S9.5 18.5 12 21M3.2 10h17.6M3.2 14h17.6" />
    </>
  ),
  swing: (
    <>
      <path d="M3 4.5h18M6 4.5 4 20.5M18 4.5l2 16" />
      <rect x="8.5" y="12" width="7" height="3.5" />
      <path d="M9.5 4.5v7.5M14.5 4.5v7.5" />
    </>
  ),
  camera: (
    <>
      <path d="M2.5 7.5h13v9h-13z" />
      <path d="m15.5 11 6-3.5v9l-6-3.5z" />
      <path d="M5 4.5h5" />
    </>
  ),
  masks: (
    <>
      <path d="M3 4.5h8v7a4 4 0 0 1-8 0z" />
      <path d="M13 8.5h8v7a4 4 0 0 1-8 0z" />
      <path d="M5.5 7.5h.01M8.5 7.5h.01M15.5 11.5h.01M18.5 11.5h.01" />
    </>
  ),
  // A handset, not a rectangle — at 15px a plain box reads as a missing glyph.
  phone: (
    <path d="M4.6 3.5h4l1.5 4.2-2.2 1.4c1 2.1 2.8 3.9 4.9 4.9l1.4-2.2 4.2 1.5v4a1.6 1.6 0 0 1-1.7 1.6C9 18.4 5.1 14.5 3 5.2a1.6 1.6 0 0 1 1.6-1.7z" />
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" />
      <path d="m2.5 5.5 9.5 7.5 9.5-7.5" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21.5S4.5 14.8 4.5 9.8a7.5 7.5 0 0 1 15 0c0 5-7.5 11.7-7.5 11.7z" />
      <circle cx="12" cy="9.5" r="2.8" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 6.5V12l4 2.5" />
    </>
  ),
  arrow: <path d="M3.5 12h17M14 5.5l6.5 6.5-6.5 6.5" />,
  chevron: <path d="m8.5 4.5 8 7.5-8 7.5" />,
  play: <path d="M6.5 3.5 20 12 6.5 20.5z" />,
  close: <path d="m4.5 4.5 15 15M19.5 4.5l-15 15" />,
  menu: <path d="M3 6.5h18M3 12h18M3 17.5h18" />,
  check: <path d="m3.5 12.5 5.5 5.5L20.5 6.5" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
    </>
  ),
};

export function Icon({
  name,
  className = "",
  size = 24,
  filled = false,
}: {
  name: IconName;
  className?: string;
  size?: number;
  filled?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={1.75}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
