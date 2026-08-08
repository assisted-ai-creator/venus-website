import Link from "next/link";
import { Wordmark } from "./Wordmark";
import { Icon } from "@/components/chart/Icon";
import { PublisherBlock } from "@/components/chart/Plate";
import type { FooterSettings, NavItem, SchoolSettings } from "@/lib/site";

const isExternal = (href: string) => /^https?:\/\//i.test(href);

export function SiteFooter({
  school,
  footer,
  nav,
}: {
  school: SchoolSettings;
  footer: FooterSettings;
  nav: NavItem[];
}) {
  // The panel can define footer columns explicitly; when it has not, the main
  // navigation stands in so the footer is never empty on a fresh install.
  const columns =
    footer.columns?.length
      ? footer.columns
      : [{ heading: "Pages", links: nav.map((n) => ({ label: n.label, href: n.href })) }];

  return (
    <footer className="wall wall-dense border-t-2 border-saffron">
      <div className="shell py-14 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.15fr_2fr]">
          <div>
            <Link href="/" className="inline-block text-paper">
              <Wordmark />
            </Link>
            {school.mottoDeva ? (
              <p className="deva mt-6 text-lg text-saffron">{school.mottoDeva}</p>
            ) : null}
            {school.motto ? <p className="mt-1 text-navy-200">{school.motto}</p> : null}

            <address className="mt-8 not-italic">
              <p className="chart-label mb-2 text-saffron">Campus</p>
              <p className="text-navy-100">
                {school.address.line1}
                <br />
                {school.address.line2} {school.address.postcode}
                <br />
                {school.address.state}, {school.address.country}
              </p>
            </address>

            {footer.showSocial !== false ? (
              <div className="mt-7 flex flex-wrap gap-3">
                {school.social.youtube ? (
                  <a
                    href={school.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost !px-3 !py-2"
                    aria-label={`${school.name} on YouTube`}
                  >
                    <Icon name="play" size={15} filled />
                    <span className="chart-label">YouTube</span>
                  </a>
                ) : null}
                {school.social.facebook ? (
                  <a
                    href={school.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost !px-3 !py-2"
                    aria-label={`${school.name} on Facebook`}
                  >
                    <span className="chart-label">Facebook</span>
                  </a>
                ) : null}
                {school.social.instagram ? (
                  <a
                    href={school.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-ghost !px-3 !py-2"
                    aria-label={`${school.name} on Instagram`}
                  >
                    <span className="chart-label">Instagram</span>
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {columns.slice(0, 2).map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h2 className="chart-label mb-4 text-saffron">{col.heading}</h2>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={`${col.heading}-${l.href}`}>
                      {isExternal(l.href) ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-navy-100 transition-colors hover:text-saffron"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="text-navy-100 transition-colors hover:text-saffron">
                          {l.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div>
              <h2 className="chart-label mb-4 text-saffron">Telephone</h2>
              <ul className="space-y-3">
                {/* Label above value, matching the Office hours column beside it. */}
                {school.phones.map((p) => (
                  <li key={p.number}>
                    <span className="chart-label block text-[0.68rem] text-navy-300">{p.label}</span>
                    <a
                      href={p.href}
                      className="tabular block text-navy-100 transition-colors hover:text-saffron"
                    >
                      {p.number}
                    </a>
                  </li>
                ))}
              </ul>

              <h2 className="chart-label mb-3 mt-7 text-saffron">Office hours</h2>
              <ul className="space-y-2">
                {school.hours.map((h) => (
                  <li key={h.days}>
                    <span className="block text-navy-100">{h.days}</span>
                    <span className="tabular text-sm text-navy-300">{h.time}</span>
                  </li>
                ))}
              </ul>

              {school.emails.helpdesk ? (
                <>
                  <h2 className="chart-label mb-3 mt-7 text-saffron">Email</h2>
                  <a
                    href={`mailto:${school.emails.helpdesk}`}
                    className="text-navy-100 transition-colors hover:text-saffron"
                  >
                    {/* Break after the @ rather than mid-word when the column is narrow. */}
                    {school.emails.helpdesk.split("@")[0]}@<wbr />
                    {school.emails.helpdesk.split("@")[1]}
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {footer.blurb ? (
          <p className="prose-chart mt-12 text-navy-200">{footer.blurb}</p>
        ) : null}

        <div className="mt-14 border-t-2 border-navy-700 pt-6">
          <PublisherBlock
            className="text-navy-200"
            items={[
              { label: "Board", value: school.board },
              { label: "Affiliation", value: school.affiliationNo },
              { label: "School code", value: school.schoolCode },
              { label: "Established", value: school.established },
            ].filter((i) => i.value)}
          />
          <p className="chart-label mt-5 text-navy-200">
            © {new Date().getFullYear()} {school.name}. All rights reserved.
            {footer.legal ? ` ${footer.legal}` : ""}
          </p>
        </div>
      </div>
    </footer>
  );
}
