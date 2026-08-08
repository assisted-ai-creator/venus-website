/**
 * The site as it stands today, expressed as CMS data.
 *
 * This file does two jobs. It is the payload `scripts/seed-cms.mjs` posts to
 * the API so the panel opens on the real site rather than on a blank page, and
 * it is the fallback `lib/content.ts` renders from if the API cannot be
 * reached — so a content outage degrades to the last known-good site instead
 * of a 500.
 *
 * Nothing here is new copy. Every string is lifted from the typed content
 * layer beside it, which in turn came from the school's own published record.
 */

import { school, geo, fees, ageCriteria, admissionDocuments, admissionSteps } from "./school";
import { programs } from "./programs";
import {
  aboutPages,
  visionMission,
  management,
  campusKey,
  facilities,
  news,
  boardResults,
} from "./pages";
import { albums, heroSlides, videos } from "./gallery";
import { navigation } from "../components/site/nav";
import { isPlaceholder } from "./types";
import type { SiteContent, SitePage, SiteSection, SiteSettings } from "../lib/site";

let sectionCounter = 0;
const section = (
  type: string,
  data: Record<string, unknown>,
  opts: { label?: string; enabled?: boolean } = {}
): SiteSection => ({
  id: `seed_${type}_${++sectionCounter}`,
  type,
  label: opts.label ?? "",
  enabled: opts.enabled !== false,
  data,
});

const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/* ------------------------------------------------------------- settings --- */

