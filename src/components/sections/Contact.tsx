import { Plate } from "@/components/chart/Plate";
import { Icon } from "@/components/chart/Icon";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { MapPlate } from "@/components/site/MapPlate";
import { Intro, SectionHeading, rows, str } from "./parts";
import type { SectionProps } from "./types";

/** The label that opens each block of contact details. */
function DetailHeading({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <h2 className={`chart-label on-ground-accent ${className}`}>{children}</h2>;
}

/** One hairline-ruled row: what it is on the left, what it says on the right. */
function DetailRow({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1 border-b border-paper-shade py-3.5">
      <dt className="text-[0.97rem] on-ground-faint">{term}</dt>
      <dd className="text-[0.97rem] font-semibold on-ground">{children}</dd>
    </div>
  );
}

/** Address, office hours and the email addresses, ruled off as a column. */
export function ContactPanel({ data, site }: SectionProps) {
  const s = site.settings.school;
  const custom = str(data.source, "school") === "custom";

  const addressLines = custom
    ? str(data.address).split("\n").filter(Boolean)
    : [s.address.line1, `${s.address.line2} ${s.address.postcode}`, `${s.address.state}, ${s.address.country}`];
  const locality = custom ? str(data.localityNote) : `Serving ${s.address.locality}`;
  const hours = custom
    ? rows(data.hours).map((h) => ({ days: str(h.days), time: str(h.time) }))
    : s.hours;

  const emails = [
    { address: s.emails.helpdesk, note: "General enquiries" },
    { address: s.emails.principal, note: "Principal’s office" },
  ].filter((e) => e.address);

  const mapsHref = s.map.query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.map.query)}`
    : "";

  return (
    <div>
      {str(data.plateTitle) ? <SectionHeading className="mb-8">{str(data.plateTitle)}</SectionHeading> : null}

      <DetailHeading>Campus</DetailHeading>
      <address className="mt-4 text-[1rem] not-italic leading-[1.75] on-ground-soft">
        {addressLines.map((line, i) => (
          <span key={i}>
            {line}
            {i < addressLines.length - 1 ? <br /> : null}
          </span>
        ))}
      </address>
      {locality ? <p className="mt-3 text-[0.93rem] on-ground-faint">{locality}</p> : null}
      {mapsHref ? (
        <a
          href={mapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="chart-label mt-4 inline-flex items-center gap-2 on-ground-accent hover-accent"
        >
          Open in maps
          <Icon name="arrow" size={12} />
        </a>
      ) : null}

      {hours.length ? (
        <>
          <DetailHeading className="mt-8">Office hours</DetailHeading>
          <dl className="mt-4 border-t border-paper-shade">
            {hours.map((h) => (
              <DetailRow key={h.days} term={h.days}>
                <span className="tabular">{h.time}</span>
              </DetailRow>
            ))}
          </dl>
          {str(data.hoursNote) ? (
            <p className="mt-3 text-[0.93rem] on-ground-faint">{str(data.hoursNote)}</p>
          ) : null}
        </>
      ) : null}

      {(data.showEmails ?? true) && emails.length ? (
        <>
          <DetailHeading className="mt-8">Email</DetailHeading>
          <ul className="mt-4 grid gap-3">
            {emails.map((e) => (
              <li key={e.address}>
                <a
                  href={`mailto:${e.address}`}
                  className="text-[0.97rem] font-medium break-words on-ground hover-accent"
                >
                  {e.address}
                </a>
                <span className="mt-0.5 block text-[0.88rem] on-ground-faint">{e.note}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export function PhonePanel({ data, site }: SectionProps) {
  const phones =
    str(data.source, "school") === "custom"
      ? rows(data.phones).map((p) => ({ label: str(p.label), number: str(p.number), href: str(p.href) }))
      : site.settings.school.phones;

  if (!phones.length) return null;

  return (
    <div>
      <DetailHeading>{str(data.plateTitle, "Telephone")}</DetailHeading>
      <dl className="mt-4 border-t border-paper-shade">
        {phones.map((p) => (
          <DetailRow key={p.number} term={p.label}>
            <a href={p.href} className="tabular on-ground hover-accent">
              {p.number}
            </a>
          </DetailRow>
        ))}
      </dl>
    </div>
  );
}

export function MapPanel({ data, site }: SectionProps) {
  const s = site.settings.school;
  const query = str(data.query) || s.map.query;
  const addressLine = str(data.addressLine) || `${s.address.line1}, ${s.address.line2} ${s.address.postcode}`;

  return (
    <MapPlate
      query={query}
      addressLine={addressLine}
      postcodeLine={`${s.address.line2} ${s.address.postcode}`}
      title={`Map showing ${s.name}, ${s.address.line2}`}
    />
  );
}

/**
 * The enquiry slip, with whichever of the school's contact details the page
 * needs beside it. Home, Admissions and Contact all use this block with
 * different switches rather than three near-identical layouts.
 */
export function EnquiryPanel({ data, site }: SectionProps) {
  const s = site.settings.school;
  const showPhones = data.showPhones ?? true;
  const showHours = data.showHours ?? true;
  const showMap = data.showMap ?? false;
  const hasAside = !!(str(data.heading) || str(data.intro) || showPhones || showHours || showMap);

  const titled = !!str(data.plateTitle);
  const form = (
    <Plate className="p-[clamp(1.625rem,3.5vw,2.75rem)]">
      {titled ? (
        <>
          <p className="chart-label on-ground-accent">{str(data.plateNumber, "Enquiry")}</p>
          <h2 className="display mt-3.5 text-[clamp(1.5rem,2.8vw,2.125rem)] leading-[1.2] on-ground">
            {str(data.plateTitle)}
          </h2>
        </>
      ) : null}
      <div className={titled ? "mt-8" : ""}>
        <EnquiryForm />
      </div>
    </Plate>
  );

  if (!hasAside) return form;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-[clamp(2.5rem,5vw,5rem)]">
      <div className="lg:order-1">{form}</div>

      <div className="lg:order-2">
        <SectionHeading>{str(data.heading)}</SectionHeading>
        <Intro>{str(data.intro)}</Intro>

        {showPhones && s.phones.length ? (
          <div className={str(data.heading) || str(data.intro) ? "mt-9" : ""}>
            <DetailHeading>Telephone</DetailHeading>
            <dl className="mt-4 border-t border-paper-shade">
              {s.phones.map((p) => (
                <DetailRow key={p.number} term={p.label}>
                  <a href={p.href} className="tabular on-ground hover-accent">
                    {p.number}
                  </a>
                </DetailRow>
              ))}
            </dl>
          </div>
        ) : null}

        {showHours && s.hours.length ? (
          <div className="mt-8">
            <DetailHeading>Office hours</DetailHeading>
            <dl className="mt-4 border-t border-paper-shade">
              {s.hours.map((h) => (
                <DetailRow key={h.days} term={h.days}>
                  <span className="tabular">{h.time}</span>
                </DetailRow>
              ))}
            </dl>
          </div>
        ) : null}

        {showMap ? (
          <MapPlate
            className="mt-9"
            query={s.map.query}
            addressLine={`${s.address.line1}, ${s.address.line2} ${s.address.postcode}`}
            postcodeLine={`${s.address.line2} ${s.address.postcode}`}
          />
        ) : null}
      </div>
    </div>
  );
}
