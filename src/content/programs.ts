import type { Program } from "./types";

/**
 * Academic programmes. Body copy is taken from the school's own programme
 * pages. Adding a programme here adds a route at /academics/<slug> and a plate
 * on the academics index — no component changes required.
 */
export const programs: Program[] = [
  {
    slug: "pre-primary",
    plate: "PLATE I",
    name: "Pre-Primary",
    deva: "पूर्व-प्राथमिक",
    grades: "Playgroup · Pre-KG · Nursery · Junior KG · Senior KG",
    shortGrades: "Playgroup – Senior KG",
    ages: "Admission at ages 3 to 6",
    hours: "9:30 am – 12:30 pm",
    summary:
      "The early years are spent building understanding through practical activity, purposeful play and talk — not through formal academics.",
    body: [
      "Children in the early years learn through active learning. Practical activities, purposeful play and talk build the foundational understanding and cognitive skills they will need for everything that follows.",
      "We create stimulating spaces through storytelling, and we plan around the physical, emotional and cognitive needs of the child during the early years. Rather than beginning with formal academics, the curriculum lets children develop an understanding of the world and the basic concepts they will need for later learning, through hands-on exploration and play.",
      "Parent involvement matters here more than at any later stage. It is what develops language competency and a positive attitude towards learning, and we ask families to be part of it.",
    ],
    callouts: [
      { n: 1, label: "Active learning", detail: "Practical activity, purposeful play and talk" },
      { n: 2, label: "Storytelling", detail: "Stimulating spaces built around narrative" },
      { n: 3, label: "Short day", detail: "9:30 am to 12:30 pm, matched to attention span" },
      { n: 4, label: "Parents involved", detail: "Language competency built at home and school" },
    ],
    photo: {
      src: "/photos/campus-1000561589.jpg",
      alt: "Pre-primary children in navy pinafores crouching around a rainbow parachute in the school courtyard, with coloured discs suspended overhead.",
      caption: "Parachute play in the courtyard",
    },
  },
  {
    slug: "primary",
    plate: "PLATE II",
    name: "Primary",
    deva: "प्राथमिक",
    grades: "Standard I – VII",
    shortGrades: "Std I – VII",
    summary:
      "Academics take priority, and personal, social and emotional well-being is given equal weight. From Standard IV the school begins gearing towards the CBSE curriculum.",
    body: [
      "In the primary years academics are given top priority, and the development of the child is given equal consideration alongside them. We work to promote positive attitudes and disposition towards learning, and the curriculum provides deliberate opportunities to develop social skills.",
      "The programme covers language and communication, reading and writing, mathematics, science, and knowledge and understanding of the world, together with physical and creative development. English carries the greatest emphasis and is a mandatory pass subject.",
      "From Standard IV onwards the school gears towards the CBSE curriculum, so that the transition into the secondary years is a continuation rather than a change of direction. A house system runs healthy competition across a variety of activities, on an ongoing basis throughout the year.",
    ],
    callouts: [
      { n: 1, label: "English emphasis", detail: "Greatest weight; a mandatory pass subject" },
      { n: 2, label: "Well-being", detail: "Personal, social and emotional development weighted equally" },
      { n: 3, label: "CBSE from Std IV", detail: "Gears towards the board curriculum early" },
      { n: 4, label: "House system", detail: "Year-round competition across activities" },
    ],
    photo: {
      src: "/photos/campus-1000561614.jpg",
      alt: "Six primary boys in house sports kit gathered around a potted plant on a table, in front of a blackboard headed 'Parts of Plant' with a labelled chalk diagram and the day's timetable.",
      caption: "An EVS lesson on the parts of a plant",
    },
  },
  {
    slug: "secondary",
    plate: "PLATE III",
    name: "Secondary & CBSE Curriculum",
    deva: "माध्यमिक",
    grades: "Standard VIII – X",
    shortGrades: "Std VIII – X",
    summary:
      "The CBSE course, taken to the board examination — with Hindi as second language throughout and Marathi as third language to Standard IX, from which no student is exempted.",
    body: [
      "The secondary years aim at cognitive, affective and psychomotor excellence, and at the competencies a student needs in the twenty-first century: self-awareness, mastery of subject competencies, a disposition towards lifelong learning, values, technological literacy, livelihood skills and physical wellness.",
      "Hindi is taught as second language from Standard I to X. Marathi is taught as third language from Standard I to IX, and no student is exempted from Marathi.",
      "The school follows the Central Board of Secondary Education, one of the most prestigious educational boards in India. Its syllabus is well-researched and incorporates international trends; it is cumulative, connecting topics in sequence so that retention is stronger; and its concentration on mathematics and science aligns directly with the entrance examinations students go on to sit — IIT-JEE, PMT and the defence services examinations among them. The board is recognised in India and internationally.",
    ],
    callouts: [
      { n: 1, label: "CBSE board", detail: "Affiliation No. 1131024 · School Code 22551" },
      { n: 2, label: "Three languages", detail: "English, Hindi to Std X, Marathi to Std IX" },
      { n: 3, label: "Entrance-aligned", detail: "Mathematics and science mapped to IIT-JEE, PMT, defence" },
      { n: 4, label: "97.22% pass", detail: "Class X, 2025–26 · 72 students registered" },
    ],
    photo: {
      src: "/photos/campus-1000561543.jpg",
      alt: "A secondary student in red and navy house kit leaning over a microscope at a black laboratory bench, adjusting the slide stage beside an anatomical model.",
      caption: "Practical work in the science laboratory",
    },
  },
];

export const getProgram = (slug: string) => programs.find((p) => p.slug === slug);
