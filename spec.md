# Resume site — spec

## Goal

A one-page resume/portfolio site for Mohamed M. Ahmed, a senior system and cloud engineer in
Abu Dhabi. The page should read like an editorial profile, not a template: strong typography,
generous whitespace, and content a recruiter can scan in under a minute.

## Audience

Hiring managers, platform leads and recruiters in the UAE and remotely. Traffic arrives from a
CV link, LinkedIn, or the Hashnode blog.

## Direction

Minimal editorial (owner-selected). Warm paper background, near-black ink, one rust accent,
serif display type, sans body, mono metadata. No cards with shadows, no gradients, no stock
photography. The portrait is a labelled placeholder until a real photo is supplied.

## Sections

1. Header — name mark, section nav.
2. Hero — role, location, positioning line, primary CTA (selected work), CV download.
3. Tool strip — core stack in mono.
4. Selected work — three focus areas: multi-cloud estate, Kubernetes migration, backup and DR.
5. Projects — six builds in a two-column hairline grid (Reef Website, Berber Cement migration,
   Terraform AWS demo, EasyFollow/Wasla, Grubfix, Neos), each with kind/date, description, stack
   line and a link where one is public.
6. Experience — six roles (including the 2017 SPPC stint) with company, dates, location and one
   line per duty from the CV; duplicates merged, nothing invented.
7. Skills — cloud platforms, automation and delivery, systems and security.
8. Credentials — certifications and education.
9. Contact — email, LinkedIn, blog, availability.
10. Footer — copyright and back to top.

## Content rules

- Sourced from `~/Downloads/Documents/Profile.pdf` (LinkedIn export, November 2026).
- Experience keeps the day-to-day duties from that export: one line per duty, duplicates merged.
  Condensing was reverted on the owner's request (2026-11-06) — do not trim them back to 2–3
  bullets per role without asking.
- Short stints carry their context on the company line (` · Trainee`, ` · National Service`);
  the job titles stay as the CV has them.
- The hero's experience figure is **computed at build time** from the dates in the Experience
  section (`scripts/experience-years.mjs`, inclusive months, rounded down to whole years). Never
  hard-code it; a monthly Pages run refreshes it.
- Projects section sourced from the owner's LinkedIn project cards (screenshots, 2026-11-05);
  only the URLs the owner supplied are linked — rnf.sa, github.com/MohamedElsiddig/Terraform,
  github.com/MohamedElsiddig/grubfix. Dates appear only where the source gives them.
- No invented metrics or outcomes; bullets are condensed from the resume text.
- Phone number and email are intentionally left off the public page; LinkedIn and the blog are the
  contact routes.
- Portrait stays a labelled placeholder until a real photo is provided.

## Design tokens

| Token | Value |
|---|---|
| Paper | `#F5F2EB` |
| Surface | `#FCFAF6` |
| Ink | `#191713` |
| Muted | `#6B6459` |
| Line | `#D9D2C4` |
| Rust (accent) | `#9A3B26` |

Typography: Newsreader (display), Inter (body), JetBrains Mono (labels, dates, nav). All fonts
self-hosted as woff2, latin subset.

## Behaviour

- Single column below `md`, two-column hero above it.
- Responsive checks at 375, 768, 1024 and 1440.
- Hover states on links, project rows and CTAs; visible `:focus-visible` ring.
- `prefers-reduced-motion` disables smooth scrolling and transitions.
- No JavaScript required.

## Accessibility

- Semantic landmarks, skip link, one `h1`.
- Body text contrast at least 4.5:1; muted text verified against paper.
- Icons are inline SVG; decorative icons are `aria-hidden`.
- Project rows are full-row links with visible hover and focus states.

## Build and packaging

- Source: `src/index.html` + `src/input.css` with Tailwind CSS v4.
- Static output: `dist/` (HTML, compiled CSS, fonts, CV PDF, `CNAME`).
- Docker: multi-stage build (Node + Tailwind CLI, then nginx serving `dist/`) — local preview on port 8811.
- Publish target: GitHub Pages, repo `MohamedElsiddig.github.io`, built and deployed by
  `.github/workflows/pages.yml` on every push to `main`. `dist/` is git-ignored.
- Production domain: `https://mohamedelsiddig.com/` (apex on GitHub Pages, `www` redirects to it).
  The Hashnode blog that used the apex lives at `https://blog.mohamedelsiddig.com/`.

## Open questions

1. Real portrait photo?
2. Keep the rust accent or pick another single accent?
3. Add dark mode, or light only?
4. Include the phone number on the public page, or keep it email-only?
