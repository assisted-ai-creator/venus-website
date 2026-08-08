import { Plate, TitleBand } from "@/components/chart/Plate";
import { Icon } from "@/components/chart/Icon";
import { EnquiryForm } from "@/components/site/EnquiryForm";
import { MapPlate } from "@/components/site/MapPlate";
import { Intro, SectionHeading, rows, str } from "./parts";
import type { SectionProps } from "./types";

/** Address, office hours and the email addresses, as one card. */
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

  return (
    <Plate>
      {str(data.plateTitle) ? <TitleBand plate="CARD">{str(data.plateTitle)}</TitleBand> : null}
      <div className="space-y-6 p-5 sm:p-7">
        <div className="flex gap-4">
          <span className="mt-0.5 flex-none text-amber-ink">
            <Icon name="pin" size={22} />
          </span>
          <address className="not-italic">
            <h2 className="chart-label mb-1.5 opacity-65">Campus</h2>
            <p className="text-lg leading-snug">
              {addressLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < addressLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            {locality ? <p className="mt-2 text-sm text-ink-soft">{locality}</p> : null}
          </address>
        </div>

        {hours.length ? (
          <div className="flex gap-4">
            <span className="mt-0.5 flex-none text-amber-ink">
              <Icon name="clock" size={22} />
            </span>
            <div>
              <h2 className="chart-label mb-1.5 opacity-65">Office hours</h2>
              <dl className="space-y-1">
                {hours.map((h) => (
                  <div key={h.days} className="flex flex-wrap gap-x-3">
                    <dt className="font-semibold">{h.days}</dt>
                    <dd className="tabular text-ink-soft">{h.time}</dd>
                  </div>
                ))}
              </dl>
              {str(data.hoursNote) ? (
                <p className="mt-2 text-sm text-ink-soft">{str(data.hoursNote)}</p>
              ) : null}
            </div>
          </div>
        ) : null}

        {(data.showEmails ?? true) && (s.emails.helpdesk || s.emails.principal) ? (
          <div className="flex gap-4">
            <span className="mt-0.5 flex-none text-amber-ink">
              <Icon name="mail" size={22} />
            </span>
            <div>
              <h2 className="chart-label mb-1.5 opacity-65">Email</h2>
              <ul className="space-y-1">
                {[
                  { address: s.emails.helpdesk, note: "General enquiries" },
                  { address: s.emails.principal, note: "Principal’s office" },
                ]
                  .filter((e) => e.address)
                  .map((e) => (
                    <li key={e.address} className="pt-1 first:pt-0">
                      <a
                        href={`mailto:${e.address}`}
                        className="break-all font-semibold underline underline-offset-2"
                      >
                        {e.address}
                      </a>
                      <span className="block text-sm text-ink-soft">{e.note}</span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </Plate>
  );
}

export function PhonePanel({ data, site }: SectionProps) {
  const phones =
    str(data.source, "school") === "custom"
      ? rows(data.phones).map((p) => ({ label: str(p.label), number: str(p.number), href: str(p.href) }))
      : site.settings.school.phones;

  if (!phones.length) return null;

  return (
    <Plate>
      {str(data.plateTitle) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}
      <ul className="divide-y-2 divide-paper-shade">
        {phones.map((p) => (
          <li key={p.number} className="flex items-center justify-between gap-4 px-5 py-3.5">
            <span>
              <span className="chart-label block opacity-65">{p.label}</span>
              <a href={p.href} className="tabular text-lg font-semibold underline underline-offset-2">
                {p.number}
              </a>
            </span>
            <a
              href={p.href}
              className="btn btn-ink !px-3 !py-2"
              aria-label={`Call ${p.label} on ${p.number}`}
            >
              <Icon name="phone" size={15} />
            </a>
          </li>
        ))}
      </ul>
    </Plate>
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

  const form = (
    <Plate>
      {str(data.plateTitle) ? (
        <TitleBand plate={str(data.plateNumber) || undefined}>{str(data.plateTitle)}</TitleBand>
      ) : null}
      <EnquiryForm />
    </Plate>
  );

  if (!hasAside) return form;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:gap-14">
      <div>
        <SectionHeading>{str(data.heading)}</SectionHeading>
        <Intro>{str(data.intro)}</Intro>

        {showPhones || showHours ? (
          <dl className="mt-8 space-y-4">
            {showPhones
              ? s.phones.map((p) => (
                  <div key={p.number} className="flex items-center gap-4">
                    <span className="flex-none on-ground-accent">
                      <Icon name="phone" size={20} />
                    </span>
                    <span>
                      <dt className="chart-label on-ground-faint">{p.label}</dt>
                      <dd>
                        <a href={p.href} className="tabular text-lg on-ground hover-accent">
                          {p.number}
                        </a>
                      </dd>
                    </span>
                  </div>
                ))
              : null}

            {showHours && s.hours[0] ? (
              <div className="flex items-center gap-4">
                <span className="flex-none on-ground-accent">
                  <Icon name="clock" size={20} />
                </span>
                <span>
                  <dt className="chart-label on-ground-faint">Office hours</dt>
                  <dd className="on-ground">
                    {s.hours[0].days}, {s.hours[0].time}
                  </dd>
                </span>
              </div>
            ) : null}
          </dl>
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

      {form}
    </div>
  );
}
