/**
 * The section renderer.
 *
 * A page is a flat, ordered list of blocks. This turns that list back into the
 * site's layout: a run of blocks sharing a background becomes one printed
 * band, and blocks marked `left` or `right` inside a run pair up into the
 * two-column arrangements the About, Admissions and Contact pages use.
 *
 * Ordering, background and column are all data — which is what lets the panel
 * move a block up, across or onto another page without a deployment.
 */

import type { ReactNode } from "react";
import type { SectionGround, SectionLayout, SiteContent, SiteSection } from "@/lib/site";
import { Hero, CtaBand } from "./Openers";
import { Prose, RichText, Signature, SectionRule, Testimonials, VisionMission } from "./Text";
import { StatPlate, FactTable, DataTable, FeesPanel } from "./Data";
import {
  NumberedList,
  Steps,
  CardGrid,
  CalloutKey,
  FacilityKeySection,
  ProgrammeStages,
  NewsPanel,
  ProfileCards,
  BlogList,
} from "./Lists";
import { GalleryGrid, PhotoStrip, ImagePlate, VideoPanel, EmbedPanel } from "./Media";
import { ContactPanel, PhonePanel, MapPanel, EnquiryPanel } from "./Contact";
import type { SectionProps } from "./types";

const RENDERERS: Record<string, (props: SectionProps) => ReactNode> = {
  hero: Hero,
  ctaBand: CtaBand,
  prose: Prose,
  richText: RichText,
  signature: Signature,
  sectionRule: SectionRule,
  testimonials: Testimonials,
  visionMission: VisionMission,
  statPlate: StatPlate,
  factTable: FactTable,
  dataTable: DataTable,
  feesPanel: FeesPanel,
  numberedList: NumberedList,
  steps: Steps,
  cardGrid: CardGrid,
  calloutKey: CalloutKey,
  facilityKey: FacilityKeySection,
  programmeStages: ProgrammeStages,
  newsPanel: NewsPanel,
  profileCards: ProfileCards,
  blogList: BlogList,
  galleryGrid: GalleryGrid,
  photoStrip: PhotoStrip,
  imagePlate: ImagePlate,
  videoPanel: VideoPanel,
  embedPanel: EmbedPanel,
  contactPanel: ContactPanel,
  phonePanel: PhonePanel,
  mapPanel: MapPanel,
  enquiryPanel: EnquiryPanel,
};

/**
 * A band's ground.
 *
 * `navy`, `navy-saffron` and `wall-dense` are names the panel has been writing
 * into stored pages through two earlier looks of this site, so they stay as
 * aliases of the grounds that replaced them rather than being renamed under
 * content already in the database. New sections choose `wall`, `amber` or
 * `amber-deep`.
 */
const GROUND_CLASS: Record<SectionGround, string> = {
  wall: "wall",
  "wall-dense": "wall",
  amber: "ground-amber",
  "amber-deep": "ground-amber-deep",
  navy: "ground-amber",
  "navy-saffron": "ground-amber-deep",
  plain: "",
};

const groundOf = (s: SiteSection): SectionGround =>
  (s.data?.layout?.ground as SectionGround) ?? "wall";
const columnOf = (s: SiteSection): "full" | "left" | "right" =>
  (s.data?.layout?.column as "full" | "left" | "right") ?? "full";

/* ------------------------------------------------------------ one block --- */

function Block({ section, site }: { section: SiteSection; site: SiteContent }) {
  const Renderer = RENDERERS[section.type];
  if (!Renderer) {
    // An unknown type means the panel is ahead of this deployment. Say so in
    // the markup rather than throwing the whole page away.
    if (process.env.NODE_ENV !== "production") {
      return (
        <div className="plate border-alert p-4">
          <p className="chart-label text-alert">Unknown section type “{section.type}”</p>
        </div>
      );
    }
    return null;
  }

  const layout: SectionLayout = section.data?.layout ?? {};
  const narrow = layout.width === "narrow";
  const anchor = typeof layout.anchor === "string" ? layout.anchor.trim() : "";

  const content = <Renderer data={section.data} site={site} section={section} />;

  if (!anchor && !narrow) return <>{content}</>;
  return (
    <div id={anchor || undefined} className={`${anchor ? "scroll-mt-24" : ""} ${narrow ? "mx-auto max-w-4xl" : ""}`.trim()}>
      {content}
    </div>
  );
}

