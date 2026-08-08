import { facilities } from "@/content/pages";
import { Plate, TitleBand } from "./Plate";

/**
 * The campus facilities, set as a printed chart legend rather than a grid of
 * icon cards — a ruled key is what a classroom chart actually uses, and it
 * carries ten entries without pretending each is a separate destination.
 *
 * Entries are lettered A–J so they never read as continuous with the numbered
 * campus key on the home page, which points at six places on the drawing.
 */
export function FacilityKey({ className = "" }: { className?: string }) {
  const letter = (n: number) => String.fromCharCode(64 + n);

  return (
    <Plate className={className}>
      <TitleBand plate="KEY A–J">Facilities on the campus</TitleBand>
      <ol className="grid sm:grid-cols-2">
        {facilities.map((f, i) => (
          <li
            key={f.n}
            className={`flex gap-4 px-5 py-4 ${
              i < facilities.length - 1 ? "border-b-2 border-paper-shade" : ""
            } ${i % 2 === 0 ? "sm:border-r-2 sm:border-r-paper-shade" : ""} ${
              i >= facilities.length - 2 ? "sm:border-b-0" : ""
            }`}
          >
            <span
              aria-hidden="true"
              className="callout-num mt-0.5 !h-7 !w-7 flex-none !rounded-none !text-[0.72rem]"
            >
              {letter(f.n)}
            </span>
            <span>
              <span className="display block text-[1.05rem] leading-tight">
                {f.name}
                {f.deva ? (
                  <span className="deva ml-2 text-base font-normal text-amber-ink">
                    {f.deva}
                  </span>
                ) : null}
              </span>
              <span className="mt-1 block text-sm text-ink-soft">{f.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </Plate>
  );
}
