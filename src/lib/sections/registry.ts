/**
 * The section catalogue.
 *
 * One entry per block the website can render. The panel builds its editing
 * form from `fields`, and `defaults` is what a freshly-added block contains —
 * so a new section type is added here once and immediately becomes both
 * renderable and editable. No JSON is ever hand-written by the school.
 *
 * This module is imported by client components, so it stays pure data.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "boolean"
  | "select"
  | "media"
  | "list"
  | "group";

export interface Field {
  name: string;
  label: string;
  type: FieldType;
  help?: string;
  placeholder?: string;
  /** `select` */
  options?: { value: string; label: string }[];
  /** `list` and `group` */
  fields?: Field[];
  /** `list` — which child field titles a collapsed row. */
  itemLabel?: string;
  addLabel?: string;
  max?: number;
  /** `media` */
  kind?: "image" | "video";
  /** `textarea` */
  rows?: number;
  /** Hides the field unless a sibling field has one of these values. */
  showWhen?: { field: string; equals: string[] };
  width?: "full" | "half";
}

export interface SectionDef {
  type: string;
  name: string;
  description: string;
  group: "Openers" | "Text" | "Data" | "Media" | "Contact" | "Lists";
  fields: Field[];
  defaults: Record<string, unknown>;
}

/* ------------------------------------------------------------- helpers --- */

const text = (name: string, label: string, extra: Partial<Field> = {}): Field => ({
  name,
  label,
  type: "text",
  ...extra,
});
const area = (name: string, label: string, extra: Partial<Field> = {}): Field => ({
  name,
  label,
  type: "textarea",
  rows: 3,
  ...extra,
});
const rich = (name: string, label: string, extra: Partial<Field> = {}): Field => ({
  name,
  label,
  type: "richtext",
  ...extra,
});
const bool = (name: string, label: string, extra: Partial<Field> = {}): Field => ({
  name,
  label,
  type: "boolean",
  ...extra,
});
const list = (name: string, label: string, fields: Field[], extra: Partial<Field> = {}): Field => ({
  name,
  label,
  type: "list",
  fields,
  itemLabel: fields[0]?.name,
  ...extra,
});
const select = (name: string, label: string, options: string[][], extra: Partial<Field> = {}): Field => ({
  name,
  label,
  type: "select",
  options: options.map(([value, l]) => ({ value, label: l })),
  ...extra,
});

/** The link editor used everywhere a button or a menu entry appears. */
export const LINK_FIELDS: Field[] = [
  text("label", "Button text", { width: "half" }),
  text("href", "Links to", { width: "half", placeholder: "/admissions or https://…" }),
  select("style", "Appearance", [
    ["primary", "Saffron button"],
    ["ghost", "Outlined button"],
    ["ink", "Dark button"],
    ["link", "Plain link"],
  ], { width: "half" }),
];

const CTA_LIST = list("ctas", "Buttons", LINK_FIELDS, { addLabel: "Add a button", max: 4, itemLabel: "label" });

const PHOTO_FIELDS: Field[] = [
  { name: "mediaId", label: "Photograph", type: "media", kind: "image" },
  text("alt", "Alt text", { help: "Describe what is actually in the frame, for readers using a screen reader." }),
  text("caption", "Caption"),
];

/* ------------------------------------------------------------- sections --- */

