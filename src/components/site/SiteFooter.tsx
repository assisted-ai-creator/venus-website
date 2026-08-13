import Link from "next/link";
import { Wordmark } from "./Wordmark";
import type { FooterSettings, NavItem, SchoolSettings } from "@/lib/site";

const isExternal = (href: string) => /^https?:\/\//i.test(href);

/**
 * The colophon.
 *
 * Everything a parent might need to act on — where the school is, which desk
 * to ring, when the office is open — printed once, in full, at the foot of
 * every page, above the filing numbers that make the site a record.
 */
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

  const social = [
    { href: school.social.youtube, label: "YouTube" },
    { href: school.social.facebook, label: "Facebook" },
    { href: school.social.instagram ?? "", label: "Instagram" },
  ].filter((s) => s.href);

  return (
    <footer className="ground-ink on-ink">
      <div className="shell pt-[clamp(3.5rem,7vw,5.75rem)]">
        <div className="grid gap-[clamp(2.5rem,6vw,5.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
          <div>
            <Link href="/" aria-label={`${school.name} — home`}>
              <Wordmark size={74} onDark />
            </Link>

            {school.motto ? (
              <p className="display mt-7 max-w-[20ch] text-[1.45rem] leading-[1.4] text-white">
                {school.motto}
              </p>
            ) : null}
            {school.mottoDeva ? (
              <p className="deva mt-1.5 text-lg text-saffron">{school.mottoDeva}</p>
            ) : null}

            <address className="mt-8 text-[0.97rem] not-italic leading-[1.75] text-navy-200">
              {school.address.line1}
              <br />
              {school.address.line2} {school.address.postcode}
              <br />
              {school.address.state}, {school.address.country}
            </address>

            {footer.showSocial !== false && social.length ? (
              <div className="mt-7 flex flex-wrap gap-2.5">
                {social.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="chart-label border border-navy-750 px-4 py-2.5 text-navy-100 transition-colors hover:border-saffron hover:text-saffron"
                    aria-label={`${school.name} on ${s.label}`}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-[clamp(1.75rem,4vw,3rem)] sm:grid-cols-2 lg:grid-cols-3">
            {columns.slice(0, 2).map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h2 className="chart-label mb-4 text-saffron">{col.heading}</h2>
                <ul className="grid gap-2.5 text-[0.97rem]">
                  {col.links.map((l) => (
                    <li key={`${col.heading}-${l.href}`}>
                      {isExternal(l.href) ? (
                        <a
                          href={l.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-navy-100 transition-colors hover:text-white"
                        >
                          {l.label}
                        </a>
                      ) : (
                        <Link href={l.href} className="text-navy-100 transition-colors hover:text-white">
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
              <ul className="grid gap-3.5">
                {school.phones.map((p) => (
                  <li key={p.number}>
                    <span className="chart-label block text-[0.64rem] text-navy-300">{p.label}</span>
                    <a
                      href={p.href}
                      className="tabular text-[0.97rem] text-white transition-colors hover:text-saffron"
                    >
                      {p.number}
                    </a>
                  </li>
                ))}
              </ul>

              {school.hours.length ? (
                <>
                  <h2 className="chart-label mb-3 mt-7 text-saffron">Office hours</h2>
                  <ul className="grid gap-2">
                    {school.hours.map((h) => (
                      <li key={h.days} className="text-[0.97rem] text-navy-200">
                        {h.days}
                        <br />
                        <span className="tabular text-white">{h.time}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}

              {school.emails.helpdesk ? (
                <>
                  <h2 className="chart-label mb-3 mt-7 text-saffron">Email</h2>
                  <a
                    href={`mailto:${school.emails.helpdesk}`}
                    className="text-[0.95rem] break-words text-navy-100 transition-colors hover:text-white"
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

        <div className="mt-[clamp(3rem,6vw,4.75rem)] flex flex-wrap items-baseline justify-between gap-x-10 gap-y-5 border-t border-navy-750 pt-6 pb-8">
          <dl className="flex flex-wrap gap-x-8 gap-y-2">
            {[
              { label: "Board", value: school.board },
              { label: "Affiliation", value: school.affiliationNo },
              { label: "School code", value: school.schoolCode },
              { label: "Established", value: school.established },
            ]
              .filter((i) => i.value)
              .map((i) => (
                <div key={i.label} className="flex gap-2">
                  <dt className="chart-label text-navy-300">{i.label}</dt>
                  <dd className="chart-label tabular text-white">{i.value}</dd>
                </div>
              ))}
          </dl>
          <p className="chart-label text-navy-300">
            © {new Date().getFullYear()} {school.name}
            {footer.legal ? ` · ${footer.legal}` : ""}
          </p>
        </div>
      </div>

      <div className="register-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>
    </footer>
  );
}
