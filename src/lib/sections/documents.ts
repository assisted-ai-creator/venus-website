/**
 * Settings documents.
 *
 * These are the facts the whole site draws on — the address in the footer and
 * the structured data, the telephone numbers on Contact and in the enquiry
 * block, the CBSE figures quoted on Home and the disclosure page. They live in
 * one place so correcting a number corrects it everywhere at once.
 */

import type { Field } from "./registry";

export interface DocumentDef {
  key: string;
  name: string;
  description: string;
  fields: Field[];
}

const text = (name: string, label: string, extra: Partial<Field> = {}): Field => ({
  name,
  label,
  type: "text",
  ...extra,
});

export const DOCUMENTS: DocumentDef[] = [
  {
    key: "school",
    name: "The school",
    description:
      "Name, motto, board figures, address, telephone numbers and office hours. Used across every page, the footer and the data search engines read.",
    fields: [
      text("name", "Name", { help: "Plural — Venus World Schools, never “School”." }),
      text("shortName", "Short name", { width: "half" }),
      text("tagline", "Tagline"),
      text("motto", "Motto", { width: "half" }),
      text("mottoDeva", "Motto in Devanagari", { width: "half" }),

      { name: "board", label: "Board", type: "text", width: "half" },
      text("affiliationNo", "Affiliation number", { width: "half" }),
      text("schoolCode", "School code", { width: "half" }),
      text("established", "Year founded", { width: "half" }),
      text("siteUrl", "Website address", { help: "With https://. Used for canonical links and the sitemap." }),
      text("registrationUrl", "Registration portal", { help: "Where the Register buttons send parents." }),

      {
        name: "address",
        label: "Address",
        type: "group",
        fields: [
          text("line1", "Line one"),
          text("line2", "Line two", { width: "half" }),
          text("postcode", "Postcode", { width: "half" }),
          text("state", "State", { width: "half" }),
          text("country", "Country", { width: "half" }),
          text("locality", "Locality, as parents search for it", {
            help: "Shown as context, e.g. Hadapsar · Manjari · East Pune.",
          }),
        ],
      },
      {
        name: "map",
        label: "Map",
        type: "group",
        fields: [
          text("query", "Map search", { help: "What Google Maps is asked to find." }),
          text("lat", "Latitude", { width: "half" }),
          text("lng", "Longitude", { width: "half" }),
        ],
      },
      {
        name: "phones",
        label: "Telephone numbers",
        type: "list",
        itemLabel: "label",
        addLabel: "Add a number",
        fields: [
          text("label", "Desk"),
          text("number", "Number", { width: "half" }),
          text("href", "Dial link", { width: "half", placeholder: "tel:+912029790064" }),
        ],
      },
      {
        name: "emails",
        label: "Email addresses",
        type: "group",
        fields: [
          text("helpdesk", "General enquiries", { width: "half" }),
          text("principal", "Principal's office", { width: "half" }),
        ],
      },
      {
        name: "hours",
        label: "Office hours",
        type: "list",
        itemLabel: "days",
        addLabel: "Add a row",
        fields: [text("days", "Days", { width: "half" }), text("time", "Time", { width: "half" })],
      },
      {
        name: "social",
        label: "Social accounts",
        type: "group",
        fields: [
          text("youtube", "YouTube"),
          text("facebook", "Facebook"),
          text("instagram", "Instagram"),
        ],
      },
      {
        name: "admissionWindow",
        label: "Admissions",
        type: "group",
        fields: [
          text("session", "Session", { width: "half", placeholder: "2026–27" }),
          text("selection", "How places are filled", { width: "half" }),
          text("opens", "Opens", { width: "half" }),
          text("closes", "Closes", { width: "half" }),
          text("onlineWindow", "Online window"),
          text("officeWindow", "Office window"),
        ],
      },
      {
        name: "record",
        label: "CBSE filed record",
        type: "group",
        fields: [
          text("students", "Students on roll", { width: "half" }),
          text("teachers", "Teachers", { width: "half" }),
          text("teacherBreakdown", "Teacher breakdown", { width: "half" }),
          text("teacherSectionRatio", "Teacher–section ratio", { width: "half" }),
          text("classrooms", "Classrooms", { width: "half" }),
          text("classroomSize", "Classroom size", { width: "half" }),
          text("laboratories", "Laboratories", { width: "half" }),
          text("laboratoryArea", "Laboratory area", { width: "half" }),
          text("campusArea", "Campus area", { width: "half" }),
          text("girlsToilets", "Toilets — girls", { width: "half" }),
          text("boysToilets", "Toilets — boys", { width: "half" }),
          text("classXPass", "Class X pass", { width: "half" }),
          text("classXRegistered", "Class X registered", { width: "half" }),
          text("classXSession", "Class X session", { width: "half" }),
          text("principal", "Principal", { width: "half" }),
          text("principalQualification", "Principal's qualifications", { width: "half" }),
        ],
      },
    ],
  },

  {
    key: "nav",
    name: "Main menu",
    description:
      "The menu across the top of every page. A entry with sub-items opens a panel; one without is a plain link.",
    fields: [
      {
        name: "items",
        label: "Menu entries",
        type: "list",
        itemLabel: "label",
        addLabel: "Add a menu entry",
        fields: [
          text("label", "Label", { width: "half" }),
          text("href", "Links to", { width: "half", placeholder: "/about" }),
          {
            name: "children",
            label: "Sub-items",
            type: "list",
            itemLabel: "label",
            addLabel: "Add a sub-item",
            fields: [
              text("label", "Label", { width: "half" }),
              text("href", "Links to", { width: "half" }),
              text("note", "Note", { help: "Small grey line under the label." }),
            ],
          },
        ],
      },
    ],
  },

  {
    key: "footer",
    name: "Footer",
    description: "The link columns, the closing line and whether the social buttons appear.",
    fields: [
      { name: "blurb", label: "Closing line", type: "textarea", rows: 2 },
      text("legal", "Small print", { help: "Printed after the copyright line." }),
      { name: "showSocial", label: "Show the social buttons", type: "boolean" },
      {
        name: "columns",
        label: "Link columns",
        type: "list",
        itemLabel: "heading",
        addLabel: "Add a column",
        max: 2,
        help: "Two columns of links sit beside the telephone and hours column.",
        fields: [
          text("heading", "Heading"),
          {
            name: "links",
            label: "Links",
            type: "list",
            itemLabel: "label",
            addLabel: "Add a link",
            fields: [text("label", "Label", { width: "half" }), text("href", "Links to", { width: "half" })],
          },
        ],
      },
    ],
  },

  {
    key: "seo",
    name: "Search engines",
    description:
      "What Google shows for the site as a whole. Individual pages override this in their own settings.",
    fields: [
      text("defaultTitle", "Site title"),
      text("titleTemplate", "Title pattern", {
        help: "%s is replaced by the page title, e.g. “%s — Venus World Schools”.",
      }),
      { name: "description", label: "Site description", type: "textarea", rows: 3 },
      text("ogImage", "Sharing image", { help: "A path such as /photos/campus-1000561603.jpg" }),
      {
        name: "keywords",
        label: "Keywords",
        type: "list",
        itemLabel: "text",
        addLabel: "Add a keyword",
        fields: [text("text", "Keyword")],
      },
    ],
  },
];

export const DOCUMENT_BY_KEY: Record<string, DocumentDef> = Object.fromEntries(
  DOCUMENTS.map((d) => [d.key, d])
);

/**
 * `nav` and `seo.keywords` are stored as bare arrays, but the form renderer
 * works in objects — these adapt between the two so the schema stays simple.
 */
export function toForm(key: string, value: unknown): Record<string, unknown> {
  if (key === "nav") return { items: Array.isArray(value) ? value : [] };
  if (key === "seo") {
    const v = (value ?? {}) as Record<string, unknown>;
    return {
      ...v,
      keywords: Array.isArray(v.keywords) ? v.keywords.map((k) => ({ text: String(k) })) : [],
    };
  }
  return (value ?? {}) as Record<string, unknown>;
}

export function fromForm(key: string, form: Record<string, unknown>): unknown {
  if (key === "nav") return Array.isArray(form.items) ? form.items : [];
  if (key === "seo") {
    const keywords = Array.isArray(form.keywords)
      ? form.keywords
          .map((k) => String((k as Record<string, unknown>)?.text ?? "").trim())
          .filter(Boolean)
      : [];
    return { ...form, keywords };
  }
  return form;
}
