export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; note?: string }[];
}

export const navigation: NavItem[] = [
  {
    label: "About",
    href: "/about",
    children: [
      { label: "About the school", href: "/about", note: "Founded 2016 · CBSE" },
      { label: "Director's message", href: "/about/directors-message" },
      { label: "Principal's message", href: "/about/principals-message" },
      { label: "Vision & mission", href: "/about/vision-mission" },
      { label: "Our management", href: "/about/management" },
      {
        label: "Mandatory public disclosure",
        href: "/about/disclosure",
        note: "CBSE filing",
      },
    ],
  },
  {
    label: "Academics",
    href: "/academics",
    children: [
      { label: "Pre-Primary", href: "/academics/pre-primary", note: "Ages 3–6" },
      { label: "Primary", href: "/academics/primary", note: "Std I–VII" },
      {
        label: "Secondary & CBSE",
        href: "/academics/secondary",
        note: "Std VIII–X",
      },
      { label: "Facilities", href: "/academics#facilities" },
    ],
  },
  { label: "Admissions", href: "/admissions" },
  // The returning parent's entry point — the one menu item that is not aimed
  // at a family still deciding.
  { label: "Notices", href: "/notices" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];
