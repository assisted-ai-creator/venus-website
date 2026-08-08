"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { api, ApiError, type AdminUser } from "./api";
import { Button, ToastProvider } from "./ui";
import { Wordmark } from "@/components/site/Wordmark";

const NAV: { group: string; items: { href: string; label: string; ownerOnly?: boolean }[] }[] = [
  {
    group: "Content",
    items: [
      { href: "/admin", label: "Overview" },
      { href: "/admin/pages", label: "Pages & sections" },
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/albums", label: "Albums" },
      { href: "/admin/media", label: "Photographs" },
    ],
  },
  {
    group: "The school",
    items: [
      { href: "/admin/settings", label: "School details" },
      { href: "/admin/enquiries", label: "Enquiries" },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/security", label: "Access & IPs", ownerOnly: true },
      { href: "/admin/account", label: "Your account" },
    ],
  },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ user: AdminUser }>("/me")
      .then((r) => {
        if (!cancelled) setUser(r.user);
      })
      .catch((err) => {
        // The api client already redirects on 401; anything else is shown as a
        // signed-out state rather than an infinite spinner.
        if (!(err instanceof ApiError) || err.status !== 401) console.error(err);
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  const signOut = async () => {
    await api.del("/session").catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };

  if (checking) {
    return (
      <div className="wall grid min-h-dvh place-items-center">
        <p className="chart-label text-navy-200">Checking your session…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wall grid min-h-dvh place-items-center p-6">
        <div className="max-w-md text-center">
          <p className="chart-label text-saffron">Signed out</p>
          <p className="mt-3 text-navy-100">Your session has ended. Sign in again to continue.</p>
          <Link href="/admin/login" className="btn btn-primary mt-6">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const isCurrent = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <ToastProvider>
      <div className="adm-shell wall">
        <aside className={`adm-side ${menuOpen ? "" : "hidden lg:block"}`}>
          <div className="border-b-2 border-navy-700 p-4">
            <Link href="/admin" className="inline-block text-paper">
              <Wordmark />
            </Link>
            <p className="chart-label mt-3 text-saffron">Admin panel</p>
          </div>

          <nav aria-label="Panel" className="space-y-6 p-3">
            {NAV.map((group) => {
              const items = group.items.filter((i) => !i.ownerOnly || user.role === "owner");
              if (!items.length) return null;
              return (
                <div key={group.group}>
                  <p className="adm-nav-group">{group.group}</p>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="adm-nav-link"
                          aria-current={isCurrent(item.href) ? "page" : undefined}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </nav>

          <div className="border-t-2 border-navy-700 p-4">
            <p className="text-sm text-paper">{user.name}</p>
            <p className="chart-label text-navy-300">{user.role}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/" target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-sm">
                View site
              </a>
              <Button size="sm" onClick={signOut}>
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <div className="adm-main">
          <div className="adm-bar lg:hidden">
            <Link href="/admin" className="text-paper">
              <Wordmark compact />
            </Link>
            <Button onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
              {menuOpen ? "Close" : "Menu"}
            </Button>
          </div>
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}

/** The heading strip every panel screen opens with. */
export function ScreenHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-[clamp(1.6rem,3.6vw,2.4rem)] text-paper">{title}</h1>
        {description ? <p className="prose-chart mt-2 text-sm text-navy-200">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
