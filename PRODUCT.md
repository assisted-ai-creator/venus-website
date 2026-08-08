# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (App Router) deployed to Cloudflare via `@opennextjs/cloudflare`. TypeScript, Tailwind CSS. Cloudflare provides SSL. Enquiry submissions go through a server route that emails the school and logs to Cloudflare D1. User-specified stack; deploy target constrains the answer (static export is insufficient because forms need a server route).

## Users

**Primary: parents of children aged 3–14 in Hadapsar / Manjari / East Pune**, evaluating CBSE schools for the 2026–27 session. They are typically comparing three to five schools at once, often on a phone, often at night after work. Their job is to reduce risk: decide whether this school is safe, academically serious, and worth a ~₹57,000–72,000 first-year commitment — then find the fastest path to registering before seats fill.

**Secondary: prospective staff** using the Career page, and **current parents** returning for the annual planner, results, notices and gallery.

Language context: Pune, Maharashtra. Parents are English-comfortable; Marathi and Hindi are spoken at home. Content is English.

## Product Purpose

The website is the school's admissions front door. Success is a parent completing the enquiry form or reaching the Vidyalekha registration portal, and arriving at a campus visit already convinced. Secondary success is the site standing as the school's public record — CBSE disclosure, affiliation, results, planner — so parents and the board can verify claims.

The current site is a dated WordPress theme; it does not reflect a school with 2,000 students, a 97.22% Class X pass rate, and an India Book of Records entry.

## Positioning

A CBSE school that pairs measurable academic rigour with an explicitly Indian cultural grounding that neighbouring CBSE schools do not offer: **Vedpathshala** (Sanskrit and Vedic study on campus), **Ek Mutthi Anaj** (grain collection for orphanages), and compulsory Marathi through Std IX with no exemptions. The motto is "Together we can make life sublime."

The mechanism a competitor could not truthfully copy: Vedpathshala plus a working sugar-cooperative and cooperative-bank founding family, giving the school deep local roots in the Manjari/Hadapsar belt.

## Operating Context

- Admission registration runs **1 Jan 2026 – 15 Jun 2026**; online 11:00am–11:00am, offline office window 9:00am–12:00pm. Seats are filled by **random selection**; submitting a form does not guarantee admission.
- Registration and admission forms are hosted externally on **Vidyalekha** (`https://app.vidyalekha.com/onlineAdmission/1167`). The website hands off to it; it does not replace it.
- Office hours: **Monday–Saturday 9:00am–2:00pm**, Sunday closed.
- Pre-primary classes run **9:30am–12:30pm**.
- A house system drives year-round inter-house competition.
- Parents will hit this site on mid-range Android phones on mobile data. Performance is an admissions concern, not a vanity metric.

## Capabilities and Constraints

**Pages required:** Home; About (About School, Director's Message, Principal's Message, Vision & Mission, Our Management); Academics (Pre-Primary, Primary, Secondary/CBSE Curriculum); Gallery (images, video, albums/categories); Contact; plus Admissions, Mandatory Public Disclosure, Affiliation, Achievements, Career, Blog/News.

**Content model:** all copy, programs, news, albums, faculty and facilities live in a typed content layer in-repo with an explicit schema. An admin panel is planned but **out of scope for this build** — the schema exists so that panel can later write the same shapes without touching the UI layer. Academics and About pages must be addable without code changes.

**Forms:** Quick Enquiry (home) and Contact form both post to a server route → email to `helpdesk@venusworldschools.org` + Cloudflare D1 row.

**Must ship:** SSL (Cloudflare), SEO-friendly rendering, Google Maps embed, hero banner slider.

**Undecided / not yet supplied:** admin panel design; Google Maps API key or place ID; email provider API key; official logo vector (only a 192px favicon exists publicly); Blog content; Career openings; annual planner PDF for 26–27.

**Known factual conflict — do not silently resolve:** the contact page states *Sr.no 15, near Amar Srushti bunglow society, Hadapsar, Pune 411028*; the CBSE Mandatory Public Disclosure states *Sr.No. 163+92/1 Amar Srushti Co.Hsg.Society, Manjari (BK) 412307*. **User confirmed the CBSE record (Manjari BK 412307) is canonical** for maps, footer and structured data. Hadapsar may still be used as locality context in SEO copy, since that is how parents search.

