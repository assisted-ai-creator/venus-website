"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "./Wordmark";
import { Icon } from "@/components/chart/Icon";
import type { AdmissionStatus } from "@/lib/admissions";
import type { NavItem, SchoolSettings } from "@/lib/site";

/**
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
  const navRef = useRef<HTMLElement | null>(null);

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
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [openMenu]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const session = school.admissionWindow.session;

  /** Opening the sheet reveals where the reader already is. */
  const openSheet = () => {
    setExpanded(
      nav.filter((i) => i.children?.length && isActive(i.href)).map((i) => i.label)
    );
    setOpen(true);
  };

  const toggleGroup = (label: string) =>
    setExpanded((v) => (v.includes(label) ? v.filter((l) => l !== label) : [...v, label]));

  return (
    <header className="on-ink sticky top-0 z-50">
      {/* The school's live notice, printed as a running strip. A window that
          has run out loses the saffron with it — closed is not a callout. */}
      {session || admissions.detail ? (
        <div
          className={
            admissions.state === "closed"
              ? "bg-navy-800 text-navy-100"
              : "bg-saffron text-ink"
          }
        >
          <div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5">
            <p className="chart-label">{admissions.label}</p>
            {admissions.detail ? (
              <p className="chart-label tabular opacity-75">{admissions.detail}</p>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="border-b-2 border-navy-700 bg-navy-900/95 backdrop-blur-sm">
        <div className="shell flex items-center justify-between gap-6 py-3">
          <Link
            href="/"
            className="text-paper transition-opacity hover:opacity-80"
            aria-label={`${school.name} — home`}
          >
            <Wordmark />
          </Link>

          <nav ref={navRef} aria-label="Main" className="hidden items-center gap-1 lg:flex">
            {nav.map((item) =>
              item.children?.length ? (
                <div key={item.label} className="relative">
                  <button
                    type="button"
                    aria-expanded={openMenu === item.label}
                    aria-haspopup="true"
                    onClick={() => setOpenMenu(openMenu === item.label ? null : item.label)}
                    className={`chart-label flex items-center gap-1.5 px-3 py-2.5 transition-colors ${
                      isActive(item.href) ? "text-saffron" : "text-paper hover:text-saffron"
                    }`}
                  >
                    {item.label}
                    <Icon
                      name="chevron"
                      size={12}
                      className={`transition-transform ${openMenu === item.label ? "rotate-90" : ""}`}
                    />
                  </button>
                  {openMenu === item.label ? (
                    <div className="plate absolute left-0 top-full mt-2 w-72 p-1.5">
                      <ul>
                        {item.children.map((c) => (
                          <li key={c.href}>
                            <Link
                              href={c.href}
                              className="block px-3 py-2 transition-colors hover:bg-saffron-100"
                            >
                              <span className="block text-[0.92rem] font-semibold">{c.label}</span>
                              {c.note ? (
                                <span className="chart-label mt-0.5 block text-[0.68rem] text-ink-soft">
                                  {c.note}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`chart-label px-3 py-2.5 transition-colors ${
                    isActive(item.href) ? "text-saffron" : "text-paper hover:text-saffron"
                  }`}
                >
                  {item.label}
                </Link>
              )
            )}
            {school.registrationUrl && admissions.showRegister ? (
              <a
                href={school.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary ml-2"
              >
                Register
              </a>
            ) : null}
          </nav>

          <button
            type="button"
            onClick={openSheet}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="btn btn-ghost !px-3 !py-2 lg:hidden"
          >
            <Icon name="menu" size={18} />
            <span className="sr-only">Open menu</span>
          </button>
        </div>
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
        className="nav-sheet lg:hidden"
      >
        <div className="flex-none border-b-2 border-navy-700">
          <div className="shell flex items-center justify-between gap-6 py-3">
            <Link href="/" className="text-paper" aria-label={`${school.name} — home`}>
              <Wordmark />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-ghost !px-3 !py-2"
            >
              <Icon name="close" size={18} />
              <span className="sr-only">Close menu</span>
            </button>
          </div>
        </div>

        <nav aria-label="Main, mobile" className="shell flex-1 py-6">
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
                        className={`display flex w-full items-center justify-between gap-4 py-4 text-left text-2xl transition-colors ${
                          isActive(item.href) ? "text-saffron" : "text-paper"
                        }`}
                      >
                        {item.label}
                        <Icon
                          name="chevron"
                          size={16}
                          className={`flex-none transition-transform duration-300 ${
                            isOpen ? "rotate-90" : ""
                          }`}
                        />
                      </button>

                      <div id={`nav-group-${i}`} data-open={isOpen ? "true" : "false"} className="nav-drawer">
                        <div>
                          <ul className="mb-4 space-y-0.5 border-l-2 border-navy-700 pl-4">
                            {children.map((c) => (
                              <li key={c.href}>
                                <Link
                                  href={c.href}
                                  className="block py-2 text-[0.98rem] text-navy-200 transition-colors hover:text-saffron"
                                >
                                  {c.label}
                                  {c.note ? (
                                    <span className="chart-label mt-0.5 block text-[0.62rem] text-navy-300 opacity-70">
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
                      className={`display block py-4 text-2xl transition-colors ${
                        isActive(item.href) ? "text-saffron" : "text-paper"
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
        </nav>
      </div>
    </header>
  );
}