export const SECTIONS: SectionDef[] = [
  {
    type: "hero",
    name: "Hero",
    description: "The opening screen — headline, motto, buttons and the banner slider.",
    group: "Openers",
    fields: [
      text("titleLead", "Headline, first part", { placeholder: "A school that" }),
      text("titleHighlight", "Headline, saffron part", { placeholder: "shows its working." }),
      text("mottoDeva", "Motto in Devanagari"),
      text("motto", "Motto in English"),
      area("intro", "Opening paragraph", { rows: 4 }),
      CTA_LIST,
      list("slides", "Banner slides", PHOTO_FIELDS, { addLabel: "Add a slide", itemLabel: "caption" }),
      list("meta", "Registration block", [text("label", "Label", { width: "half" }), text("value", "Value", { width: "half" })], {
        addLabel: "Add an entry",
        itemLabel: "label",
        help: "The small print printed under the rule — board, affiliation, school code.",
      }),
    ],
    defaults: {
      titleLead: "A school that",
      titleHighlight: "shows its working.",
      motto: "",
      mottoDeva: "",
      intro: "",
      ctas: [{ label: "Admissions", href: "/admissions", style: "primary" }],
      slides: [],
      meta: [],
    },
  },

  {
    type: "prose",
    name: "Text block",
    description: "A heading, an opening line and formatted body text.",
    group: "Text",
    fields: [
      text("heading", "Heading"),
      text("deva", "Devanagari line"),
      area("standfirst", "Standfirst", { rows: 3, help: "The larger line under the heading." }),
      rich("body", "Body"),
      CTA_LIST,
      select("tone", "Set on", [
        ["dark", "Blue ground (light text)"],
        ["plate", "A paper plate (dark text)"],
      ]),
    ],
    defaults: { heading: "", standfirst: "", body: "", tone: "dark", ctas: [] },
  },

  {
    type: "richText",
    name: "Free text plate",
    description: "Anything the other blocks do not cover — full editor, on a paper plate.",
    group: "Text",
    fields: [
      text("plateTitle", "Plate heading"),
      text("plateNumber", "Plate number", { placeholder: "PLATE A" }),
      bool("plated", "Print on a paper plate"),
      rich("body", "Content"),
    ],
    defaults: { plateTitle: "", plateNumber: "", plated: true, body: "" },
  },

  {
    type: "statPlate",
    name: "Figures plate",
    description: "A grid of headline numbers with a source note — the filed record.",
    group: "Data",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      CTA_LIST,
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      list("stats", "Figures", [
        text("label", "Label", { width: "half" }),
        text("value", "Figure", { width: "half" }),
        text("note", "Note under the figure"),
      ], { addLabel: "Add a figure", itemLabel: "label" }),
      area("footnote", "Source note"),
    ],
    defaults: { heading: "", intro: "", plateTitle: "", plateNumber: "", stats: [], footnote: "", ctas: [] },
  },

  {
    type: "factTable",
    name: "Facts plate",
    description: "Label and value rows — the school at a glance, or a disclosure table.",
    group: "Data",
    fields: [
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      list("rows", "Rows", [text("label", "Label", { width: "half" }), text("value", "Value", { width: "half" })], {
        addLabel: "Add a row",
        itemLabel: "label",
      }),
    ],
    defaults: { plateTitle: "", plateNumber: "", rows: [] },
  },

  {
    type: "dataTable",
    name: "Table",
    description: "A ruled table with column headings — age criteria, results by year.",
    group: "Data",
    fields: [
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      list("columns", "Column headings", [text("label", "Heading")], { addLabel: "Add a column", itemLabel: "label" }),
      list("rows", "Rows", [text("cells", "Cells", { help: "Separate each cell with a vertical bar |" })], {
        addLabel: "Add a row",
        itemLabel: "cells",
      }),
      area("note", "Note under the table"),
    ],
    defaults: { plateTitle: "", plateNumber: "", columns: [], rows: [], note: "" },
  },

  {
    type: "numberedList",
    name: "Numbered list plate",
    description: "A plate of numbered or lettered entries — documents, objectives.",
    group: "Lists",
    fields: [
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      select("marker", "Markers", [["numbers", "Numbers"], ["letters", "Letters"], ["none", "No markers"]], { width: "half" }),
      select("columns", "Columns", [["1", "One"], ["2", "Two"]], { width: "half" }),
      list("items", "Entries", [text("title", "Entry"), area("detail", "Detail", { rows: 2 })], {
        addLabel: "Add an entry",
        itemLabel: "title",
      }),
      area("note", "Note under the list"),
    ],
    defaults: { plateTitle: "", plateNumber: "", marker: "numbers", columns: "1", items: [], note: "" },
  },

  {
    type: "steps",
    name: "Numbered steps",
    description: "A row of big numbered steps — how admission works.",
    group: "Lists",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      list("steps", "Steps", [text("title", "Step"), area("detail", "Detail", { rows: 2 })], {
        addLabel: "Add a step",
        itemLabel: "title",
        max: 8,
      }),
      CTA_LIST,
    ],
    defaults: { heading: "", intro: "", steps: [], ctas: [] },
  },

  {
    type: "cardGrid",
    name: "Card grid",
    description: "Cards with an optional photograph — programmes, links to other pages.",
    group: "Lists",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      select("source", "Cards come from", [
        ["manual", "Cards entered below"],
        ["childPages", "Pages filed under a section"],
      ]),
      text("parent", "Parent page", {
        placeholder: "academics",
        help: "The slug whose child pages are listed, without a leading slash.",
        showWhen: { field: "source", equals: ["childPages"] },
      }),
      select("variant", "Style", [["card", "Photograph cards"], ["link", "Compact link rows"]], { width: "half" }),
      select("columns", "Columns", [["2", "Two"], ["3", "Three"], ["4", "Four"]], { width: "half" }),
      list("cards", "Cards", [
        text("title", "Title"),
        text("deva", "Devanagari line"),
        text("band", "Band text", { help: "The strip across the card, e.g. the class range." }),
        text("plateNumber", "Plate number"),
        area("text", "Description", { rows: 2 }),
        { name: "mediaId", label: "Photograph", type: "media", kind: "image" },
        text("alt", "Alt text"),
        text("href", "Links to"),
      ], { addLabel: "Add a card", itemLabel: "title", showWhen: { field: "source", equals: ["manual"] } }),
    ],
    defaults: { heading: "", intro: "", source: "manual", variant: "card", columns: "3", cards: [], parent: "" },
  },

  {
    type: "calloutKey",
    name: "Diagram with a key",
    description: "A drawn diagram beside a numbered key — the campus plan, the growth stages.",
    group: "Media",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      select("diagram", "Diagram", [
        ["campus", "Campus cutaway"],
        ["growth", "Growth stages"],
        ["none", "No diagram — key only"],
      ]),
      list("items", "Key entries", [text("label", "Label"), area("detail", "Detail", { rows: 2 })], {
        addLabel: "Add an entry",
        itemLabel: "label",
        max: 12,
        showWhen: { field: "diagram", equals: ["campus", "none"] },
      }),
    ],
    defaults: { heading: "", intro: "", diagram: "campus", items: [] },
  },

  {
    type: "facilityKey",
    name: "Facilities key",
    description: "The lettered legend of what is on the campus.",
    group: "Lists",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      list("items", "Facilities", [
        text("name", "Name"),
        text("deva", "Devanagari"),
        area("detail", "Detail", { rows: 2 }),
      ], { addLabel: "Add a facility", itemLabel: "name" }),
    ],
    defaults: { heading: "", intro: "", plateTitle: "Facilities on the campus", plateNumber: "KEY", items: [] },
  },

  {
    type: "programmeStages",
    name: "Programme plates",
    description: "The large alternating plates for each stage of the school.",
    group: "Lists",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      list("items", "Programmes", [
        text("name", "Name"),
        text("deva", "Devanagari"),
        text("band", "Band text", { help: "The class range printed across the title band." }),
        text("plateNumber", "Plate number"),
        area("summary", "Summary", { rows: 3 }),
        { name: "mediaId", label: "Photograph", type: "media", kind: "image" },
        text("alt", "Alt text"),
        text("href", "Links to"),
        list("callouts", "Key points", [text("label", "Point"), text("detail", "Detail")], {
          addLabel: "Add a point",
          itemLabel: "label",
          max: 6,
        }),
      ], { addLabel: "Add a programme", itemLabel: "name" }),
    ],
    defaults: { heading: "", intro: "", items: [] },
  },

  {
    type: "galleryGrid",
    name: "Album grid",
    description: "Gallery albums, all of them or a chosen few.",
    group: "Media",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      select("mode", "Show", [
        ["all", "Every album"],
        ["selected", "Only the albums listed below"],
        ["category", "One category"],
      ]),
      text("category", "Category", { showWhen: { field: "mode", equals: ["category"] } }),
      list("albumSlugs", "Albums", [text("slug", "Album address")], {
        addLabel: "Add an album",
        itemLabel: "slug",
        showWhen: { field: "mode", equals: ["selected"] },
      }),
      bool("groupByCategory", "Group under category headings"),
      { name: "limit", label: "Maximum albums shown", type: "number", help: "Leave at 0 for no limit." },
      list("ctas", "Buttons", LINK_FIELDS, { addLabel: "Add a button", max: 2, itemLabel: "label" }),
    ],
    defaults: { heading: "", intro: "", mode: "all", groupByCategory: true, limit: 0, albumSlugs: [], ctas: [] },
  },

  {
    type: "photoStrip",
    name: "Photograph row",
    description: "A row of photographs straight from the library.",
    group: "Media",
    fields: [
      text("heading", "Heading"),
      select("columns", "Columns", [["2", "Two"], ["3", "Three"], ["4", "Four"]], { width: "half" }),
      bool("lightbox", "Open in a lightbox when clicked"),
      list("photos", "Photographs", PHOTO_FIELDS, { addLabel: "Add a photograph", itemLabel: "caption" }),
    ],
    defaults: { heading: "", columns: "3", lightbox: true, photos: [] },
  },

  {
    type: "imagePlate",
    name: "Single photograph",
    description: "One photograph, keylined as a plate.",
    group: "Media",
    fields: [
      { name: "mediaId", label: "Photograph", type: "media", kind: "image" },
      text("alt", "Alt text"),
      text("caption", "Caption"),
      select("ratio", "Shape", [["auto", "As uploaded"], ["4/3", "Landscape 4:3"], ["16/9", "Wide 16:9"], ["1/1", "Square"]]),
    ],
    defaults: { mediaId: "", alt: "", caption: "", ratio: "auto" },
  },

  {
    type: "videoPanel",
    name: "Video panel",
    description: "YouTube films, or a link to the school channel.",
    group: "Media",
    fields: [
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      area("intro", "Introduction"),
      list("videos", "Films", [text("title", "Title"), text("youtubeId", "YouTube id", { help: "The part after watch?v=" })], {
        addLabel: "Add a film",
        itemLabel: "title",
      }),
      text("channelUrl", "Channel address"),
      text("channelLabel", "Channel button text"),
    ],
    defaults: { plateTitle: "Video gallery", plateNumber: "REEL", intro: "", videos: [], channelUrl: "", channelLabel: "Open the school channel" },
  },

  {
    type: "feesPanel",
    name: "Fees",
    description: "One-time charges, instalments and the annual total.",
    group: "Data",
    fields: [
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      text("oneTimeHeading", "Left heading"),
      list("oneTime", "One-time charges", [text("label", "Charge", { width: "half" }), text("amount", "Amount", { width: "half" })], {
        addLabel: "Add a charge",
        itemLabel: "label",
      }),
      text("instalmentHeading", "Right heading"),
      list("instalments", "Instalments", [text("label", "Instalment", { width: "half" }), text("amount", "Amount", { width: "half" })], {
        addLabel: "Add an instalment",
        itemLabel: "label",
      }),
      text("totalLabel", "Total label", { width: "half" }),
      text("total", "Total", { width: "half" }),
      area("note", "Note under the table"),
      list("conditions", "Conditions", [text("text", "Condition")], { addLabel: "Add a condition", itemLabel: "text" }),
    ],
    defaults: {
      plateTitle: "Fees",
      plateNumber: "TABLE C",
      oneTimeHeading: "One-time charges",
      instalmentHeading: "Annual fee, in four instalments",
      totalLabel: "Annual total",
      oneTime: [], instalments: [], total: "", note: "", conditions: [],
    },
  },

  {
    type: "contactPanel",
    name: "Address and hours",
    description: "Where the school is, when the office answers, and the email addresses.",
    group: "Contact",
    fields: [
      text("plateTitle", "Plate heading"),
      select("source", "Details come from", [
        ["school", "The school settings"],
        ["custom", "The fields below"],
      ]),
      area("address", "Address", { rows: 3, showWhen: { field: "source", equals: ["custom"] } }),
      text("localityNote", "Locality note", { showWhen: { field: "source", equals: ["custom"] } }),
      list("hours", "Office hours", [text("days", "Days", { width: "half" }), text("time", "Time", { width: "half" })], {
        addLabel: "Add a row",
        itemLabel: "days",
        showWhen: { field: "source", equals: ["custom"] },
      }),
      area("hoursNote", "Note under the hours"),
      bool("showEmails", "Show email addresses"),
    ],
    defaults: { plateTitle: "Where we are", source: "school", showEmails: true, hoursNote: "", hours: [] },
  },

  {
    type: "phonePanel",
    name: "Telephone list",
    description: "Each number, with the desk it reaches.",
    group: "Contact",
    fields: [
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      select("source", "Numbers come from", [
        ["school", "The school settings"],
        ["custom", "The list below"],
      ]),
      list("phones", "Numbers", [
        text("label", "Desk"),
        text("number", "Number", { width: "half" }),
        text("href", "Dial link", { width: "half", placeholder: "tel:+9120…" }),
      ], { addLabel: "Add a number", itemLabel: "label", showWhen: { field: "source", equals: ["custom"] } }),
    ],
    defaults: { plateTitle: "Telephone", plateNumber: "EXCHANGE", source: "school", phones: [] },
  },

  {
    type: "mapPanel",
    name: "Map",
    description: "The campus on Google Maps, loaded only when a visitor asks for it.",
    group: "Contact",
    fields: [
      text("query", "Map search", { help: "Leave empty to use the address in the school settings." }),
      text("addressLine", "Caption under the map"),
    ],
    defaults: { query: "", addressLine: "" },
  },

  {
    type: "enquiryPanel",
    name: "Enquiry form",
    description: "The enquiry slip, with the school's numbers beside it.",
    group: "Contact",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      text("plateTitle", "Form heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      bool("showPhones", "Show the telephone numbers"),
      bool("showHours", "Show the office hours"),
      bool("showMap", "Show the map"),
    ],
    defaults: {
      heading: "Ask the school directly",
      intro: "",
      plateTitle: "Quick enquiry",
      plateNumber: "FORM 01",
      showPhones: true,
      showHours: true,
      showMap: false,
    },
  },

  {
    type: "testimonials",
    name: "Parent voices",
    description: "Parent statements. An empty quote prints as a reserved slot, never as invented copy.",
    group: "Text",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      list("items", "Statements", [
        area("quote", "Quote", { rows: 3, help: "Leave empty to print a reserved slot awaiting the school's copy." }),
        text("name", "Name", { width: "half" }),
        text("relation", "Class and year", { width: "half" }),
      ], { addLabel: "Add a slot", itemLabel: "name" }),
    ],
    defaults: { heading: "What parents say", intro: "", plateTitle: "", plateNumber: "", items: [] },
  },

  {
    type: "newsPanel",
    name: "Notices",
    description: "The notice board — pinned notices first, then newest. Written under Notices, not here.",
    group: "Lists",
    fields: [
      text("plateTitle", "Plate heading", { width: "half" }),
      text("plateNumber", "Plate number", { width: "half" }),
      select("source", "Notices come from", [
        ["board", "The notice board"],
        ["manual", "The list typed below"],
      ], {
        help: "Leave this on the notice board and a notice written once appears on every page that shows one.",
      }),
      {
        name: "limit",
        label: "How many to show",
        type: "number",
        help: "Leave at 0 to show every current notice.",
        showWhen: { field: "source", equals: ["board"] },
      },
      list("kinds", "Only these kinds", [text("kind", "Kind")], {
        addLabel: "Add a kind",
        itemLabel: "kind",
        help: "Leave empty for every kind. Useful for a page that should show only achievements.",
        showWhen: { field: "source", equals: ["board"] },
      }),
      area("emptyText", "When there is nothing to show", {
        rows: 2,
        help: "Printed in place of the list once every notice has lapsed. Leave empty to hide the block instead.",
        showWhen: { field: "source", equals: ["board"] },
      }),
      list("ctas", "Buttons", LINK_FIELDS, { addLabel: "Add a button", max: 2, itemLabel: "label" }),
      list("items", "Notices", [
        text("title", "Title"),
        text("kind", "Kind", { width: "half", placeholder: "Notice / Achievement / Admission / Event" }),
        text("date", "Date", { width: "half", placeholder: "2026-01-01" }),
        area("body", "Text", { rows: 2 }),
        text("href", "Links to"),
      ], { addLabel: "Add a notice", itemLabel: "title", showWhen: { field: "source", equals: ["manual"] } }),
    ],
    defaults: {
      plateTitle: "Latest updates",
      plateNumber: "NOTICE",
      source: "board",
      limit: 4,
      kinds: [],
      emptyText: "",
      items: [],
      ctas: [],
    },
  },

  {
    type: "blogList",
    name: "Blog posts",
    description: "The most recent posts from the blog.",
    group: "Lists",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      { name: "limit", label: "How many posts", type: "number" },
      text("tag", "Only posts tagged", { help: "Leave empty for every post." }),
      select("variant", "Style", [["card", "Photograph cards"], ["list", "Compact list"]], { width: "half" }),
      list("ctas", "Buttons", LINK_FIELDS, { addLabel: "Add a button", max: 2, itemLabel: "label" }),
    ],
    defaults: { heading: "From the school", intro: "", limit: 6, tag: "", variant: "card", ctas: [] },
  },

  {
    type: "ctaBand",
    name: "Call to action",
    description: "A band with a heading and buttons.",
    group: "Openers",
    fields: [
      text("heading", "Heading"),
      area("intro", "Introduction"),
      list("facts", "Facts beside it", [text("label", "Label", { width: "half" }), text("value", "Value", { width: "half" })], {
        addLabel: "Add a fact",
        itemLabel: "label",
      }),
      CTA_LIST,
    ],
    defaults: { heading: "", intro: "", facts: [], ctas: [] },
  },

  {
    type: "visionMission",
    name: "Vision and mission",
    description: "The two statements side by side, with the student objectives beneath.",
    group: "Text",
    fields: [
      text("visionTitle", "Left heading", { width: "half" }),
      text("missionTitle", "Right heading", { width: "half" }),
      area("vision", "Vision", { rows: 5 }),
      area("mission", "Mission", { rows: 5 }),
      text("objectivesTitle", "Objectives heading"),
      list("objectives", "Objectives", [text("text", "Objective")], { addLabel: "Add an objective", itemLabel: "text" }),
    ],
    defaults: {
      visionTitle: "Vision",
      missionTitle: "Mission",
      objectivesTitle: "What we want for every student",
      vision: "", mission: "", objectives: [],
    },
  },

  {
    type: "profileCards",
    name: "People",
    description: "Named people with their positions and honours.",
    group: "Lists",
    fields: [
      text("heading", "Heading"),
      list("cards", "People", [
        text("name", "Name"),
        text("role", "Role", { width: "half" }),
        text("plateNumber", "Plate number", { width: "half" }),
        { name: "mediaId", label: "Photograph", type: "media" as FieldType, kind: "image" as const },
        list("positions", "Positions", [text("text", "Position")], { addLabel: "Add a position", itemLabel: "text" }),
        list("honours", "Honours", [text("text", "Honour")], { addLabel: "Add an honour", itemLabel: "text" }),
      ], { addLabel: "Add a person", itemLabel: "name" }),
    ],
    defaults: { heading: "", cards: [] },
  },

  {
    type: "signature",
    name: "Signature",
    description: "The name and role printed at the end of a message.",
    group: "Text",
    fields: [text("name", "Name"), text("role", "Role")],
    defaults: { name: "", role: "" },
  },

  {
    type: "sectionRule",
    name: "Divider",
    description: "A printed double rule between blocks.",
    group: "Text",
    fields: [{ name: "spacing", label: "Spacing", type: "select", options: [
      { value: "tight", label: "Tight" },
      { value: "normal", label: "Normal" },
      { value: "loose", label: "Loose" },
    ] }],
    defaults: { spacing: "normal" },
  },
];

export const SECTION_BY_TYPE: Record<string, SectionDef> = Object.fromEntries(
  SECTIONS.map((s) => [s.type, s])
);

export const SECTION_GROUPS = ["Openers", "Text", "Data", "Lists", "Media", "Contact"] as const;

/** Placement is edited in its own panel rather than repeated in every schema. */
export const LAYOUT_FIELDS: Field[] = [
  select("ground", "Background", [
    ["wall", "White, blueprint grid"],
    ["wall-dense", "White, fine grid"],
    ["amber", "Amber band"],
    ["amber-deep", "Deep amber band"],
    ["plain", "No background"],
  ]),
  select("column", "Column", [
    ["full", "Full width"],
    ["left", "Left column"],
    ["right", "Right column"],
  ], { help: "Neighbouring left and right blocks pair into two columns." }),
  select("width", "Measure", [["wide", "Wide"], ["narrow", "Narrow"]]),
  text("anchor", "Anchor", { help: "Lets a link jump here, e.g. facilities for /academics#facilities." }),
];
