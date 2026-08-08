import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { admissionStatus } from "@/lib/admissions";
import { getSite } from "@/lib/content";
import { organisationSchema } from "@/lib/seo";

/**
 * The public site's chrome. Header, footer, title template and structured data
 * all read from the CMS, so renaming a menu item or correcting the address is
 * an edit in the panel rather than a deployment.
 */
export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getSite();
  const { school, seo } = settings;

  return {
    metadataBase: new URL(school.siteUrl || "https://venusworldschools.org"),
    title: { default: seo.defaultTitle, template: seo.titleTemplate },
    description: seo.description,
    keywords: seo.keywords,
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: school.name,
      url: school.siteUrl,
      title: seo.defaultTitle,
      description: seo.description,
      images: seo.ogImage
        ? [{ url: seo.ogImage, width: 1600, height: 1200, alt: `${school.name} campus` }]
        : [],
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true },
    icons: { icon: "/photos/logo-mark-192.png", apple: "/photos/logo-mark-192.png" },
  };
}

/**
 * The direction contract for this build, emitted as a real HTML comment so it
 * survives the production build and stays auditable in the shipped markup.
 * A JSX comment would be stripped by the compiler.
 */
const DIRECTION_CONTRACT = `<!--
THESIS: A school that explains itself the way it teaches. Every claim is diagrammed,
numbered and labelled like the offset-printed classroom chart on an Indian schoolroom
wall. It refuses the category default: a full-bleed slider of smiling children over a
blue-orange gradient, four facility icon cards, animated counters, testimonial carousel.
OWN-WORLD: Oxford/federal blue ground under a blueprint grid; chart-stock plates with
2px ink keylines; saffron #FFAB1F as the callout and action ink; numbered circled
callouts on drawn leader lines; bilingual Devanagari and Latin labels; Bricolage
Grotesque engraved, Archivo Narrow tracked for chart labels, Tiro Devanagari Marathi.
STORY: A parent comparing five Pune schools at night sees a school that can be
verified - affiliation number, pass rate, classroom count, fee table - and reaches the
enquiry form or the Vidyalekha portal in one tap.
FIRST VIEWPORT: Full-bleed blue chart; the school name engraved at plate scale with the
Marathi motto; a numbered campus cutaway keying 35 classrooms, 5 laboratories, the
Vedpathshala and 3,245 sq m; the banner slider mounted as a keylined specimen plate;
publisher block carrying Affiliation 1131024, School Code 22551, Est. 2016; saffron CTA.
FORM: The Wall Chart - candidate 5 of the grounded list, seed key 3be9b09d.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish
review, the verdict, and DESIGN.md
-->`;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const site = await getSite();

  return (
    <>
      <div hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader
        school={site.settings.school}
        nav={site.settings.nav}
        admissions={admissionStatus(site.settings.school.admissionWindow)}
      />
      <main id="main">{children}</main>
      <SiteFooter school={site.settings.school} footer={site.settings.footer} nav={site.settings.nav} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organisationSchema(site.settings.school)),
        }}
      />
    </>
  );
}
