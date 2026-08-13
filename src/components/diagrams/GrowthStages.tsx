/**
 * The three stages drawn as growth — seed, sapling, tree — with the school's
 * own stage names and ranges keyed beneath. Flat inks, hairline keylines, no
 * shading.
 */

const INK = "#101820";
const PAPER = "#ffffff";
const SAFFRON = "#ffab1f";
const GREEN = "#1b6e4a";
const SOIL = "#eef1f4";

const stages = [
  { label: "Pre-Primary", range: "Ages 3–6", sub: "Playgroup to Senior KG" },
  { label: "Primary", range: "Std I–VII", sub: "CBSE from Std IV" },
  { label: "Secondary", range: "Std VIII–X", sub: "To the board examination" },
];

export function GrowthStages({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 900 300"
        className="h-auto w-full"
        role="img"
        aria-label="Diagram of three growth stages: a seedling for Pre-Primary, a sapling for Primary, and a full tree for Secondary, standing in a shared band of soil."
        preserveAspectRatio="xMidYMid meet"
      >
        <g stroke={INK} strokeWidth={1.75} strokeLinejoin="miter" strokeLinecap="butt">
          {/* Soil band */}
          <rect x="0" y="238" width="900" height="34" fill={SOIL} />
          <path d="M0 238h900M0 272h900" />

          {/* --- Stage 1: seedling --- */}
          <g>
            <path d="M150 238v-46" strokeWidth={3} />
            <path
              d="M150 206c-16-14-34-14-44-2 12 12 30 14 44 2zM150 206c16-14 34-14 44-2-12 12-30 14-44 2z"
              fill={GREEN}
            />
            <circle cx="150" cy="186" r="8" fill={SAFFRON} />
            {/* roots */}
            <path d="M150 238v18M150 250l-16 10M150 250l16 10" strokeWidth={2} />
          </g>

          {/* --- Stage 2: sapling --- */}
          <g>
            <path d="M450 238v-96" strokeWidth={4} />
            <path d="M450 190l-40-26M450 166l40-26" strokeWidth={2.5} />
            <path
              d="M450 142c-30-20-58-12-70 8 22 16 52 12 70-8zM450 142c30-20 58-12 70 8-22 16-52 12-70-8zM450 118c-22-16-24-40-10-54 16 12 22 36 10 54z"
              fill={GREEN}
            />
            <circle cx="410" cy="164" r="7" fill={SAFFRON} />
            <circle cx="490" cy="140" r="7" fill={SAFFRON} />
            <path d="M450 238v22M450 252l-22 12M450 252l22 12" strokeWidth={2} />
          </g>

          {/* --- Stage 3: tree --- */}
          <g>
            <path d="M750 238V118" strokeWidth={6} />
            <path d="M750 176l-52-30M750 150l52-30M750 200l-34-18" strokeWidth={3} />
            <path
              d="M750 118c-58-18-96 6-104 44 44 20 90 4 104-44zM750 118c58-18 96 6 104 44-44 20-90 4-104-44zM750 96c-30-30-26-70-4-88 24 22 26 62 4 88zM698 146c-34 4-56 24-56 48 30 4 56-16 56-48z"
              fill={GREEN}
            />
            <circle cx="700" cy="132" r="8" fill={SAFFRON} />
            <circle cx="800" cy="152" r="8" fill={SAFFRON} />
            <circle cx="752" cy="70" r="8" fill={SAFFRON} />
            <path d="M750 238v24M750 254l-30 14M750 254l30 14M750 254v14" strokeWidth={2} />
          </g>

          {/* Stage markers on the soil line */}
          {[150, 450, 750].map((x, i) => (
            <g key={x}>
              <circle cx={x} cy={238} r={15} fill={SAFFRON} stroke={INK} strokeWidth={1.75} />
              <text
                x={x}
                y={244}
                textAnchor="middle"
                fontSize={17}
                fontWeight={700}
                fill={INK}
                stroke="none"
                fontFamily="var(--font-label)"
              >
                {i + 1}
              </text>
            </g>
          ))}

          {/* Connecting rule between stages */}
          <path
            d="M172 292h256M472 292h256"
            strokeWidth={2}
            strokeDasharray="8 8"
            stroke={PAPER}
            opacity={0.45}
          />
        </g>
      </svg>

      <ol className="mt-8 grid gap-x-10 sm:grid-cols-3">
        {stages.map((s, i) => (
          <li
            key={s.label}
            className="rise flex gap-4 border-t border-paper-shade pt-4"
            style={{ "--delay": `${200 + i * 110}ms` } as React.CSSProperties}
          >
            <span className="callout-num pt-1">{String(i + 1).padStart(2, "0")}</span>
            <span>
              <span className="display-sm block text-[1.1rem] on-ground">{s.label}</span>
              <span className="chart-label block on-ground-accent">{s.range}</span>
              <span className="mt-1 block text-[0.92rem] on-ground-soft">{s.sub}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
