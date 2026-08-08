/**
 * Core institutional facts.
 *
 * Every figure here is traceable to the school's own published record —
 * venusworldschools.org and its CBSE Mandatory Public Disclosure filing.
 * Nothing in this file may be invented. See PRODUCT.md → "Evidence on Hand".
 */

export const school = {
  name: "Venus World Schools",
  shortName: "Venus World Schools",
  motto: "Together we can make life sublime",
  mottoDeva: "एकत्र येऊन आपण जीवन उदात्त करू शकतो",
  tagline:
    "Committed to educating and nurturing all students so they may grow towards responsible global citizenship",

  board: "CBSE",
  affiliationNo: "1131024",
  schoolCode: "22551",
  established: 2016,

  /** Canonical address — the CBSE Mandatory Public Disclosure record. */
  address: {
    line1: "Sr. No. 163+92/1, Amar Srushti Co. Hsg. Society",
    line2: "Manjari (BK), Pune",
    postcode: "412307",
    state: "Maharashtra",
    country: "India",
    /** How parents actually search for the school. */
    locality: "Hadapsar · Manjari · East Pune",
  },

  phones: [
    { label: "School office", number: "020-29790064", href: "tel:+912029790064" },
    { label: "Admissions", number: "70280 88103", href: "tel:+917028088103" },
    { label: "Pre-Primary", number: "93569 79664", href: "tel:+919356979664" },
    { label: "Balvatika", number: "90963 62146", href: "tel:+919096362146" },
  ],

  emails: {
    helpdesk: "helpdesk@venusworldschools.org",
    principal: "principal@venusworldschools.org",
  },

  hours: [
    { days: "Monday – Saturday", time: "9:00 am – 2:00 pm" },
    { days: "Sunday", time: "Closed" },
  ],

  social: {
    youtube: "https://www.youtube.com/channel/UCSC3EfShJJ4_jZlFN49rNDA",
    facebook: "https://www.facebook.com/venusworldschools",
  },

  /** External admissions portal — the site hands off, it does not replace it. */
  registrationUrl: "https://app.vidyalekha.com/onlineAdmission/1167",

  /** CBSE Mandatory Public Disclosure, filed figures. */
  record: {
    students: 1165,
    teachers: 34,
    teacherBreakdown: "15 TGT · 17 PRT · 6 NTT",
    teacherSectionRatio: "1 : 1.5",
    classrooms: 35,
    classroomSize: "48 sq m each",
    laboratories: 5,
    laboratoryArea: "101 sq m",
    campusArea: "3,245.20 sq m",
    girlsToilets: 30,
    boysToilets: 20,
    classXPass: "97.22%",
    classXRegistered: 72,
    classXSession: "2025–26",
    principal: "Mrs Mrunmai Mahendra Vaidya",
    principalQualification: "M.A., B.Ed.",
  },

  admissionWindow: {
    session: "2026–27",
    opens: "1 January 2026",
    closes: "15 June 2026",
    onlineWindow: "1 Jan 2026, 11:00 am – 15 Jun 2026, 11:00 am",
    officeWindow: "9:00 am – 12:00 pm",
    selection: "Random selection",
  },

  siteUrl: "https://venusworldschools.org",
} as const;

export const geo = {
  /** Manjari (BK), Pune — approximate campus centroid for the map embed. */
  lat: 18.5107,
  lng: 73.9713,
  mapQuery: "Venus World Schools, Amar Srushti, Manjari Budruk, Pune 412307",
} as const;

export const fees = {
  note: "Class I, academic year 2026–27. Figures as published by the school.",
  oneTime: [
    { label: "Registration", amount: 1000 },
    { label: "Admission form", amount: 1000 },
    { label: "Admission fee", amount: 20000 },
  ],
  instalments: [
    { label: "1st instalment", amount: 19500 },
    { label: "2nd instalment", amount: 13747 },
    { label: "3rd instalment", amount: 13747 },
    { label: "4th instalment", amount: 10000 },
  ],
  annualTotal: 56994,
  conditions: [
    "Submitting an admission form does not guarantee admission.",
    "Available seats are filled by random selection.",
    "If a student leaves before the end of a term, the admission fee is not returned.",
  ],
} as const;

/**
 * Date-of-birth window per class for 2026–27.
 *
 * The school publishes these as "Min DOB" and "Max DOB", where "minimum" is the
 * youngest permitted child (the LATEST birth date) and "maximum" is the oldest
 * (the EARLIEST birth date). Stored here as an explicit earliest/latest pair so
 * the column headings can never be read the wrong way round: a child qualifies
 * if born between `earliest` and `latest` inclusive.
 */
export const ageCriteria = {
  note: "Date-of-birth window for admission in 2026–27, as published by the school. A child qualifies if born between the two dates, inclusive.",
  columns: ["Class", "Born on or after", "Born on or before"],
  rows: [
    { standard: "Playgroup", earliest: "1 Jul 2022", latest: "16 Jan 2024" },
    { standard: "Pre-KG", earliest: "1 Jul 2021", latest: "16 Jan 2023" },
    { standard: "Junior KG", earliest: "1 Jul 2020", latest: "16 Jan 2022" },
    { standard: "Senior KG", earliest: "1 Jul 2019", latest: "16 Jan 2021" },
    { standard: "Standard I", earliest: "1 Jul 2018", latest: "16 Jan 2020" },
  ],
} as const;

export const admissionDocuments = [
  "Birth certificate — original and attested true copy",
  "Medical certificate from a registered paediatrician",
  "Caste certificate, where applicable",
  "Passport or PIO card, for international students",
  "Passport photographs of the child and both parents",
] as const;

export const admissionSteps = [
  {
    n: 1,
    title: "Collect the registration form",
    detail:
      "Forms are available on this website and at the school office from 1 January 2026 to 15 June 2026.",
  },
  {
    n: 2,
    title: "Submit with documents",
    detail:
      "Online any time within the window, or at the office between 9:00 am and 12:00 pm on a working day.",
  },
  {
    n: 3,
    title: "Random selection",
    detail:
      "Where applications exceed seats, available seats are filled by random selection. Submitting a form does not guarantee admission.",
  },
  {
    n: 4,
    title: "Confirmation and fees",
    detail:
      "Selected families confirm the seat by submitting original documents and paying the admission fee.",
  },
] as const;