Also note: `venusworldschools.com` (in the original brief) does not resolve. The live site is `venusworldschools.org`.

## Brand Commitments

- Name: **Venus World Schools** (plural — never "Venus World School").
- Motto: **"Together we can make life sublime …"**
- Tagline in use: *"Committed to educating and nurturing all students so they may grow towards responsible global citizenship."*
- **Palette is pinned by the user and binds every surface: a professional institutional blue paired with saffron.** The user named US federal government sites and the University of Oxford as the register for the blue — deep, authoritative, civic, not a bright web blue. Saffron `#FFAB1F` is **user-confirmed as the school's real brand colour**, not a WordPress theme default. This pinning outranks any generated direction's own palette.
- **Colour deployment — amended 8 Aug 2026 at the user's instruction: "make the whole site white … the whole blue looks very dark."** The two inks are unchanged; where they sit is not. The page ground is **literal white** under a faint blue blueprint grid. Blue `#0B4B8F` is now the **action** ink — every button in the page body. Amber carries **section bands** as a wash (`#FFF4E2`, deep `#FFE4BD`) with saffron keylines, not as a full-strength fill. Header and footer stay `#002147` as the brand frame — user's explicit choice — and a control on any blue ground reverts to saffron, because a blue button on blue is not a button. Do not restore the dark blue page ground.
- **Colour is a ground contract, not a per-element decision.** `globals.css` defines `.wall`, `.ground-amber`, `.ground-amber-deep`, `.ground-ink` / `.on-ink` and `.plate`, each publishing `--on-ground{,-soft,-faint,-accent}`, `--ground-line`, `--plate-bg` and the button and focus inks. Components say what a thing *is* (`.on-ground-soft`) rather than what colour it is, so a band can be recoloured or moved between grounds without editing a component. Recolour there, never by hardcoding a token class onto an element on a ground.
- Existing typeface is Open Sans — a theme default, not a brand commitment.
- No logo vector exists. **Amended 8 Aug 2026 at the user's instruction ("add the logo beside the website heading instead of the svg you've drawn"):** the school's own emblem — the four figures — is cut from the 512px site icon the school publishes (`wp-content/uploads/2021/01/siteikon.png`) and saved as `public/logo-mark.png`. The header sets it beside "Venus World Schools" as type. The **full lockup is not used in the header**, because it already carries the words and would print the school's name twice. The drawn compass-rose SVG is gone; do not reinstate it. An official vector is still on the replacement list — this is a raster cut at 160px, which is enough for a 38px mark but not for print.
- **House system — rule amended 8 Aug 2026 after the finish review flagged a conflict.** The *existence* of the house system is published by the school ("A house system framework encourages healthy competition in a variety of activities held on an on-going basis throughout the year" — Primary page), so it may be stated. What is **not** established is the house **names and colours**: never invent those. The earlier blanket instruction to omit the house system entirely was stricter than the evidence required and is superseded. Photographs show sports kit in teal, red, blue and yellow, but those must not be presented as house colours without confirmation.
- Social: YouTube `UCSC3EfShJJ4_jZlFN49rNDA`, Facebook `@venusworldschools`.

## Evidence on Hand

All figures below are from the school's own published pages and are safe to state. **Nothing beyond this list may be invented — no rankings, no university placements, no fabricated quotes.**

Two sections are approved to exist as **clearly-marked placeholder slots the school must fill before launch**, and must never ship with invented content:

1. **Parent testimonials** — build the section and the content-layer shape; every slot carries a visible "awaiting school copy" state and appears on the replacement list. No quote, name or photo may be authored.
2. **Board results by year** — only 2025–26 (97.22%, 72 students) is public and may be stated. Earlier years render as empty rows the school fills in.