export const seedSettings: SiteSettings = {
  school: {
    name: school.name,
    shortName: school.shortName,
    motto: school.motto,
    mottoDeva: school.mottoDeva,
    tagline: school.tagline,
    board: school.board,
    affiliationNo: school.affiliationNo,
    schoolCode: school.schoolCode,
    established: String(school.established),
    address: { ...school.address },
    phones: school.phones.map((p) => ({ ...p })),
    emails: { ...school.emails },
    hours: school.hours.map((h) => ({ ...h })),
    social: { ...school.social },
    registrationUrl: school.registrationUrl,
    siteUrl: school.siteUrl,
    map: { query: geo.mapQuery, lat: String(geo.lat), lng: String(geo.lng) },
    admissionWindow: { ...school.admissionWindow },
    record: {
      students: school.record.students.toLocaleString("en-IN"),
      teachers: String(school.record.teachers),
      teacherBreakdown: school.record.teacherBreakdown,
      teacherSectionRatio: school.record.teacherSectionRatio,
      classrooms: String(school.record.classrooms),
      classroomSize: school.record.classroomSize,
      laboratories: String(school.record.laboratories),
      laboratoryArea: school.record.laboratoryArea,
      campusArea: school.record.campusArea,
      girlsToilets: String(school.record.girlsToilets),
      boysToilets: String(school.record.boysToilets),
      classXPass: school.record.classXPass,
      classXRegistered: String(school.record.classXRegistered),
      classXSession: school.record.classXSession,
      principal: school.record.principal,
      principalQualification: school.record.principalQualification,
    },
  },

  nav: navigation.map((item) => ({
    label: item.label,
    href: item.href,
    children: item.children?.map((c) => ({ ...c })),
  })),

  footer: {
    blurb: school.tagline,
    columns: [
      {
        heading: "About",
        links: [
          { label: "About the school", href: "/about" },
          { label: "Director's message", href: "/about/directors-message" },
          { label: "Principal's message", href: "/about/principals-message" },
          { label: "Vision & mission", href: "/about/vision-mission" },
          { label: "Public disclosure", href: "/about/disclosure" },
        ],
      },
      {
        heading: "Academics",
        links: [
          { label: "Pre-Primary", href: "/academics/pre-primary" },
          { label: "Primary", href: "/academics/primary" },
          { label: "Secondary & CBSE", href: "/academics/secondary" },
          { label: "Facilities", href: "/academics#facilities" },
        ],
      },
      {
        heading: "Visit",
        links: [
          { label: "Admissions", href: "/admissions" },
          { label: "Gallery", href: "/gallery" },
          { label: "Blog", href: "/blog" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    legal: `CBSE Affiliation No. ${school.affiliationNo} · School Code ${school.schoolCode}`,
    showSocial: true,
  },

  seo: {
    titleTemplate: `%s — ${school.name}`,
    defaultTitle: `${school.name} — CBSE School in Hadapsar & Manjari, Pune`,
    description:
      "Venus World Schools is a CBSE school in Manjari, Pune, serving Hadapsar and East Pune. Pre-Primary to Standard X, 35 classrooms, five laboratories and a Vedpathshala on campus. Admissions open for 2026–27.",
    keywords: [
      "CBSE school Hadapsar",
      "CBSE school Manjari Pune",
      "best school in Hadapsar",
      "pre primary school Pune",
      "Venus World Schools",
      "school admission Pune 2026-27",
    ],
    ogImage: "/photos/campus-1000561603.jpg",
  },

  // The gate ships off, so the panel is reachable from every address until the
  // school decides otherwise. See PRODUCT.md and the Security screen.
  security: { enabled: false, allow: ["*"], note: "" },
};

/* ---------------------------------------------------------------- pages --- */

const homePage: SitePage = {
  id: "seed_home",
  slug: "",
  title: "Home",
  navLabel: "Home",
  showInNav: false,
  status: "published",
  isSystem: true,
  seo: { description: seedSettings.seo.description },
  header: { variant: "none" },
  sections: [
    section("hero", {
      titleLead: "A school that",
      titleHighlight: "shows its working.",
      mottoDeva: school.mottoDeva,
      motto: school.motto,
      intro: `Venus World Schools is a CBSE school of ${school.record.students.toLocaleString(
        "en-IN"
      )} children in Manjari, Pune, serving Hadapsar and the east of the city. Every figure on this site — the pass rate, the classroom count, the fees — is the school's own filed record, and you can check each one.`,
      ctas: [
        { label: `Admissions ${school.admissionWindow.session}`, href: "/admissions", style: "primary" },
        { label: "Ask a question", href: "#enquiry", style: "ghost" },
      ],
      slides: heroSlides.map((s) => ({ src: s.src, alt: s.alt, caption: s.caption ?? "" })),
      meta: [
        { label: "Board", value: school.board },
        { label: "Affiliation", value: school.affiliationNo },
        { label: "School code", value: school.schoolCode },
        { label: "Established", value: String(school.established) },
        { label: "Students", value: school.record.students.toLocaleString("en-IN") },
      ],
      layout: { ground: "wall", column: "full" },
    }),

    section("calloutKey", {
      heading: "The campus, keyed",
      intro:
        "Three thousand two hundred and forty-five square metres in Manjari. Six numbered markers, and what stands at each.",
      diagram: "campus",
      items: campusKey.map((k) => ({ label: k.label, detail: k.detail })),
      layout: { ground: "navy", column: "full" },
    }),

    section("statPlate", {
      heading: "The filed record",
      intro:
        "Under CBSE rules every affiliated school must publish its own figures. These are ours, exactly as filed. Nothing here is a marketing number, and the disclosure page carries the full return.",
      ctas: [{ label: "Read the full disclosure", href: "/about/disclosure", style: "ghost" }],
      plateTitle: "School record",
      plateNumber: `RETURN ${school.record.classXSession}`,
      stats: [
        { label: "Class X pass", value: school.record.classXPass, note: `${school.record.classXRegistered} registered` },
        { label: "Students", value: school.record.students.toLocaleString("en-IN"), note: "on roll" },
        { label: "Teachers", value: String(school.record.teachers), note: school.record.teacherBreakdown },
        { label: "Classrooms", value: String(school.record.classrooms), note: school.record.classroomSize },
        { label: "Laboratories", value: String(school.record.laboratories), note: school.record.laboratoryArea },
        { label: "Campus", value: "3,245", note: "square metres" },
      ],
      footnote: `Source: CBSE Mandatory Public Disclosure, Affiliation No. ${school.affiliationNo}. Principal: ${school.record.principal}, ${school.record.principalQualification}`,
      layout: { ground: "wall-dense", column: "full" },
    }),

    section("programmeStages", {
      heading: "Three stages, one line",
      intro:
        "From a playgroup that learns through play and talk, to the CBSE board examination — planned as a single sequence rather than three schools under one roof.",
      items: programs.map((p) => ({
        name: p.name,
        deva: p.deva ?? "",
        band: p.grades,
        plateNumber: p.plate,
        summary: p.summary,
        src: p.photo?.src ?? "",
        alt: p.photo?.alt ?? "",
        href: `/academics/${p.slug}`,
        callouts: p.callouts.map((c) => ({ label: c.label, detail: c.detail ?? "" })),
      })),
      layout: { ground: "navy", column: "full" },
    }),

    section("facilityKey", {
      heading: "What is on the ground",
      intro: "",
      plateTitle: "Facilities on the campus",
      plateNumber: "KEY A–J",
      items: facilities.map((f) => ({ name: f.name, deva: f.deva ?? "", detail: f.detail })),
      layout: { ground: "wall", column: "full", anchor: "facilities" },
    }),

    section("ctaBand", {
      heading: `Admissions for ${school.admissionWindow.session}`,
      intro: `Registration runs from ${school.admissionWindow.opens} to ${school.admissionWindow.closes}. Where applications exceed seats, places are filled by random selection — so an early form is not an advantage, and a complete one is.`,
      facts: [
        { label: "Online window", value: school.admissionWindow.onlineWindow },
        { label: "Office window", value: `${school.admissionWindow.officeWindow}, working days` },
        { label: "Selection", value: school.admissionWindow.selection },
        { label: "Class I, first year", value: `${rupee(fees.annualTotal)} in four instalments` },
      ],
      ctas: [
        { label: "Register online", href: school.registrationUrl, style: "primary" },
        { label: "Fees, dates & documents", href: "/admissions", style: "ghost" },
      ],
      layout: { ground: "navy-saffron", column: "left" },
    }),

    section("newsPanel", {
      plateTitle: "Latest updates",
      plateNumber: "NOTICE",
      // Drawn from the notice board rather than typed here, so the office
      // writes a notice once and the home page and /notices both carry it.
      source: "board",
      limit: 4,
      kinds: [],
      emptyText: "",
      items: [],
      ctas: [{ label: "All notices", href: "/notices", style: "ghost" }],
      layout: { ground: "navy-saffron", column: "right" },
    }),

    section("testimonials", {
      heading: "What parents say",
      intro:
        "Nothing is printed here yet. The school has not published parent testimonials, and this site will not write them on its behalf — these slots stay empty until real families supply the words.",
      plateTitle: "Reserved — three parent statements",
      plateNumber: "AWAITING COPY",
      items: [1, 2, 3].map(() => ({ quote: "", name: "", relation: "" })),
      layout: { ground: "wall", column: "full" },
    }),

    section("galleryGrid", {
      heading: "A year on campus",
      intro: "",
      mode: "all",
      groupByCategory: false,
      limit: 3,
      ctas: [{ label: "All albums", href: "/gallery", style: "ghost" }],
      layout: { ground: "wall-dense", column: "full" },
    }),

    section("blogList", {
      heading: "From the school",
      intro: "Notices, reports and photographs from the school year.",
      limit: 3,
      variant: "card",
      ctas: [{ label: "All posts", href: "/blog", style: "ghost" }],
      layout: { ground: "wall", column: "full" },
    }),

    section("enquiryPanel", {
      heading: "Ask the school directly",
      intro:
        "Send a question and the office will call you back. If you would rather speak to someone now, the numbers below reach the relevant desk directly.",
      plateTitle: "Quick enquiry",
      plateNumber: "FORM 01",
      showPhones: true,
      showHours: true,
      showMap: true,
      layout: { ground: "navy", column: "full", anchor: "enquiry" },
    }),
  ],
};

const aboutIndex: SitePage = {
  id: "seed_about",
  slug: "about",
  title: "About the school",
  navLabel: "About",
  showInNav: true,
  status: "published",
  isSystem: true,
  seo: {
    description:
      "Venus World Schools was founded in 2016 in Manjari, Pune. A CBSE school of 1,165 students with 35 classrooms, five laboratories and a Vedpathshala on campus.",
  },
  header: {
    variant: "sheet",
    title: "About the school",
    standfirst:
      "Founded in 2016 in Manjari, on the eastern edge of Pune, by a family whose institutions have served this belt for decades.",
    meta: [
      { label: "Established", value: String(school.established) },
      { label: "Board", value: school.board },
      { label: "Affiliation", value: school.affiliationNo },
    ],
  },
  sections: [
    section("prose", {
      heading: "",
      body: [
        `<p>Venus World Schools takes children from playgroup to the CBSE Class X board examination on a single campus in Manjari, close to Hadapsar. ${school.record.students.toLocaleString(
          "en-IN"
        )} children are on roll, taught by ${school.record.teachers} teachers across ${school.record.classrooms} classrooms.</p>`,
        "<p>What distinguishes the school from its neighbours is not a claim but a set of choices. Sanskrit and Vedic study run on campus at the Vedpathshala, started because the Director wanted Indian culture inculcated rather than referenced. Marathi is compulsory to Standard IX and no student is exempted from it. Grain collected by the children under Ek Mutthi Anaj goes to orphanages.</p>",
        "<p>Alongside that sits an ordinary, verifiable academic record: a 97.22% pass in the 2025–26 Class X examination, five laboratories, and a curriculum that gears towards CBSE from Standard IV so the secondary years are a continuation rather than a change.</p>",
      ].join(""),
      tone: "dark",
      layout: { ground: "wall-dense", column: "left" },
    }),

    section("cardGrid", {
      heading: "Read further",
      intro: "",
      source: "childPages",
      parent: "about",
      variant: "link",
      columns: "2",
      cards: [],
      layout: { ground: "wall-dense", column: "left" },
    }),

    section("factTable", {
      plateTitle: "The school at a glance",
      plateNumber: "PLATE 00",
      rows: [
        { label: "Founded", value: String(school.established) },
        { label: "Board", value: "Central Board of Secondary Education" },
        { label: "Affiliation no.", value: school.affiliationNo },
        { label: "School code", value: school.schoolCode },
        { label: "Classes", value: "Playgroup to Standard X" },
        { label: "Students", value: school.record.students.toLocaleString("en-IN") },
        { label: "Teachers", value: `${school.record.teachers} (${school.record.teacherBreakdown})` },
        { label: "Teacher–section ratio", value: school.record.teacherSectionRatio },
        { label: "Campus", value: school.record.campusArea },
        { label: "Principal", value: school.record.principal },
      ],
      layout: { ground: "wall-dense", column: "right" },
    }),

    section("imagePlate", {
      src: "/photos/campus-aerial.jpg",
      alt: "Elevation view of the four-storey Venus World Schools building, with the Indian flag flying at the central steps and the school name mounted on the end wall.",
      caption: "",
      ratio: "auto",
      layout: { ground: "wall-dense", column: "right" },
    }),
  ],
};

const messagePage = (slug: string): SitePage => {
  const p = aboutPages.find((a) => a.slug === slug)!;
  return {
    id: `seed_about_${slug}`,
    slug: `about/${slug}`,
    title: p.title,
    navLabel: p.title,
    showInNav: true,
    status: "published",
    isSystem: false,
    seo: { description: p.standfirst ?? `${p.title} — ${school.name}` },
    header: {
      variant: "sheet",
      title: p.title,
      deva: p.deva,
      standfirst: p.standfirst,
      meta: [{ label: "Sheet", value: p.plate }],
    },
    sections: [
      ...(p.body.length
        ? [
            section("richText", {
              plateTitle: p.title,
              plateNumber: p.plate,
              plated: true,
              body: p.body.map((para) => `<p>${para}</p>`).join(""),
              layout: { ground: "wall-dense", column: "full", width: "narrow" },
            }),
          ]
        : []),
      ...(p.signature
        ? [
            section("signature", {
              name: p.signature.name,
              role: p.signature.role,
              layout: { ground: "wall-dense", column: "full", width: "narrow" },
            }),
          ]
        : []),
      ...(slug === "vision-mission"
        ? [
            section("visionMission", {
              visionTitle: "Vision",
              missionTitle: "Mission",
              vision: visionMission.vision,
              mission: visionMission.mission,
              objectivesTitle: "What we want for every student",
              objectives: visionMission.studentObjectives.map((text) => ({ text })),
              layout: { ground: "wall-dense", column: "full" },
            }),
          ]
        : []),
      ...(slug === "management"
        ? [
            section("profileCards", {
              heading: "",
              cards: management.map((m, i) => ({
                name: m.name,
                role: m.role,
                plateNumber: i === 0 ? "I" : "II",
                positions: m.positions.map((text) => ({ text })),
                honours: m.honours.map((text) => ({ text })),
              })),
              layout: { ground: "wall-dense", column: "full" },
            }),
          ]
        : []),
    ],
  };
};

const disclosurePage: SitePage = {
  id: "seed_disclosure",
  slug: "about/disclosure",
  title: "Mandatory public disclosure",
  navLabel: "Public disclosure",
  showInNav: true,
  status: "published",
  isSystem: false,
  seo: {
    description:
      "CBSE Mandatory Public Disclosure for Venus World Schools — affiliation number 1131024, school code 22551, staffing, infrastructure and results.",
  },
  header: {
    variant: "sheet",
    title: "Mandatory public disclosure",
    standfirst:
      "Published under CBSE rules. These are the school's filed figures, reproduced without adjustment.",
    meta: [
      { label: "Affiliation", value: school.affiliationNo },
      { label: "School code", value: school.schoolCode },
    ],
  },
  sections: [
    section("factTable", {
      plateTitle: "General information",
      plateNumber: "A",
      rows: [
        { label: "Name of school", value: school.name },
        { label: "Affiliation number", value: school.affiliationNo },
        { label: "School code", value: school.schoolCode },
        { label: "Complete address", value: `${school.address.line1}, ${school.address.line2} ${school.address.postcode}` },
        { label: "Principal", value: `${school.record.principal}, ${school.record.principalQualification}` },
        { label: "School email", value: school.emails.principal },
        { label: "Contact", value: "020-29790064 · 70280 88103" },
        { label: "Year of establishment", value: String(school.established) },
      ],
      layout: { ground: "wall-dense", column: "left" },
    }),
    section("factTable", {
      plateTitle: "Staff",
      plateNumber: "B",
      rows: [
        { label: "Total teaching staff", value: String(school.record.teachers) },
        { label: "TGT", value: "15" },
        { label: "PRT", value: "17" },
        { label: "NTT", value: "6" },
        { label: "Teacher–section ratio", value: school.record.teacherSectionRatio },
      ],
      layout: { ground: "wall-dense", column: "right" },
    }),
    section("factTable", {
      plateTitle: "Infrastructure",
      plateNumber: "C",
      rows: [
        { label: "Total campus area", value: school.record.campusArea },
        { label: "Number of classrooms", value: `${school.record.classrooms} (${school.record.classroomSize})` },
        { label: "Number of laboratories", value: `${school.record.laboratories} (${school.record.laboratoryArea})` },
        { label: "Toilets — girls", value: String(school.record.girlsToilets) },
        { label: "Toilets — boys", value: String(school.record.boysToilets) },
        { label: "Internet facility", value: "Available" },
      ],
      layout: { ground: "wall-dense", column: "right" },
    }),
    section("dataTable", {
      plateTitle: "Class X board results",
      plateNumber: "D",
      columns: [{ label: "Session" }, { label: "Students registered" }, { label: "Pass percentage" }],
      rows: boardResults.map((r) => ({
        cells: [
          r.year,
          isPlaceholder(r.registered) ? "" : String(r.registered),
          isPlaceholder(r.passPercent) ? "" : `${r.passPercent}%`,
        ].join(" | "),
      })),
      note: `Only the ${school.record.classXSession} session has been published by the school. Earlier sessions will appear here once supplied. Empty cells print as “awaiting school figures”.`,
      layout: { ground: "wall-dense", column: "full" },
    }),
  ],
};

const academicsIndex: SitePage = {
  id: "seed_academics",
  slug: "academics",
  title: "Academics",
  navLabel: "Academics",
  showInNav: true,
  status: "published",
  isSystem: true,
  seo: {
    description:
      "Pre-Primary, Primary and Secondary at Venus World Schools — a CBSE curriculum from playgroup to the Standard X board examination, with five laboratories and a Vedpathshala on campus.",
  },
  header: {
    variant: "sheet",
    title: "Academics",
    standfirst:
      "Playgroup to Standard X on one campus, planned as a single sequence. The CBSE curriculum begins shaping the work from Standard IV, so the secondary years continue rather than restart.",
    meta: [
      { label: "Board", value: school.board },
      { label: "Affiliation", value: school.affiliationNo },
      { label: "Class X pass", value: school.record.classXPass },
    ],
  },
  sections: [
    section("calloutKey", {
      heading: "How the years follow each other",
      intro: "",
      diagram: "growth",
      items: [],
      layout: { ground: "navy", column: "full" },
    }),
    section("cardGrid", {
      heading: "",
      intro: "",
      source: "manual",
      variant: "card",
      columns: "3",
      cards: programs.map((p) => ({
        title: p.name,
        deva: p.deva ?? "",
        band: p.shortGrades,
        plateNumber: p.plate,
        text: p.summary,
        src: p.photo?.src ?? "",
        alt: p.photo?.alt ?? "",
        href: `/academics/${p.slug}`,
      })),
      layout: { ground: "wall-dense", column: "full" },
    }),
    section("facilityKey", {
      heading: "Facilities",
      intro: "Ten entries, as the school lists them.",
      plateTitle: "Facilities on the campus",
      plateNumber: "KEY A–J",
      items: facilities.map((f) => ({ name: f.name, deva: f.deva ?? "", detail: f.detail })),
      layout: { ground: "wall", column: "full", anchor: "facilities" },
    }),
  ],
};

const programmePage = (slug: string): SitePage => {
  const p = programs.find((x) => x.slug === slug)!;
  const meta = [
    { label: "Sheet", value: p.plate },
    { label: "Classes", value: p.grades },
    ...(p.ages ? [{ label: "Ages", value: p.ages }] : []),
    ...(p.hours ? [{ label: "Hours", value: p.hours }] : []),
  ];

  return {
    id: `seed_prog_${slug}`,
    slug: `academics/${slug}`,
    title: p.name,
    navLabel: p.name,
    showInNav: true,
    status: "published",
    isSystem: false,
    seo: { description: p.summary },
    header: { variant: "sheet", title: p.name, deva: p.deva, standfirst: p.summary, meta },
    sections: [
      section("richText", {
        plateTitle: p.name,
        plateNumber: p.plate,
        plated: true,
        body: p.body.map((para) => `<p>${para}</p>`).join(""),
        layout: { ground: "wall-dense", column: "left" },
      }),
      section("imagePlate", {
        src: p.photo?.src ?? "",
        alt: p.photo?.alt ?? "",
        caption: p.photo?.caption ?? "",
        ratio: "4/3",
        layout: { ground: "wall-dense", column: "right" },
      }),
      section("numberedList", {
        plateTitle: "At a glance",
        plateNumber: "KEY",
        marker: "numbers",
        columns: "1",
        items: p.callouts.map((c) => ({ title: c.label, detail: c.detail ?? "" })),
        note: "",
        layout: { ground: "wall-dense", column: "right" },
      }),
      section("ctaBand", {
        heading: `Applying for ${p.name}?`,
        intro: `Registration for ${school.admissionWindow.session} runs to ${school.admissionWindow.closes}.`,
        facts: [],
        ctas: [
          { label: "Admissions", href: "/admissions", style: "ink" },
          { label: "Ask a question", href: "/contact", style: "ghost" },
        ],
        layout: { ground: "wall-dense", column: "right" },
      }),
    ],
  };
};

const admissionsPage: SitePage = {
  id: "seed_admissions",
  slug: "admissions",
  title: `Admissions ${school.admissionWindow.session}`,
  navLabel: "Admissions",
  showInNav: true,
  status: "published",
  isSystem: true,
  seo: {
    description:
      "Admissions to Venus World Schools for 2026–27. Registration 1 January to 15 June 2026, age criteria, documents required and the published fee structure.",
  },
  header: {
    variant: "sheet",
    title: `Admissions ${school.admissionWindow.session}`,
    standfirst:
      "Registration runs from 1 January to 15 June 2026. Where applications exceed seats, places are filled by random selection — an early form is not an advantage, a complete one is.",
    meta: [
      { label: "Opens", value: school.admissionWindow.opens },
      { label: "Closes", value: school.admissionWindow.closes },
      { label: "Selection", value: school.admissionWindow.selection },
    ],
  },
  sections: [
    section("steps", {
      heading: "How admission works",
      intro: "",
      steps: admissionSteps.map((s) => ({ title: s.title, detail: s.detail })),
      ctas: [
        { label: "Open the registration form", href: school.registrationUrl, style: "primary" },
        { label: "Ask before applying", href: "#enquiry", style: "ghost" },
      ],
      layout: { ground: "navy", column: "full" },
    }),
    section("dataTable", {
      plateTitle: "Age criteria",
      plateNumber: "TABLE A",
      columns: ageCriteria.columns.map((label) => ({ label })),
      rows: ageCriteria.rows.map((r) => ({ cells: [r.standard, r.earliest, r.latest].join(" | ") })),
      note: ageCriteria.note,
      layout: { ground: "wall-dense", column: "left" },
    }),
    section("numberedList", {
      plateTitle: "Documents at confirmation",
      plateNumber: "LIST B",
      marker: "numbers",
      columns: "1",
      items: admissionDocuments.map((d) => ({ title: d, detail: "" })),
      note: "",
      layout: { ground: "wall-dense", column: "right" },
    }),
    section("feesPanel", {
      plateTitle: "Fees",
      plateNumber: "TABLE C",
      oneTimeHeading: "One-time charges",
      oneTime: fees.oneTime.map((f) => ({ label: f.label, amount: rupee(f.amount) })),
      instalmentHeading: "Annual fee, in four instalments",
      instalments: fees.instalments.map((f) => ({ label: f.label, amount: rupee(f.amount) })),
      totalLabel: "Annual total",
      total: rupee(fees.annualTotal),
      note: fees.note,
      conditions: fees.conditions.map((text) => ({ text })),
      layout: { ground: "wall-dense", column: "full" },
    }),
    section("enquiryPanel", {
      heading: "Not sure where to start?",
      intro: `Send the school a question and the office will call you back during working hours. For transport, uniform or book queries, ring ${school.phones[0].number}.`,
      plateTitle: "Admission enquiry",
      plateNumber: "FORM 01",
      showPhones: true,
      showHours: false,
      showMap: false,
      layout: { ground: "navy-saffron", column: "full", anchor: "enquiry" },
    }),
  ],
};

const galleryPage: SitePage = {
  id: "seed_gallery",
  slug: "gallery",
  title: "Gallery",
  navLabel: "Gallery",
  showInNav: true,
  status: "published",
  isSystem: true,
  seo: {
    description:
      "Photographs from Venus World Schools, Pune — assembly, laboratories, Makar Sankranti, Christmas, sports and physical education.",
  },
  header: {
    variant: "sheet",
    title: "Gallery",
    standfirst: "Albums from the school year, arranged by category.",
  },
  sections: [
    section("galleryGrid", {
      heading: "",
      intro: "",
      mode: "all",
      groupByCategory: true,
      limit: 0,
      ctas: [],
      layout: { ground: "wall-dense", column: "full" },
    }),
    section("videoPanel", {
      plateTitle: "Video gallery",
      plateNumber: "REEL",
      intro:
        "Individual videos have not been catalogued on this site yet. The school's films are published on its YouTube channel, and each one added in the panel appears here automatically.",
      videos: videos.filter((v) => v.youtubeId).map((v) => ({ title: v.title, youtubeId: v.youtubeId })),
      channelUrl: school.social.youtube,
      channelLabel: "Open the school channel",
      layout: { ground: "wall-dense", column: "full" },
    }),
  ],
};

const blogPage: SitePage = {
  id: "seed_blog",
  slug: "blog",
  title: "Blog",
  navLabel: "Blog",
  showInNav: true,
  status: "published",
  isSystem: true,
  seo: { description: "Notices, reports and photographs from Venus World Schools, Manjari, Pune." },
  header: {
    variant: "sheet",
    title: "Blog",
    standfirst: "Notices, reports and photographs from the school year.",
  },
  sections: [
    section("blogList", {
      heading: "",
      intro: "",
      limit: 0,
      variant: "card",
      ctas: [],
      layout: { ground: "wall-dense", column: "full" },
    }),
  ],
};

/**
 * The notice board.
 *
 * A returning parent's page rather than a prospective one's — PRODUCT.md has
 * current parents coming back for the planner, the results and the notices.
 * The whole board, unlimited and unfiltered; the home page shows the top four.
 */
const noticesPage: SitePage = {
  id: "seed_notices",
  slug: "notices",
  title: "Notices",
  navLabel: "Notices",
  showInNav: true,
  status: "published",
  isSystem: true,
  seo: {
    description:
      "Notices, circulars and announcements from Venus World Schools, Manjari, Pune — admissions, results, events and achievements.",
  },
  header: {
    variant: "sheet",
    title: "Notices",
    standfirst: "Announcements from the school office, newest first.",
  },
  sections: [
    section("newsPanel", {
      plateTitle: "The notice board",
      plateNumber: "NOTICE",
      source: "board",
      limit: 0,
      kinds: [],
      emptyText:
        "There are no current notices. Anything the office publishes appears here, and on the home page.",
      items: [],
      ctas: [],
      layout: { ground: "wall-dense", column: "full" },
    }),
  ],
};

const contactPage: SitePage = {
  id: "seed_contact",
  slug: "contact",
  title: "Contact",
  navLabel: "Contact",
  showInNav: true,
  status: "published",
  isSystem: true,
  seo: {
    description:
      "Contact Venus World Schools, Manjari (BK), Pune 412307. Telephone 020-29790064 and 70280 88103, helpdesk@venusworldschools.org. Office hours Monday to Saturday, 9:00 am to 2:00 pm.",
  },
  header: {
    variant: "sheet",
    title: "Contact",
    standfirst:
      "The school office answers Monday to Saturday, 9:00 am to 2:00 pm. Each number below reaches a different desk, so calling the right one saves a transfer.",
  },
  sections: [
    section("contactPanel", {
      plateTitle: "Where we are",
      source: "school",
      showEmails: true,
      hoursNote: `Admission forms are accepted at the office between ${school.admissionWindow.officeWindow}.`,
      hours: [],
      layout: { ground: "wall-dense", column: "left" },
    }),
    section("phonePanel", {
      plateTitle: "Telephone",
      plateNumber: "EXCHANGE",
      source: "school",
      phones: [],
      layout: { ground: "wall-dense", column: "left" },
    }),
    section("mapPanel", { query: "", addressLine: "", layout: { ground: "wall-dense", column: "left" } }),
    section("enquiryPanel", {
      heading: "",
      intro: "",
      plateTitle: "Send a message",
      plateNumber: "FORM 01",
      showPhones: false,
      showHours: false,
      showMap: false,
      layout: { ground: "wall-dense", column: "right" },
    }),
  ],
};

export const seedPages: SitePage[] = [
  homePage,
  aboutIndex,
  messagePage("directors-message"),
  messagePage("principals-message"),
  messagePage("vision-mission"),
  messagePage("management"),
  disclosurePage,
  academicsIndex,
  programmePage("pre-primary"),
  programmePage("primary"),
  programmePage("secondary"),
  admissionsPage,
  galleryPage,
  noticesPage,
  blogPage,
  contactPage,
];

/* ---------------------------------------------------------------- media --- */

/**
 * Every photograph already in `/public/photos`, with the alt text that was
 * written for it. Keys stay root-relative, so these are served by the website
 * and only new uploads go to R2.
 */
const knownAlt = new Map<string, { alt: string; caption: string }>();
for (const album of albums) {
  for (const p of album.photos) knownAlt.set(p.src, { alt: p.alt, caption: p.caption ?? "" });
}
for (const p of programs) {
  if (p.photo) knownAlt.set(p.photo.src, { alt: p.photo.alt, caption: p.photo.caption ?? "" });
}
for (const s of heroSlides) {
  if (!knownAlt.has(s.src)) knownAlt.set(s.src, { alt: s.alt, caption: s.caption ?? "" });
}
knownAlt.set("/photos/campus-aerial.jpg", {
  alt: "Elevation view of the four-storey Venus World Schools building, with the Indian flag flying at the central steps and the school name mounted on the end wall.",
  caption: "The school building",
});

export const seedMedia = [...knownAlt.entries()].map(([key, v]) => ({
  key,
  alt: v.alt,
  caption: v.caption,
  filename: key.split("/").pop() ?? key,
  mime: key.endsWith(".png") ? "image/png" : "image/jpeg",
  kind: "image" as const,
  size: 0,
  width: null,
  height: null,
}));

export const seedAlbums = albums.map((a) => ({
  slug: a.slug,
  title: a.title,
  category: a.category,
  description: "",
  date: a.date ?? "",
  coverKey: a.cover,
  photoKeys: a.photos.map((p) => p.src),
}));

/* -------------------------------------------------------------- notices --- */

/**
 * The notice board as it stands in this repo.
 *
 * None of these expire: they are the school's standing record, not dated
 * circulars, and inventing a takedown date for them would be inventing content.
 * Attachments are left null — no circular has been supplied.
 */
export const seedNotices = news.map((n) => ({
  id: `seed_notice_${n.slug}`,
  title: n.title,
  kind: n.kind as string,
  body: n.body,
  date: n.date,
  href: n.href ?? "",
  file: null,
  pinned: false,
  expiresOn: "",
}));

/* --------------------------------------------------------------- export --- */

/** What the site renders when the API cannot be reached. */
export const SEED_SITE: SiteContent = {
  version: 0,
  builtAt: 0,
  settings: seedSettings,
  pages: seedPages,
  albums: albums.map((a) => ({
    id: `seed_${a.slug}`,
    slug: a.slug,
    title: a.title,
    category: a.category,
    description: "",
    date: a.date ?? "",
    cover: a.cover,
    coverAlt: a.photos[0]?.alt ?? a.title,
    photos: a.photos.map((p) => ({ src: p.src, alt: p.alt, caption: p.caption })),
  })),
  posts: [],
  notices: seedNotices,
  fallback: true,
};

/** What `scripts/seed-cms.mjs` posts to the API. */
export const SEED_PAYLOAD = {
  settings: seedSettings as unknown as Record<string, unknown>,
  media: seedMedia,
  albums: seedAlbums,
  pages: seedPages.map((p) => ({
    slug: p.slug,
    title: p.title,
    navLabel: p.navLabel,
    isSystem: p.isSystem ?? false,
    showInNav: p.showInNav,
    seo: p.seo as Record<string, unknown>,
    header: p.header as Record<string, unknown>,
    sections: p.sections.map((s) => ({
      type: s.type,
      label: s.label,
      data: s.data as Record<string, unknown>,
      enabled: s.enabled,
    })),
  })),
  posts: [],
  notices: seedNotices.map((n) => ({
    title: n.title,
    kind: n.kind,
    body: n.body,
    date: n.date,
    href: n.href,
    pinned: n.pinned,
    expiresOn: n.expiresOn,
    status: "published" as const,
  })),
};
