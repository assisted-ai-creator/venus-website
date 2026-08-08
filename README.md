# Venus World Schools

The school's website and its admin panel. Next.js on Cloudflare, rendering
from a CMS that the school edits at `/admin`.

The API behind the panel is a separate repo, **venus-admin-panel** — Hono on
Cloudflare Workers, with D1, R2 and KV.

---

## What the panel can do

- **Every page, every block.** A page is an ordered list of typed sections.
  Drag one up, switch it off, change its background, put it in the left or
  right column, or move it to a different page. Adding a page in the panel
  creates a real URL with no deployment.
- **Photographs and albums.** Upload once into a shared library, then use the
  same photograph in an album, on a page, or inside a post. Alt text is a
  first-class field, and the panel flags files that lack it.
- **A blog.** Headings, sub-headings, bold, italics, underline, strike, lists,
  quotations, alignment, links, rules, photographs from the library and
  YouTube films — placed anywhere in the article.
- **The school's details in one place.** Address, telephone numbers, office
  hours, CBSE figures, admission dates. Correcting a number corrects it in the
  header, the footer, the contact page and the structured data at once.
- **Who may reach `/admin`.** An IP allowlist, off by default, with CIDR and
  wildcard support for IPv4 and IPv6.
- **Enquiries.** Everything the website's forms collect, with a CSV export.

Saving anywhere is live immediately. There is no publish step and no rebuild.

---

## How it works

```
  src/app/(site)/[[...slug]]      every CMS page — home, about, academics, …
  src/app/(site)/gallery/[slug]   album pages
  src/app/(site)/blog/[slug]      blog posts
  src/app/admin/(panel)/…         the panel
  src/app/api/admin/[...path]     proxy to the API, holds the session cookie
  src/middleware.ts               the IP gate on /admin
```

Pages call `getSite()`, which fetches the published snapshot from the API with
`cache: "no-store"`. The API answers from a single KV read, so this is one fast
edge round-trip and the content is never stale.

**The session never touches JavaScript.** The panel talks only to
`/api/admin/*` on this origin; that route handler holds the session as a
first-party `HttpOnly` cookie and forwards it to the API as a bearer token. No
cross-site cookies, no CORS, and XSS cannot steal the session.

**If the API is unreachable, the site still renders.** `src/content/seed.ts`
holds the site as it stands in this repo, and `getSite()` falls back to it. A
CMS outage degrades to the last shipped copy rather than to an error page.

---

## Section types

Each declares its own editing form in `src/lib/sections/registry.ts`, and its
renderer lives under `src/components/sections/`. Adding a field is one line in
the registry; adding a section type is one entry plus one component.

| Group | Types |
| --- | --- |
| Openers | `hero`, `ctaBand` |
| Text | `prose`, `richText`, `testimonials`, `visionMission`, `signature`, `sectionRule` |
| Data | `statPlate`, `factTable`, `dataTable`, `feesPanel` |
| Lists | `numberedList`, `steps`, `cardGrid`, `facilityKey`, `programmeStages`, `newsPanel`, `profileCards`, `blogList` |
| Media | `calloutKey`, `galleryGrid`, `photoStrip`, `imagePlate`, `videoPanel` |
| Contact | `contactPanel`, `phonePanel`, `mapPanel`, `enquiryPanel` |

Sections marked `left` or `right` pair up into the two-column bands the About,
Admissions and Contact pages use. A run of blocks sharing a background becomes
one printed band.

---

## Setting it up

### 1. Deploy the API first

Follow the README in **venus-admin-panel**. You need its URL and the value you
set for `SITE_API_KEY`.

### 2. Configure this repo

In `wrangler.jsonc`, set:

- `vars.CMS_API_URL` — the API worker's address
- `d1_databases[0].database_id` — the same `venus-cms` database the API uses

Then set the secrets:

```bash
npx wrangler secret put CMS_SITE_KEY      # must match SITE_API_KEY on the API
npx wrangler secret put RESEND_API_KEY    # for enquiry notification emails
npx wrangler secret put ENQUIRY_TO
npx wrangler secret put ENQUIRY_FROM
```

### 3. Deploy

```bash
npm install
npm run cf:deploy
```

### 4. Seed the CMS with this site

```bash
cp .env.example .env.local     # fill in CMS_API_URL and CMS_BOOTSTRAP_TOKEN
npm run cms:seed
```

That writes 15 pages, 52 sections, 5 albums, the 16 reviewed photographs and
the school's details — so the panel opens on the site exactly as it stands,
not on a blank page.

`npm run cms:seed` only fills gaps and is safe to re-run. Use
`npm run cms:seed -- --replace` to wipe content and start over.

### 5. Create the first administrator

Open `/admin` and choose "Set up the first administrator". That option is only
available while no account exists.

---

## Local development

Two terminals:

```bash
# venus-admin-panel
cp .dev.vars.example .dev.vars
npm run db:migrate:local
npm run dev                    # http://127.0.0.1:8787
```

```bash
# venus-website
cp .env.example .env.local
npm run dev                    # http://localhost:3000
npm run cms:seed               # once
```

Then `/admin` on the website. `wrangler dev` simulates D1, R2 and KV locally,
so no Cloudflare resources are needed to work on it.

---

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Next dev server |
| `npm run build` | Production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run cms:seed` | Push this repo's content into the CMS |
| `npm run cf:preview` | Build for Workers and run it locally |
| `npm run cf:deploy` | Build and deploy to Cloudflare |

---

## Design

The site is set as an offset-printed Indian classroom wall chart: Oxford/
federal blue under a blueprint grid, chart-stock plates with 2px ink keylines,
saffron `#FFAB1F` as the callout and action ink, numbered callouts on drawn
leader lines, bilingual Devanagari and Latin labels. `PRODUCT.md` records the
evidence every figure on the site traces back to, and the rules about what may
not be invented — the panel enforces some of them, notably that an empty
testimonial renders as a reserved slot rather than as fabricated copy.

The panel is set in the same chart, so the school recognises it as part of its
own site rather than as borrowed software.

---

## Known limitations

- `npm audit` reports advisories in `postcss` and `sharp` reached through
  Next 15.5's own dependency tree. Both are build-time only; clearing them
  needs a Next 16 major upgrade, which is not part of this change.
- Video uploads are capped at 90 MB — beyond that, publish on the school's
  YouTube channel and embed, which is also far cheaper to serve.
- The panel has no draft preview for page sections: switching a section off
  hides it from the site, and there is no separate staging copy.