- **CBSE Affiliation No. 1131024**, School Code **22551**.
- Founded **2016** — user-confirmed canonical. (The homepage's "2018" is superseded.)
- **Class X 2025–26: 97.22% pass**, 72 students registered.
- **34 teachers** (15 TGT, 17 PRT, 6 NTT); teacher–section ratio 1:1.5.
- Campus **3,245.20 sq m**; **35 classrooms** at 48 sq m; **5 laboratories** (101 sq m).
- Enrollment: **1,165 students** — user-confirmed canonical. Do not use the homepage's "~2,000 students / ~200 staff"; against 34 teachers it implies a ratio a parent can disprove.
- **India Book of Records** — rope skipping: 52,32,480 cumulative skips over 100 days; 1,72,168 skips in a single minute (9 February).
- Principal: **Mrs Mrunmai Mahendra Vaidya, M.A. B.Ed** — `principal@venusworldschools.org`.
- Chairman: **Mr Pandurang Abaji Raut** — Founder Chairman & M.D., Shreenath Mhaskoba Sakhar Karkhana Ltd; Ex-Chairman, Janaseva Sahakari Bank Ltd. Awards: Rashtriya Ratan Puraskar, Bharat Gaurav Puraskar, Udyogshree Puraskar, Sakal Excellence Puraskar, Jivan Gaurav Puraskar (STAI).
- Director: **Mr Madhav Pandurang Raut** — Director, Shreenath Mhaskoba Sakhar Karkhana Ltd; Director, Sri Sri Milk Food Products (Amul co-packing division).
- Phones: **020-29790064 / 020-29790034** (main + transport/uniform/books queries), **70280 88103** (mobile), **93569 79664** (Pre-Primary), **90963 62146** (Balvatika).
- Email: `helpdesk@venusworldschools.org`, `principal@venusworldschools.org`.
- Fees, Std I: Registration ₹1,000 · Admission form ₹1,000 · Admission fee ₹20,000 · Annual ₹56,994 across four instalments (₹19,500 / ₹13,747 / ₹13,747 / ₹10,000).
- Verbatim Director's, Principal's, Vision, Mission and programme copy captured from the live site.
- ~28 real campus photographs available at `venusworldschools.org/wp-content/uploads/` — the school's own assets, pulled into `/public` with user permission. 32 files downloaded; **16 individually reviewed** and only those 16 are used on the site, so every alt text describes what is actually in the frame.
- **Facilities, as listed on the school's own homepage** (all quotable): spacious classrooms with smart/LCD projectors; mathematics, science and computer laboratories; library; sports with qualified coaches; play areas with international safety-certified equipment; CCTV surveillance; Vedpathshala; speech, drama, music, dance and eurhythmics.
- **Age criteria caution:** the school publishes the DOB window as "Min DOB" / "Max DOB", where *minimum* means the youngest child (the latest birth date) and *maximum* the oldest (the earliest). Read the wrong way round these produce an impossible range. Stored in `src/content/school.ts` as an explicit `earliest`/`latest` pair for this reason.

## Product Principles

1. **Verifiable over promotional.** This school has real numbers — 97.22%, Affiliation 1131024, 35 classrooms, an India Book of Records entry. Lead with evidence; never write a claim that cannot be traced to the school's own record.
2. **The parent is deciding under time pressure.** Every page must answer "is this right for my child, and what do I do next?" within one screen. The path to enquiry or Vidyalekha is never more than one tap away.
3. **Indian, not internationalist-generic.** Vedpathshala, Ek Mutthi Anaj, compulsory Marathi and the school's cultural life are the differentiator, not decoration to be minimised.
4. **Mobile data is the real network.** Ship for a mid-range Android on 4G in Pune; heavy hero video and uncompressed photography are failures of care.
5. **Built for a handover.** Content and UI stay separable so the planned admin panel is an integration, not a rebuild.

## Accessibility & Inclusion

WCAG 2.2 AA as the working floor: the audience includes grandparents and low-vision users, and the site must survive OS-level text scaling on Android. Full keyboard operability for the slider, gallery lightbox and forms. Respect `prefers-reduced-motion`. Never encode meaning in colour alone (fees, results, statuses).
