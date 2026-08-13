/**
 * The campus, drawn as a measured elevation: flat inks, hairline keylines, no
 * gradients, no shading. Numbered pins sit on the drawing; the key that names
 * them is HTML beside it, so the labels stay legible at any width and readable
 * to a screen reader.
 *
 * The drawing follows the school's own building — a four-storey block with two
 * wings, a recessed central entrance, the flag at the steps.
 */

const INK = "#101820";
const PAPER = "#ffffff";
const SHADE = "#eef1f4";
const NAVY = "#002147";
const SAFFRON = "#ffab1f";
const GREEN = "#1b6e4a";

/** Where each numbered pin sits on the drawing, in viewBox units. */
export const campusPins = [
  { n: 1, x: 214, y: 243, leader: [214, 243, 214, 150, 96, 150] },
  { n: 2, x: 786, y: 300, leader: [786, 300, 786, 186, 906, 186] },
  { n: 3, x: 500, y: 412, leader: [500, 412, 618, 412, 618, 470] },
  { n: 4, x: 838, y: 520, leader: [838, 520, 916, 520, 916, 566] },
  { n: 5, x: 152, y: 356, leader: [152, 356, 74, 356, 74, 420] },
  { n: 6, x: 344, y: 546, leader: [344, 546, 344, 596] },
] as const;

function Windows({
  x,
  y,
  cols,
  rows,
  w = 26,
  h = 30,
  gapX = 44,
  gapY = 74,
}: {
  x: number;
  y: number;
  cols: number;
  rows: number;
  w?: number;
  h?: number;
  gapX?: number;
  gapY?: number;
}) {
  const out = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(
        <rect
          key={`${r}-${c}`}
          x={x + c * gapX}
          y={y + r * gapY}
          width={w}
          height={h}
          fill={NAVY}
        />
      );
    }
  }
  return <>{out}</>;
}

export function CampusCutaway({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1000 640"
      className={className}
      role="img"
      aria-label="Elevation drawing of the Venus World Schools building: a four-storey block with two wings and a recessed central entrance, the Indian flag at the steps, palms and a boundary wall in front. Six numbered markers key to the list beside it."
      preserveAspectRatio="xMidYMid meet"
    >
      <g stroke={INK} strokeWidth={1.75} strokeLinejoin="miter" strokeLinecap="butt">
        {/* ---- Ground plane ------------------------------------------- */}
        <rect x="0" y="500" width="1000" height="140" fill={NAVY} stroke="none" />
        <path d="M0 500h1000" />

        {/* ---- Left wing ---------------------------------------------- */}
        <rect x="60" y="170" width="300" height="330" fill={PAPER} />
        {/* floor bands */}
        <path d="M60 244h300M60 318h300M60 392h300M60 466h300" />
        <Windows x={86} y={196} cols={6} rows={4} />

        {/* ---- Right wing --------------------------------------------- */}
        <rect x="640" y="170" width="300" height="330" fill={PAPER} />
        <path d="M640 244h300M640 318h300M640 392h300M640 466h300" />
        <Windows x={666} y={196} cols={6} rows={4} />

        {/* ---- Central recessed block --------------------------------- */}
        <rect x="360" y="206" width="280" height="294" fill={SHADE} />
        <path d="M360 268h280M360 330h280M360 392h280" />
        <Windows x={386} y={226} cols={5} rows={3} w={24} h={26} gapX={46} gapY={62} />

        {/* ---- Roof parapets ------------------------------------------ */}
        <rect x="60" y="152" width="300" height="18" fill={SAFFRON} />
        <rect x="640" y="152" width="300" height="18" fill={SAFFRON} />
        <rect x="360" y="188" width="280" height="18" fill={SAFFRON} />
        {/* roof boxes */}
        <rect x="128" y="126" width="62" height="26" fill={PAPER} />
        <rect x="812" y="126" width="62" height="26" fill={PAPER} />

        {/* ---- Name board on the right end wall ----------------------- */}
        <rect x="856" y="212" width="68" height="72" fill={PAPER} />
        <path d="M866 232h48M866 248h48M866 264h34" strokeWidth={4} stroke={SAFFRON} />

        {/* ---- Entrance ----------------------------------------------- */}
        <rect x="440" y="392" width="120" height="108" fill={NAVY} />
        <path d="M500 392v108" stroke={PAPER} strokeWidth={2} />
        {/* steps */}
        <path d="M424 500h152M410 516h180M396 532h208" strokeWidth={3} />
        <rect x="410" y="500" width="180" height="16" fill={SHADE} />
        <rect x="396" y="516" width="208" height="16" fill={PAPER} />

        {/* ---- Flag --------------------------------------------------- */}
        <path d="M500 392V262" strokeWidth={3} />
        <g stroke="none">
          <rect x="502" y="266" width="66" height="12" fill={SAFFRON} />
          <rect x="502" y="278" width="66" height="12" fill={PAPER} />
          <rect x="502" y="290" width="66" height="12" fill={GREEN} />
        </g>
        <path d="M502 266h66v36h-66z" />
        <circle cx="535" cy="284" r="5" fill="none" strokeWidth={2} stroke={NAVY} />

        {/* ---- Palms -------------------------------------------------- */}
        {[240, 760].map((px) => (
          <g key={px}>
            <path d={`M${px} 500V430`} strokeWidth={3} />
            <path
              d={`M${px} 430c-26-10-44-4-56 10 20-2 34 2 44 12M${px} 430c26-10 44-4 56 10-20-2-34 2-44 12M${px} 430c-8-24-2-42 10-54 4 20 6 34 2 46M${px} 430c14-18 30-24 46-20-14 12-26 22-36 26`}
              fill={GREEN}
              strokeWidth={2}
            />
          </g>
        ))}

        {/* ---- Boundary wall & hedge ---------------------------------- */}
        <rect x="0" y="536" width="1000" height="34" fill={PAPER} />
        <path d="M0 536h1000M0 570h1000" />
        <path
          d="M0 553h1000"
          strokeWidth={2}
          stroke={SHADE}
          strokeDasharray="14 10"
        />
        <rect x="60" y="570" width="880" height="16" fill={GREEN} stroke="none" />
        <path d="M60 570h880" />

        {/* ---- Assembly ground marking -------------------------------- */}
        <path
          d="M120 606h760"
          strokeWidth={2}
          strokeDasharray="10 12"
          opacity={0.5}
        />
      </g>

      {/* ---- Leader lines + numbered pins ----------------------------- */}
      <g className="pointer-events-none">
        {campusPins.map((p, i) => {
          const [x1, y1, ...rest] = p.leader;
          const d =
            `M${x1} ${y1}` +
            rest.reduce<string>(
              (acc, v, idx) => (idx % 2 === 0 ? `${acc}L${v}` : `${acc} ${v}`),
              ""
            );
          return (
            <g key={p.n}>
              <path
                d={d}
                className="leader-path"
                style={
                  {
                    "--len": 320,
                    "--delay": `${i * 110}ms`,
                  } as React.CSSProperties
                }
                fill="none"
                stroke={SAFFRON}
                strokeWidth={2}
              />
              <g
                className="callout-pin"
                style={{ "--delay": `${i * 110}ms` } as React.CSSProperties}
              >
                <circle cx={p.x} cy={p.y} r={17} fill={SAFFRON} stroke={INK} strokeWidth={1.75} />
                <text
                  x={p.x}
                  y={p.y + 6}
                  textAnchor="middle"
                  fontSize={19}
                  fontWeight={700}
                  fill={INK}
                  fontFamily="var(--font-label)"
                >
                  {p.n}
                </text>
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
