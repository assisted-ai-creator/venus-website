import type { Album, VideoItem, Photo } from "./types";

/**
 * Gallery. Every photograph below has been individually reviewed, and its alt
 * text describes what is actually in the frame. Adding an album here adds a
 * route at /gallery/<slug> and a cover on the gallery index.
 */
export const albums: Album[] = [
  {
    slug: "assembly-and-campus",
    title: "Assembly & Campus",
    category: "School life",
    cover: "/photos/campus-1000561603.jpg",
    photos: [
      {
        src: "/photos/campus-1000561603.jpg",
        alt: "Several hundred students in navy and light-blue uniforms seated cross-legged in long rows on the school ground for morning assembly, with teachers standing along the boundary wall.",
        caption: "Morning assembly on the school ground",
      },
      {
        src: "/photos/campus-1000561607.jpg",
        alt: "A wider view of the same assembly, showing the school building on the left and residential towers beyond the boundary wall.",
        caption: "The whole school at assembly",
      },
      {
        src: "/photos/campus-aerial.jpg",
        alt: "Elevation view of the four-storey Venus World Schools building, with the Indian flag flying at the central steps and the school name mounted on the end wall.",
        caption: "The school building",
      },
      {
        src: "/photos/campus-1000561577.jpg",
        alt: "A student receiving a certificate on stage from a member of staff, in front of a Venus World Schools banner.",
        caption: "Certificate presentation",
      },
    ],
  },
  {
    slug: "laboratories",
    title: "Laboratories",
    category: "Academics",
    cover: "/photos/campus-1000561616.jpg",
    photos: [
      {
        src: "/photos/campus-1000561616.jpg",
        alt: "A teacher explaining a human skeleton model to a group of students crowded around a black laboratory bench, with a pulley apparatus and a microscope in the foreground.",
        caption: "A lesson on the human skeleton",
      },
      {
        src: "/photos/campus-1000561618.jpg",
        alt: "Students watching a practical demonstration in the laboratory, with an anatomical torso model and pulley frames set out on the bench and a whiteboard headed 'Practical board' behind.",
        caption: "Practical demonstration",
      },
      {
        src: "/photos/campus-1000561543.jpg",
        alt: "A student in red and navy house kit leaning over a microscope at a laboratory bench, adjusting the slide stage.",
        caption: "At the microscope",
      },
      {
        src: "/photos/campus-1000561614.jpg",
        alt: "Six boys gathered around a potted plant on a table in front of a blackboard headed 'Parts of Plant', with a labelled chalk diagram and the day's timetable written up.",
        caption: "Parts of a plant — an EVS lesson",
      },
    ],
  },
  {
    slug: "makar-sankranti",
    title: "Makar Sankranti",
    category: "Festivals",
    cover: "/photos/campus-1000561626.jpg",
    photos: [
      {
        src: "/photos/campus-1000561626.jpg",
        alt: "Eleven pre-primary children in navy uniform standing in a line along a hedge, each holding a brightly coloured paper kite.",
        caption: "Kites before the flying begins",
      },
      {
        src: "/photos/campus-1000561630.jpg",
        alt: "Children in navy uniform spread across the school forecourt holding kites, with a teacher watching from the building entrance.",
        caption: "Kite flying in the forecourt",
      },
      {
        src: "/photos/campus-1000561627.jpg",
        alt: "A young boy in navy uniform holding a pink Doraemon kite with both hands, looking at the camera.",
        caption: "A first kite",
      },
      {
        src: "/photos/campus-1000561637.jpg",
        alt: "A boy carrying a blue foil-fringed kite under the school's covered forecourt, with other children flying kites behind him.",
        caption: "Under the forecourt",
      },
    ],
  },
  {
    slug: "christmas",
    title: "Christmas",
    category: "Festivals",
    cover: "/photos/campus-1000561633.jpg",
    photos: [
      {
        src: "/photos/campus-1000561633.jpg",
        alt: "A large group of pre-primary children in red and white clothes with Santa hats, seated and standing with three teachers in front of a decorated Merry Christmas notice board.",
        caption: "The Christmas gathering",
      },
      {
        src: "/photos/campus-1000561635.jpg",
        alt: "Four young girls in red dresses and Santa hats standing beside a straw crib decorated with tinsel and garlands.",
        caption: "Beside the crib",
      },
    ],
  },
  {
    slug: "sports-and-pe",
    title: "Sports & Physical Education",
    category: "School life",
    cover: "/photos/campus-1000561620.jpg",
    photos: [
      {
        src: "/photos/campus-1000561620.jpg",
        alt: "Around thirty children in house sports kit of teal, red, blue and yellow standing in formation on the ground with arms outstretched during a physical training drill, marker cones in front of them.",
        caption: "Physical training drill",
      },
      {
        src: "/photos/campus-1000561589.jpg",
        alt: "Pre-primary children crouched in a circle holding the edge of a rainbow parachute in the courtyard, with coloured discs strung overhead and more children waiting in line behind.",
        caption: "Parachute play",
      },
    ],
  },
];

export const videos: VideoItem[] = [
  {
    title: "Venus World Schools — school channel",
    youtubeId: "",
    date: "",
  },
];

export const getAlbum = (slug: string) => albums.find((a) => a.slug === slug);

export const allPhotos: Photo[] = albums.flatMap((a) => a.photos);

export const galleryCategories = Array.from(new Set(albums.map((a) => a.category)));

/** Hero banner slider — the specimen plate mounted inside the chart. */
export const heroSlides: Photo[] = [
  {
    src: "/photos/campus-1000561603.jpg",
    alt: "Several hundred students in navy and light-blue uniforms seated cross-legged in long rows on the school ground for morning assembly.",
    caption: "Morning assembly — 1,165 students on roll",
  },
  {
    src: "/photos/campus-1000561616.jpg",
    alt: "A teacher explaining a human skeleton model to students crowded around a laboratory bench.",
    caption: "One of five laboratories on campus",
  },
  {
    src: "/photos/campus-1000561626.jpg",
    alt: "Eleven pre-primary children in navy uniform standing in a line, each holding a brightly coloured paper kite.",
    caption: "Makar Sankranti in the pre-primary years",
  },
  {
    src: "/photos/campus-1000561620.jpg",
    alt: "Children in house sports kit standing in formation with arms outstretched during a physical training drill.",
    caption: "Physical training, in house colours",
  },
];
