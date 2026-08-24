# Implementation Plan — `zatamine` Hugo theme (2026-08-24)

**Approved scope**: the detailed spec in the user's request of 2026-08-24 (design system, section flow, file list). Proceeding directly per that explicit instruction.

## Approach
The repo is a working Hugo v0.165 site using the **config-directory layout** (`config/_default/hugo.yaml`, env overrides in `development/` + `production/`). Instead of adding a competing root `hugo.toml`, all requested config (theme, Chroma dark highlighting, tags taxonomy) lives in `config/_default/hugo.yaml` — single source of truth. The theme itself is rebuilt at `themes/zatamine/`.

## Design system
- Canvas `#0d1117`, cards `#161b22`, hairlines `rgba(255,255,255,.08)`, accents emerald `#10b981` / cyan `#06b6d4`.
- Inter (UI/body/headings), JetBrains Mono (code, tags, status pills). Google Fonts via one CSS2 request.
- Signature details: blinking terminal cursor on the wordmark; pulsing emerald availability dot in nav + hero status widget; monospace numbered service cards with inline SVG icons.

## Files — site root
| File | Action | Notes |
|---|---|---|
| `config/_default/hugo.yaml` | rewrite | theme, chroma (`noClasses: true`, dark style), tags-only taxonomy, menus (About / What I Do → `/#services` / Blog → `/posts/` / Contact → `/#contact`), params: author identity, email, socials |
| `config/development/hugo.yaml` | slim | env overrides only (`buildDrafts`, no minify) — inherits the rest |
| `data/services.yaml` | new | 4 services (Go backend, SRE, migrations, DevOps/IaC), icon SVG + tech chips |
| `data/status.yaml` | new | "All Systems Operational", uptime 99.999%, ping ~8ms, availability badge, stack badges |
| `content/posts/zero-downtime-migrations-guide.md` | new | flagship deep dive (spec title #1) |
| `content/posts/go-high-throughput-concurrency.md` | new | spec title #2 |
| `content/posts/sre-slos-incident-response.md` | new | spec title #3 |
| `content/about/index.md` | fix+rewrite | currently broken (duplicated front matter blocks); becomes the real About page for `/about/` |

Left untouched: `content/posts/test.md` (draft, hidden in prod — user content).

## Files — theme (`themes/zatamine/`)
| File | Action |
|---|---|
| `theme.toml` | refresh metadata (min Hugo 0.123+, features) |
| `layouts/_default/baseof.html` | HTML5 shell: skip link, nav partial, `main` block, footer partial |
| `layouts/index.html` | home = hero → services → recent posts → contact |
| `layouts/_default/list.html` | `/posts/` archive (chronological + tag filter chips + reading time); also renders `/tags/` and `/tags/<term>/` views via `.Kind` branching; pagination |
| `layouts/_default/single.html` | 720px `.prose` column, sticky TOC aside on desktop (`{{ .TableOfContents }}`), post meta (date · reading time · tags), author bio card footer; non-post pages (About) get a simpler prose layout without TOC/meta |
| `layouts/partials/head.html` | meta/description/canonical/RSS autodiscover, theme-color, fonts, fingerprinted CSS |
| `layouts/partials/nav.html` | sticky: wordmark + cursor blink, main menu, availability badge (dot pulse), mobile hamburger panel |
| `partials/hero.html` | 2-col grid — greeting left; live status widget right (pulsing dot, uptime/ping stats rows, stack chips) from `data/status.yaml` |
| `partials/services.html` | 2×2 card grid mapped from `data/services.yaml`, inline SVG icons + tech chips |
| `partials/recent-posts.html` | first 3 posts: date · reading time · tags; "Full Archive →" link to `/posts/` |
| `partials/contact.html` | email primary CTA (`mailto:`) + GitHub / X / LinkedIn links from params |
| `layouts/partials/footer.html` | RSS link, © year, systems-nominal status dot |
| `assets/css/main.css` | full design system: vars, reset, grid layouts, pulse animations, `.prose` article typography (Chroma-ready), responsive breakpoints |
| `assets/js/main.js` | mobile nav toggle only (~15 lines) |

Removed (superseded scaffold): `_default/home.html`, partials `header.html`/`menu.html`/`terms.html`/`head/css.html`/`head/js.html`, stale theme `public/` build output, playwright test scaffolding kept as-is but orphaned by the new markup (no CI depends on it in this repo — verify before deleting: **keep** `tests/` + `package.json` untouched to avoid scope creep).

## Validation
1. `hugo --minify` — zero errors/warnings target.
2. Spot-check rendered HTML for home, `/posts/`, a post (TOC + chroma), `/tags/go/`.
3. Optional: visual check via local server screenshot if browser tooling available.
