"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import { Icon } from "@/components/chart/Icon";
import type { AdmissionStatus } from "@/lib/admissions";
import type { NavItem, SchoolSettings } from "@/lib/site";

/**
 * The masthead, in three strips: the four-colour register bar, the navy record
 * strip, and the white navigation row the page hangs from.
 *
 * The record strip carries one line. When the school has a live admissions
 * notice that line is the notice, because it is the thing a parent came for;
 * otherwise it falls back to the filing numbers, which is what makes the strip
 * a record rather than a banner. The numbers are printed in full in the footer
 * either way, so nothing is lost when the notice takes the space.
 *
 * `admissions` is worked out on the server and handed down rather than
 * computed here: the strip is the same for every reader of one request, and a
 * clock read during hydration would only invite it to disagree with itself.
 */
export function SiteHeader({
  school,
  nav,
  admissions,
}: {
  school: SchoolSettings;
  nav: NavItem[];
  admissions: AdmissionStatus;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  /** Which mobile groups are expanded. The one holding the current page opens. */
  const [expanded, setExpanded] = useState<string[]>([]);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    // The sheet covers the screen; the page behind it should not scroll under
    // a thumb that misses a link.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMenu]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const session = school.admissionWindow.session;

  /** The one line the record strip prints, in order of what a parent needs. */
  const recordLine =
    session || admissions.detail
      ? [admissions.label, admissions.detail].filter(Boolean).join(" · ")
      : [
          school.affiliationNo ? `CBSE Affiliation No. ${school.affiliationNo}` : "",
          school.schoolCode ? `School Code ${school.schoolCode}` : "",
          school.address.locality,
        ]
          .filter(Boolean)
          .join(" · ");

  /** Opening the sheet reveals where the reader already is. */
  const openSheet = () => {
    setExpanded(
      nav.filter((i) => i.children?.length && isActive(i.href)).map((i) => i.label)
    );
    setOpen(true);
  };

  const toggleGroup = (label: string) =>
    setExpanded((v) => (v.includes(label) ? v.filter((l) => l !== label) : [...v, label]));

  const primaryPhone = school.phones[0];

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* The register bar: the school's four coding inks, printed as a strip. */}
      <div className="register-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="on-ink bg-navy-900 text-navy-100">
        <div className="shell flex h-[38px] items-center justify-between gap-6">
          <p className="chart-label truncate">{recordLine}</p>

          <div className="hidden flex-none items-center gap-6 sm:flex">
            <Link href="/notices" className="chart-label transition-colors hover:text-saffron">
              Notices
            </Link>
            <Link href="/blog" className="chart-label transition-colors hover:text-saffron">
              Blog
            </Link>
            {primaryPhone ? (
              <a
                href={primaryPhone.href}
                className="chart-label tabular hidden text-white transition-colors hover:text-saffron md:block"
              >
                {primaryPhone.number}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div ref={navRef} className="relative border-b border-hairline bg-white/97 backdrop-blur-sm">
        <div className="shell flex h-[78px] items-center justify-between gap-8">
          <Link href="/" className="flex-none" aria-label={`${school.name} — home`}>
            <Wordmark />
          </Link>

          <nav aria-label="Main" className="hidden items-center lg:flex">
            {nav.map((item) => {
              const active = isActive(item.href);

              return item.children?.length ? (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={openMenu === item.label}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                    onMouseEnter={() => setOpenMenu(item.label)}
                    className={`flex items-center gap-1.5 px-3.5 py-7 text-[0.92rem] font-semibold transition-colors ${
                      active || openMenu === item.label ? "text-navy-700" : "text-ink hover:text-navy-700"
                    }`}
                  >
                    {item.label}
                    <Icon
                      name="chevron"
                      size={10}
                      className={`rotate-90 opacity-55 transition-transform ${
                        openMenu === item.label ? "-rotate-90" : ""
                      }`}
                    />
                  </button>
                  {active ? (
                    <span aria-hidden="true" className="absolute inset-x-3.5 bottom-0 h-[3px] bg-navy-700" />
                  ) : null}
                </div>
              ) : (
                <div key={item.href} className="relative">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onMouseEnter={() => setOpenMenu(null)}
                    className={`block px-3.5 py-7 text-[0.92rem] font-semibold transition-colors ${
                      active ? "text-navy-700" : "text-ink hover:text-navy-700"
                    }`}
                  >
                    {item.label}
                  </Link>
                  {active ? (
                    <span aria-hidden="true" className="absolute inset-x-3.5 bottom-0 h-[3px] bg-navy-700" />
                  ) : null}
                </div>
              );
            })}

            {school.registrationUrl && admissions.showRegister ? (
              <a
                href={school.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ink ml-4 !py-3.5"
              >
                {session ? `Register ${session}` : "Register"}
                <Icon name="arrow" size={14} />
              </a>
            ) : null}
          </nav>

          <button
            type="button"
            onClick={openSheet}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="-mr-1 flex flex-col gap-[5px] p-3 lg:hidden"
          >
            <span aria-hidden="true" className="block h-[2px] w-[26px] bg-ink" />
            <span aria-hidden="true" className="block h-[2px] w-[26px] bg-ink" />
            <span aria-hidden="true" className="block h-[2px] w-[26px] bg-ink" />
            <span className="sr-only">Open menu</span>
          </button>
        </div>

        {/*
          The drop panel. One layout for every section: what the section is on
          the left, everything filed under it on the right, so a reader can
          reach a sub-page without first landing on its index.
        */}
        {nav.map((item) =>
          item.children?.length && openMenu === item.label ? (
            <div
              key={item.label}
              className="mega hidden lg:block"
              onMouseLeave={() => setOpenMenu(null)}
            >
              <div className="shell grid grid-cols-[minmax(0,0.75fr)_minmax(0,2fr)] gap-16 py-10">
                <div>
                  <p className="eyebrow">{item.label}</p>
                  <Link href={item.href} className="btn-link mt-5">
                    Go to {item.label}
                    <Icon name="arrow" size={13} />
                  </Link>
                </div>

                <ul className="grid grid-cols-2 gap-x-12">
                  {item.children.map((c) => (
                    <li key={c.href}>
                      <Link
                        href={c.href}
                        className="block border-b border-[#edf0f3] py-3.5 text-[0.95rem] font-semibold text-ink transition-colors hover:text-navy-700"
                      >
                        {c.label}
                        {c.note ? (
                          <span className="chart-label mt-0.5 block text-[0.64rem] text-ink-faint">
                            {c.note}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : null
        )}
      </div>

      {/*
        Kept in the tree rather than mounted on open, so it can animate shut as
        well as open. `inert` is what removes it from the tab order while it is
        hidden — visibility alone would leave its links reachable.
      */}
      <div
        id="mobile-nav"
        data-open={open ? "true" : "false"}
        inert={!open}
        aria-hidden={!open}
        className="nav-sheet on-ink lg:hidden"
      >
        <div className="flex-none border-b border-navy-750">
          <div className="shell flex items-center justify-between gap-6 py-3.5">
            <Link href="/" aria-label={`${school.name} — home`}>
              <Wordmark compact onDark />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="grid h-11 w-11 place-items-center border border-navy-750 text-white transition-colors hover:border-saffron hover:text-saffron"
            >
              <Icon name="close" size={18} />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
        </div>

        <nav aria-label="Main, mobile" className="shell flex-1 py-7">
          <ul>
            {nav.map((item, i) => {
              const isOpen = expanded.includes(item.label);

              // A section page the submenu does not already name stays
              // reachable: the row itself becomes a toggle, so without this
              // there would be no way to reach /academics.
              const children = item.children?.length
                ? item.children.some((c) => c.href === item.href)
                  ? item.children
                  : [{ label: `${item.label} overview`, href: item.href }, ...item.children]
                : null;

              return (
                <li
                  key={item.label}
                  className="nav-entry border-b border-navy-800"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  {children ? (
                    <>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.label)}
                        aria-expanded={isOpen}
                        aria-controls={`nav-group-${i}`}
                        className={`display flex w-full items-center justify-between gap-4 py-4 text-left text-[1.75rem] transition-colors ${
                          isActive(item.href) ? "text-saffron" : "text-white"
                        }`}
                      >
                        {item.label}
                        <Icon
                          name="chevron"
                          size={15}
                          className={`flex-none rotate-90 opacity-60 transition-transform duration-300 ${
                            isOpen ? "-rotate-90" : ""
                          }`}
                        />
                      </button>

                      <div id={`nav-group-${i}`} data-open={isOpen ? "true" : "false"} className="nav-drawer">
                        <div>
                          <ul className="mb-4 border-l border-navy-750 pl-4">
                            {children.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  className="block py-2 text-[0.98rem] text-navy-100 transition-colors hover:text-saffron"
                                >
                                  {c.label}
                                  {c.note ? (
                                    <span className="chart-label mt-0.5 block text-[0.62rem] text-navy-300">
                                      {c.note}
                                    </span>
                                  ) : null}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={`display block py-4 text-[1.75rem] transition-colors ${
                        isActive(item.href) ? "text-saffron" : "text-white"
                      }`}
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {school.registrationUrl && admissions.showRegister ? (
            <a
              href={school.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-entry btn btn-primary mt-7 w-full"
              style={{ "--i": nav.length } as React.CSSProperties}
            >
              Register{session ? ` for ${session}` : ""}
            </a>
          ) : null}

          {primaryPhone ? (
            <a
              href={primaryPhone.href}
              className="nav-entry btn btn-ghost tabular mt-3 w-full"
              style={{ "--i": nav.length + 1 } as React.CSSProperties}
            >
              {primaryPhone.number}
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
