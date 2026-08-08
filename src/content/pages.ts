import type { StaticPage, Facility, NewsItem, Testimonial, ResultRow } from "./types";
import { awaiting } from "./types";

/**
 * About-section pages. Message copy is reproduced from the school's own site.
 * Adding an entry here adds a route at /about/<slug> and a card on the About
 * index automatically.
 */
export const aboutPages: StaticPage[] = [
  {
    slug: "directors-message",
    plate: "PLATE A",
    title: "Director's Message",
    standfirst:
      "Childhood is the best time to lay the foundation of the core values essential for the overall development of the future citizen of tomorrow.",
    body: [
      "Childhood is the best time to lay the foundation of the core values essential for the overall development of the future citizen of tomorrow. We are proud of our continuous goal of providing an excellent education for our students for better future they can choose different field like Scientist, Aeronautical engineering, Astronaut etc.",
      "We guide our children towards right principles, ethics and moral values. Our basic dream is to inculcate Indian culture so we had started Vedpathshala. We offers a wide variety of challenging, enjoyable and successful curricular opportunities, athletic programs, performing arts and musical programs with various clubs and activities.",
      "Equal attention is given to the development of the children both academically and in extracurricular activities like different sports, yoga, cultural activities, etc. We offer our students a stress free learning environment which encourages creativity and critical thinking. We are always open to refreshing views and suggestions, which can add more value to the students of our school.",
    ],
    signature: { name: "Mr Madhav Pandurang Raut", role: "Director" },
  },
  {
    slug: "principals-message",
    plate: "PLATE B",
    title: "Principal's Message",
    standfirst:
      "We identify each child as unique in their thought processes, abilities, interests and approaches to learning.",
    body: [
      "We believe that learning in 21st century needs a collaborative learning environment for developing certain core competencies such as critical thinking, digital literacy and problem solving skills that advocate students to thrive in today's world. We provide equal opportunities for spiritual, cultural, social and emotional development of child.",
      "VENUS WORLD SCHOOLS open minds school identifies each child as unique in their thought processes, abilities, interests and approaches to learning. We provide an atmosphere where child is allowed discover his own abilities. We want the students to embrace the multitude of opportunities available to express their uniqueness and talent. Teachers create classroom learning environments in which all students are engaged, challenged and feel safe to take risks.",
      "We try to make children discover abilities in them and acquire skills which will be helpful for them in facing challenges arising in future. We look forward to develop our students as visionaries of the future. The school endeavors to deliver high quality educational experiences for social, emotional and behavioral well-being of the students extending everyone equal opportunities to learn.",
    ],
    signature: { name: "Mrs Mrunmai Mahendra Vaidya", role: "Principal · M.A., B.Ed." },
  },
  {
    slug: "vision-mission",
    plate: "PLATE C",
    title: "Vision & Mission",
    deva: "ध्येय आणि उद्दिष्ट",
    standfirst: "Together we can make life sublime.",
    body: [],
  },
  {
    slug: "management",
    plate: "PLATE D",
    title: "Our Management",
    standfirst:
      "The school is led by a family whose institutions have served the Manjari and Hadapsar belt for decades — a sugar cooperative and a cooperative bank among them.",
    body: [],
  },
];

export const visionMission = {
  vision:
    "To give education which can bring about a positive revolution in the society. A community supporting young people to realize their potential; forever learning, forever teaching in the service of humanity.",
  mission:
    "To provide a unique, learning-centered environment that is conducive for young people to go through an integrated and developmental approach to education. Through meaningful student engagement in learning we aspire to develop interpersonal, physical and cognitive competencies, empowering young people to lead purposeful and fulfilling lives.",
  /** The school's stated objectives for its students, reproduced verbatim. */
  studentObjectives: [
    "Use creative, innovative and critical thinking to make a difference",
    "Apply passions, talents and skills to create an exciting future contributing positively to the world",
    "Recognize adventure, opportunity, connections and possibilities in life",
    "Act with respect towards themselves and others",
    "Transform dreams and ideas into reality",
    "Meet challenges with resilience and flexibility",
    "Establish happy and healthy life balance",
    "Communicate with maturity, openness and integrity",
    "Embrace fun and live with curiosity",
  ],
} as const;