/* --------------------------------------------------------------- bands --- */

interface Chunk {
  kind: "full" | "split";
  items: SiteSection[];
}

function chunkByColumn(sections: SiteSection[]): Chunk[] {
  const chunks: Chunk[] = [];
  for (const s of sections) {
    const kind: Chunk["kind"] = columnOf(s) === "full" ? "full" : "split";
    const last = chunks[chunks.length - 1];
    if (last && last.kind === kind) last.items.push(s);
    else chunks.push({ kind, items: [s] });
  }
  return chunks;
}

/**
 * Consecutive sections that print on the same ground become one band.
 *
 * They are grouped by the class the ground resolves to, not by its name:
 * several names now map to the same white, and grouping by name would open
 * two full bands of padding between two blocks a reader sees as one run.
 */
function bands(sections: SiteSection[]): { ground: SectionGround; sections: SiteSection[] }[] {
  const out: { ground: SectionGround; sections: SiteSection[] }[] = [];
  for (const s of sections) {
    const ground = groundOf(s);
    const last = out[out.length - 1];
    const same =
      last && (GROUND_CLASS[last.ground] ?? GROUND_CLASS.wall) === (GROUND_CLASS[ground] ?? GROUND_CLASS.wall);
    if (last && same) last.sections.push(s);
    else out.push({ ground, sections: [s] });
  }
  return out;
}

/**
 * Blocks that print edge to edge.
 *
 * The opening spread has to reach both margins of the window for its split to
 * read as one sheet, so a band made only of these drops the shell and the
 * band's own padding and lets the block carry its own measure.
 */
const BLEED_TYPES = new Set(["hero"]);

export function SectionList({ sections, site }: { sections: SiteSection[]; site: SiteContent }) {
  const visible = sections.filter((s) => s.enabled !== false);
  if (!visible.length) return null;

  return (
    <>
      {bands(visible).map((band, bandIndex) => {
        if (band.sections.every((s) => BLEED_TYPES.has(s.type))) {
          return (
            <section key={bandIndex} className={GROUND_CLASS[band.ground] ?? GROUND_CLASS.wall}>
              {band.sections.map((s) => (
                <Block key={s.id} section={s} site={site} />
              ))}
            </section>
          );
        }

        return (
        <section key={bandIndex} className={GROUND_CLASS[band.ground] ?? GROUND_CLASS.wall}>
          <div className="shell band space-y-[clamp(2.75rem,5vw,4.5rem)]">
            {chunkByColumn(band.sections).map((chunk, i) => {
              if (chunk.kind === "full") {
                return chunk.items.map((s) => <Block key={s.id} section={s} site={site} />);
              }

              const left = chunk.items.filter((s) => columnOf(s) === "left");
              const right = chunk.items.filter((s) => columnOf(s) === "right");
              // One block on the right against several on the left reads as a
              // form or summary card, so it tracks the reader down the page.
              const stickyRight = right.length === 1 && left.length > 1;

              return (
                <div key={i} className="grid gap-10 lg:grid-cols-2 lg:gap-[clamp(2.5rem,5vw,5rem)]">
                  <div className="space-y-10 lg:self-start">
                    {left.map((s) => (
                      <Block key={s.id} section={s} site={site} />
                    ))}
                  </div>
                  <div className={`space-y-10 lg:self-start ${stickyRight ? "lg:sticky lg:top-36" : ""}`}>
                    {right.map((s) => (
                      <Block key={s.id} section={s} site={site} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        );
      })}
    </>
  );
}

export { RENDERERS };
