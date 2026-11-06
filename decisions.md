# Resume site — decisions

Owner decisions override the designer's spec.

| # | Decision | Status | Note |
|---|---|---|---|
| 1 | Visual direction: minimal editorial | Approved | Owner chose it from the offered directions |
| 2 | Content: real resume from `Profile.pdf` | Approved | LinkedIn export, November 2026 |
| 3 | Stack: static HTML + Tailwind CSS | Approved | Tailwind v4 CLI, compiled at build time |
| 4 | Packaging: Docker, published as a local image only | Approved | No registry push; `resume-site:dev` on port 8811 |
| 5 | Fonts self-hosted instead of Google Fonts CDN | Designer call | No third-party requests at runtime |
| 6 | Phone number omitted from the public page | Designer call | Spam risk; email and LinkedIn are enough. Reversible |
| 7 | No invented metrics or project outcomes | Designer call | Copy stays faithful to the resume |
| 8 | LinkedIn link `linkedin.com/in/mohamed-elsiddig` | Confirmed | URL supplied by owner on 2026-11-05 |
| 9 | Dark mode | Open | Light only in v1 |
| 10 | Portrait treatment | Open | Labelled placeholder in v1 |
| 11 | Accent colour | Open | Rust `#9A3B26` in v1 |
| 12 | Add a Projects section (02) between Selected work and Experience | Approved | Six projects from the owner's LinkedIn cards; all section numbers shift by one |
| 13 | Project links: rnf.sa, Terraform repo, Grubfix repo | Confirmed | URLs supplied by owner 2026-11-05; same-tab links like the rest of the page |
| 14 | Header wraps below ~500px now that Projects joins the nav | Designer call | Wordmark on line 1, nav on line 2 on small screens (Credentials still hidden below `sm`); single row from `sm` up |
| 15 | Publish on GitHub Pages as a user site, `MohamedElsiddig.github.io` repo | Confirmed | Workflow builds `dist/` in CI and deploys the artifact; `dist/` stays out of git |
| 16 | Custom domain `mohamedelsiddig.com` for the resume | Confirmed | The Hashnode blog moves to `blog.mohamedelsiddig.com`; apex and `www` point at GitHub Pages |
| 17 | Email removed from the public page | Confirmed | Owner request 2026-11-05; LinkedIn is the only direct contact route |
| 18 | CKA listed as a Udemy course, not a certification | Confirmed | Owner correction 2026-11-05; the label now reads "Udemy course" |
| 19 | Experience keeps every duty from the CV export | Confirmed | Owner request 2026-11-06; 29 bullets across 5 roles plus the ZainBlue project |
| 20 | Experience counted as the sum of dated stints, not the calendar span | Confirmed | Owner's rule 2026-11-06; inclusive months = 90 (7 y 6 m) at Nov 2026 |
| 21 | Two traineeships and the national-service year are labelled | Confirmed | Company line carries ` · Trainee` / ` · National Service`; CV titles unchanged |
| 22 | Hero figure derived at build time | Confirmed | `scripts/experience-years.mjs` + monthly scheduled Pages run; no client JS |
| 23 | ZainBlue Cloud is a project inside Syber Group, not an employer | Confirmed | Owner correction 2026-11-06; Syber now reads Dec 2020 — Sep 2024 with the project (Dec 2020 — Mar 2021) nested underneath |