export const management = [
  {
    name: "Mr Pandurang Abaji Raut",
    role: "Chairman",
    positions: [
      "Founder Chairman & M.D., Shreenath Mhaskoba Sakhar Karkhana Ltd.",
      "Ex-Chairman, Janaseva Sahakari Bank Ltd.",
    ],
    honours: [
      "Rashtriya Ratan Puraskar",
      "Bharat Gaurav Puraskar",
      "Udyogshree Puraskar",
      "Sakal Excellence Puraskar",
      "Jivan Gaurav Puraskar (STAI)",
    ],
  },
  {
    name: "Mr Madhav Pandurang Raut",
    role: "Director",
    positions: [
      "Director, Shreenath Mhaskoba Sakhar Karkhana Ltd.",
      "Director, Sri Sri Milk Food Products (Amul co-packing division)",
    ],
    honours: [],
  },
] as const;

/**
 * The six places pinned on the campus drawing. Numbers here must match
 * `campusPins` in components/diagrams/CampusCutaway.tsx, which positions them.
 */
export const campusKey = [
  { n: 1, label: "Classrooms", detail: "35 rooms, 48 sq m each, smart boards fitted" },
  { n: 2, label: "Laboratories", detail: "Five — science, mathematics and computer" },
  { n: 3, label: "Vedpathshala", detail: "Sanskrit and Vedic study, on campus" },
  { n: 4, label: "Play area", detail: "Equipment certified to international safety standards" },
  { n: 5, label: "Library", detail: "Reading as a daily habit, not a scheduled period" },
  { n: 6, label: "Assembly ground", detail: "3,245.20 sq m of campus" },
];

/** Facilities, lettered A–J as a chart key. */
export const facilities: Facility[] = [
  {
    n: 1,
    name: "Classrooms",
    detail:
      "35 rooms of 48 sq m each, fitted with smart boards and LCD projectors.",
  },
  {
    n: 2,
    name: "Science laboratory",
    detail: "Practical work from the primary years upward, on real apparatus.",
  },
  { n: 3, name: "Mathematics laboratory", detail: "Concepts built by hand before they are built on paper." },
  { n: 4, name: "Computer laboratory", detail: "Digital literacy taught as a core competency, not an add-on." },
  { n: 5, name: "Library", detail: "Reading as a daily habit rather than a scheduled period." },
  {
    n: 6,
    name: "Vedpathshala",
    deva: "वेदपाठशाळा",
    detail:
      "Sanskrit and Vedic study on campus — the Director's stated reason for founding it was to inculcate Indian culture.",
  },
  {
    n: 7,
    name: "Sports",
    detail: "Qualified coaches, a house system, and competition running through the year.",
  },
  {
    n: 8,
    name: "Play areas",
    detail: "Equipment certified to international safety standards.",
  },
  { n: 9, name: "CCTV surveillance", detail: "Monitored across the campus." },
  {
    n: 10,
    name: "Performing arts",
    detail: "Speech, drama, music, dance and eurhythmics.",
  },
];

export const news: NewsItem[] = [
  {
    slug: "admissions-2026-27",
    date: "2026-01-01",
    kind: "Admission",
    title: "Admissions open for 2026–27",
    body: "Registration forms are available from 1 January to 15 June 2026. Seats are filled by random selection; submitting a form does not guarantee admission.",
    href: "/admissions",
  },
  {
    slug: "class-x-2025-26",
    date: "2026-05-01",
    kind: "Achievement",
    title: "Class X records a 97.22% pass",
    body: "72 students were registered for the 2025–26 Class X board examination, with a 97.22% pass rate.",
    href: "/about/disclosure",
  },
  {
    slug: "india-book-of-records",
    date: "2024-02-09",
    kind: "Achievement",
    title: "India Book of Records — rope skipping",
    body: "52,32,480 cumulative skips across 100 days, and 1,72,168 skips recorded in a single minute on 9 February.",
  },
  {
    slug: "ek-mutthi-anaj",
    date: "2025-08-15",
    kind: "Event",
    title: "Ek Mutthi Anaj",
    body: "The school's ongoing grain collection, gathered by students and given to orphanages.",
  },
];

/**
 * Placeholder slots. The school supplies these before launch; until then each
 * renders as a visible "awaiting copy" state. Never author quotes here.
 */
export const testimonials: Testimonial[] = [
  { quote: awaiting("parent testimonial"), name: awaiting("parent name"), relation: awaiting("class and year") },
  { quote: awaiting("parent testimonial"), name: awaiting("parent name"), relation: awaiting("class and year") },
  { quote: awaiting("parent testimonial"), name: awaiting("parent name"), relation: awaiting("class and year") },
];

/** Only 2025–26 is published. Earlier years await the school's figures. */
export const boardResults: ResultRow[] = [
  { year: "2025–26", registered: 72, passPercent: 97.22 },
  { year: "2024–25", registered: awaiting("registered count"), passPercent: awaiting("pass %") },
  { year: "2023–24", registered: awaiting("registered count"), passPercent: awaiting("pass %") },
];
