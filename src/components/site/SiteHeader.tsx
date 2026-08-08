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
    return () => document.removeEventListener("keydown", onKey);
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
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="btn btn-ghost !px-3 !py-2 lg:hidden"
          >
            <Icon name={open ? "close" : "menu"} size={18} />
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-7rem)] overflow-y-auto border-b-2 border-navy-700 bg-navy-900 lg:hidden"
        >
          <nav aria-label="Main, mobile" className="shell py-5">
            <ul className="space-y-5">
              {nav.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="display block text-2xl text-paper">
                    {item.label}
                  </Link>
                  {item.children?.length ? (
                    <ul className="mt-2 space-y-1 border-l-2 border-navy-700 pl-4">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className="block py-1 text-[0.95rem] text-navy-200 transition-colors hover:text-saffron"
                          >
                            {c.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
            {school.registrationUrl && admissions.showRegister ? (
              <a
                href={school.registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-7 w-full"
              >
                Register{session ? ` for ${session}` : ""}
              </a>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
