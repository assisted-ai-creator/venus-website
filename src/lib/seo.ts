import type { SchoolSettings } from "./site";

/**
 * schema.org record for the school, built from whatever the panel currently
 * holds — so correcting the address or the enrolment figure updates the
 * structured data Google reads, not just the visible page.
 */
export function organisationSchema(school: SchoolSettings) {
  const primaryPhone = school.phones[1]?.number ?? school.phones[0]?.number ?? "";

  return {
    "@context": "https://schema.org",
    "@type": "School",
    name: school.name,
    alternateName: "Venus World School",
    url: school.siteUrl,
    logo: `${school.siteUrl}/photos/logo-mark-192.png`,
    image: `${school.siteUrl}/photos/campus-aerial.jpg`,
    description:
      "A CBSE-affiliated school in Manjari, Pune, serving Hadapsar and East Pune from Pre-Primary to Standard X.",
    foundingDate: school.established,
    slogan: school.motto,
    email: school.emails.helpdesk,
    telephone: primaryPhone
      ? `+91-${primaryPhone.replace(/\D/g, "").replace(/^91/, "")}`
      : undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: school.address.line1,
      addressLocality: school.address.line2,
      postalCode: school.address.postcode,
      addressRegion: school.address.state,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: Number(school.map.lat) || undefined,
      longitude: Number(school.map.lng) || undefined,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "14:00",
      },
    ],
    numberOfStudents: Number(String(school.record.students).replace(/[^\d]/g, "")) || undefined,
    sameAs: [school.social.youtube, school.social.facebook].filter(Boolean),
    identifier: [
      { "@type": "PropertyValue", name: "CBSE Affiliation Number", value: school.affiliationNo },
      { "@type": "PropertyValue", name: "CBSE School Code", value: school.schoolCode },
    ],
  };
}

export const breadcrumbSchema = (siteUrl: string, trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: t.name,
    item: `${siteUrl}${t.path}`,
  })),
});

/** Structured data for a blog post, so an article shows as one in search. */
export const articleSchema = (
  siteUrl: string,
  schoolName: string,
  post: {
    slug: string;
    title: string;
    excerpt: string;
    cover: string;
    publishedAt: number | null;
    updatedAt: number;
    author: string;
  }
) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: post.title,
  description: post.excerpt,
  image: post.cover
    ? [post.cover.startsWith("http") ? post.cover : `${siteUrl}${post.cover}`]
    : undefined,
  datePublished: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
  dateModified: new Date(post.updatedAt).toISOString(),
  author: { "@type": post.author ? "Person" : "Organization", name: post.author || schoolName },
  publisher: { "@type": "Organization", name: schoolName },
  mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
});
