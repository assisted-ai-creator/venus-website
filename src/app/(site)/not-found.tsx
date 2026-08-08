import Link from "next/link";
import { Icon } from "@/components/chart/Icon";
import { Plate, TitleBand } from "@/components/chart/Plate";
import { getSite } from "@/lib/content";

export default async function NotFound() {
  const site = await getSite();
  const { school, nav } = site.settings;
  const helpline = school.phones[1] ?? school.phones[0];

  return (
    <section className="wall">
      <div className="shell grid min-h-[60vh] place-items-center py-20">
        <div className="w-full max-w-2xl">
          <p className="display text-[clamp(4rem,16vw,9rem)] leading-none on-ground-accent">404</p>
          <h1 className="display mt-2 text-[clamp(1.8rem,4.5vw,2.8rem)] on-ground">
            That sheet is not in the series
          </h1>
          <p className="prose-chart mt-4 on-ground-soft">
            The page you asked for does not exist, or it has moved. Everything on the site is
            reachable from the list below.
          </p>

          <Plate className="mt-9">
            <TitleBand plate="INDEX">Where to go</TitleBand>
            <ul className="divide-y-2 divide-paper-shade">
              <li>
                <Link
                  href="/"
                  className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-saffron-100"
                >
                  <span className="display text-base">Home</span>
                  <Icon name="arrow" size={16} />
                </Link>
              </li>
              {nav.map((n) => (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className="flex items-center justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-saffron-100"
                  >
                    <span className="display text-base">{n.label}</span>
                    <Icon name="arrow" size={16} />
                  </Link>
                </li>
              ))}
            </ul>
          </Plate>

          {helpline ? (
            <p className="mt-7 on-ground-soft">
              Still stuck? Call the school on{" "}
              <a href={helpline.href} className="tabular font-semibold on-ground-accent underline">
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
