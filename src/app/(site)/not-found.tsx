import Link from "next/link";
import { Icon } from "@/components/chart/Icon";
import { getSite } from "@/lib/content";

export default async function NotFound() {
  const site = await getSite();
  const { school, nav } = site.settings;
  const helpline = school.phones[1] ?? school.phones[0];

  return (
    <section className="wall">
      <div className="shell band grid min-h-[60vh] place-items-center">
        <div className="w-full max-w-2xl">
          <p className="eyebrow tabular">Error 404</p>
          <h1 className="display mt-5 max-w-[14ch] text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.06] tracking-[-0.022em] on-ground">
            That page is not in the file
          </h1>
          <p className="mt-6 max-w-[52ch] text-[1.08rem] leading-[1.7] on-ground-soft text-pretty">
            The page you asked for does not exist, or it has moved. Everything on the site is
            reachable from the below links.
          </p>

          <ul className="mt-10 border-t border-rule-strong">
            {[{ label: "Home", href: "/" }, ...nav].map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="flex items-center justify-between gap-4 border-b border-paper-shade py-4 on-ground transition-colors hover-accent"
                >
                  <span className="display-sm text-[1.08rem]">{n.label}</span>
                  <Icon name="arrow" size={15} className="flex-none opacity-60" />
                </Link>
              </li>
            ))}
          </ul>

          {helpline ? (
            <p className="mt-8 text-[0.97rem] on-ground-soft">
              Still stuck? Call the school on{" "}
              <a href={helpline.href} className="tabular font-semibold on-ground-accent">
                {helpline.number}
              </a>
              .
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
