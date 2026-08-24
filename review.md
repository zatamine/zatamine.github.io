# Codebase Review — zatamine.com

**Date:** 2026-08-23
**Scope:** Full repository review of the Hugo site (root) and the custom `zatamine` theme (`themes/zatamine`).
**Branch reviewed:** `create-them` (9 commits ahead of `origin/create-them`, working tree clean). Production (`master`) is still the old PaperMod build.
**Validation performed:** local build with Hugo v0.165.0 extended (`hugo --minify --gc`) — succeeds with deprecation warnings; rendered HTML in `public/` inspected for each claimed bug; live site (`blog.zatamine.com`) fetched for comparison.

---

## 1. Overview

The repo hosts a personal blog built with Hugo. It contains:

| Area | State |
|---|---|
| `config/` | Three-tier config (`_default`, `development`, `production`) |
| `content/` | 1 about page (no front matter), 1 sample post, 1 draft test post |
| `themes/zatamine` | Custom minimal theme: layouts, CSS/JS assets, Playwright config, string-match "tests", demo content |
| `themes/PaperMod` | Registered submodule, **not checked out, not used** by current config |
| `.github/workflows/static.yml` | GitHub Pages deploy on `master` (official template, Hugo 0.121.2) |
| `tasks.md`, `tmp/` | AI-agent working documents committed/left in the repo |

**Highlights (what's good):**

- Clean theme architecture: small, focused partials; `menu.html` and `terms.html` follow Hugo's documented partial conventions with doc comments.
- Dark mode is well implemented: `data-theme` attribute + `prefers-color-scheme` fallback, persisted in `localStorage`, correct icon swapping (CSS + JS agree).
- SRI (`integrity` + `crossorigin`) on fingerprinted CSS/JS in production, raw assets in development — solid asset pipeline.
- Pagination, TOC, share buttons, reading time, author info, prev/next nav all present in layouts.
- Accessibility basics in place: `aria-label` on toggles, `aria-expanded` maintained by JS, semantic `header`/`main`/`footer`, `role="navigation"`.
- Build passes cleanly; sitemap, robots.txt, and RSS feed (`index.xml`) are generated.
- The Pages workflow uses the official template with correct `permissions` and `concurrency`.

---

## 2. Findings

Severity: 🔴 high (ships broken / wrong output) · 🟡 medium (correctness or maintainability risk) · ⚪ low (hygiene / nits)

### 🔴 High

#### H1. Malformed HTML on every post page
`themes/zatamine/layouts/_default/single.html` line 8:

```html
<span></span>by {{ .Params.author }}</span>
```

Stray empty `<span>` before `by` and a duplicated closing tag. Verified in built output (`public/posts/sample-post/index.html`): `<span></span>by Zatamine</span>`.
**Fix:** `<span>by {{ .Params.author }}</span>`

#### H2. Theme demo content leaks into the site build
`themes/zatamine/content/` (3 lorem-ipsum posts + demo `_index.md`) is merged into the site build by modern Hugo. Verified: built `public/posts/` contains `post-1`, `post-2`, `post-3`; the home page lists all four posts. Renaming the theme's `content/` dir removes them from the build.

This is version-dependent (CI pins Hugo 0.121.2, local is 0.165 — see H7), so the output will differ between local and CI.
**Fix:** remove `themes/zatamine/content/` from the repo (host demo content in a separate demo site/repo, or a `content/` that is git-ignored and only created for local demoing).

#### H3. Footer links to non-existent pages
`themes/zatamine/layouts/partials/footer.html` hardcodes `/contact` and `/privacy`; neither page exists. Verified in build — both 404.
**Fix:** create the pages, drive the links from a menu, or remove them.

#### H4. Share button URLs are not escaped
`themes/zatamine/layouts/_default/single.html` lines 40–42 interpolate `{{ .Title }}` and `{{ .Permalink }}` raw into query strings and `href` attributes. A title containing `&`, `"`, or `<` corrupts the attribute or the query parameters.
**Fix:** build the URLs with `urlquery`, e.g.
`"https://www.linkedin.com/shareArticle?mini=true&url=" (printf "%s&title=%s" .Permalink .Title | urlquery)` or use `| urlencode` per segment and `safeHTMLAttr`.

#### H5. Dead / placeholder Google Analytics
- `config/production/hugo.yaml`: `googleAnalytics: UA-1707302-9` — a **Universal Analytics** property, retired 2023-07-01. The live site still loads `analytics.js` for it; it collects nothing.
- `config/_default/hugo.yaml`: `googleAnalytics: "UA-12345678-1"` — obvious placeholder.
**Fix:** switch to a GA4 `G-XXXX` measurement ID or delete the key until tracking is needed.

#### H6. About page has no front matter
`content/about/index.md` is body-only. Verified in build: `<title> | zatamine's blog</title>` and an empty `<h1></h1>`.
**Fix:** add front matter, at minimum `title: About` (and `description` for SEO).

#### H7. Hugo version skew between CI and local
CI pins `HUGO_VERSION: 0.121.2`; local is 0.165. Consequences already observed:
- Deprecation warnings on 0.165 for `languageCode` (config key), `.Language.LanguageCode`, `.Language.LanguageDirection` (used in `baseof.html`) — all deprecated in 0.158, scheduled for removal.
- Behavioral differences (theme content merging, H2) mean local and CI can produce **different sites** from the same commit.
**Fix:** bump the workflow to a current Hugo version (and re-verify), or pin the local toolchain; either way keep them identical.

### 🟡 Medium

#### M1. `pagenate` is a typo — pagination setting is ignored
`config/_default/hugo.yaml` and `config/development/hugo.yaml` use `pagenate: '5'`. Hugo expects `paginate: 5` (integer). The key is silently ignored; default of 10 applies.

#### M2. Placeholder social-share image shipped to production
`themes/zatamine/layouts/partials/head.html` falls back to `https://example.com/image.jpg` for `og:image` / `twitter:image` (verified in built HTML). Set `params.image` to a real asset or remove the fallback.

#### M3. RSS feed is generated but not advertised
`index.xml` is built, but `head.html` has no `<link rel="alternate" type="application/rss+xml" href="{{ with .Site.GetPage "/index.xml" }}{{ .RelPermalink }}{{ end }}">`. (The committed `tasks.md` marks this as done — it isn't.)

#### M4. Inconsistent site identity
Root `title: zatamine's blog` vs `params.title: Amine's blog` vs `params.subtitle: zatamine's blog` vs `params.author: Me` (the string "Me" ends up in meta tags). Pick one source of truth and remove the rest.

#### M5. Mobile dropdown menu is mis-anchored
`main.css`: `.main-nav ul { position: absolute; top: 100%; ... }` but no ancestor is `position: relative` (`.header` isn't). The dropdown anchors to the initial containing block — on mobile it drops to the bottom of the viewport instead of below the header.
**Fix:** add `position: relative` to `.header` (or the nav wrapper).

#### M6. Un-guarded mobile-menu outside-click handler
`themes/zatamine/assets/js/main.js` (lines 66–71): the `document` click handler references `menuToggle` and `navList` unconditionally. `menu.html` skips rendering the nav entirely when the `main` menu is empty, so any future empty-menu config throws `TypeError: Cannot read properties of null (reading 'contains')` on every click. Wrap the handler registration in the same null guard.

#### M7. Test infrastructure is broken or vacuous
- `themes/zatamine/playwright.config.js` uses `devices` without importing it → `ReferenceError` if the config is ever loaded; `@playwright/test` is not in `package.json`; there are no Playwright specs at all.
- The "tests" are static string-match scripts, not behavioral tests:
  - `tests/ui.test.js` counts a *missing* component as a **pass** (line 44: `passed++` in the "not found" branch).
  - `tests/manual-dark-mode.test.js` prints ❌ when its check fails but returns `true` and exits 0; its "runtime" check looks for `'.sun-icon { opacity: 1 }'`, which doesn't match the actual multi-line CSS, so it always prints ❌ — yet still passes.
- `themes/zatamine/Taskfile.yml` `test-ui` runs `node ui-test.js`, `node test-css-variables.js`, `node dark-mode-test.js` — **none of these files exist** (real tests are in `tests/`).
- `TESTING.md` documents `npm run test:integration`, which doesn't exist in `package.json`.
- `package.json` `main` points to non-existent `ui-test.js`.

Net effect: `npm test` always goes green regardless of the code. Either wire up real Playwright tests (serve `hugo server`, assert dark-mode toggle, menu, pagination) or delete the theater.

#### M8. Stale generated cache committed to git
`resources/_gen/assets/css/ananke/...` (cache from a different theme, "ananke") is tracked. Remove from git (`git rm -r --cached resources/_gen`) and ignore it.

#### M9. Dead PaperMod submodule
`.gitmodules` still registers `themes/PaperMod` (empty, not checked out, not referenced by any config). The workflow even does `submodules: recursive` and fetches it on every run. `tasks.md` marks its removal as done — it isn't. Remove the submodule (`git submodule deinit` + remove from `.gitmodules`) once you're sure master's PaperMod deploy is superseded.

### ⚪ Low

#### L1. `.gitignore` is minimal
Only ignores `.hugo_build.lock` and `public/`. Add: `resources/_gen/`, `tmp/`, `node_modules/`, `themes/zatamine/test-results/`, `themes/zatamine/test-report/`, `.DS_Store`.

#### L2. Committed working documents are stale
- `tasks.md` (root): AI task list with wrong checkmarks — "Add RSS feed link" ✅ (missing, M3), "Clean up themes/PaperMod" ✅ (not done, M9), while implemented features (pagination, TOC, share buttons, mobile menu) are unchecked. Update it or move it out of the repo.
- `tmp/` (untracked): `plan.md`, `REVIEW.md`, `review-theme.md`, `BUILD_OK` — scratch files from a previous agent session; ignore or delete.
- `README.md` is a single stale line (`# zatamine.github.io`); the site lives at `blog.zatamine.com`.

#### L3. `theme.toml` metadata issues
- `demosite = 'https://zatamine.com'` — wrong host (should be `blog.zatamine.com` or the actual demo).
- Both `authors` and `[author]` are declared (redundant).
- `[original]` is meant for ports of existing themes; this theme is original.
- `homepage`/`licenselink` point to `github.com/zatamine/zatamine-theme`, but the theme is vendored in this repo, not a submodule — the metadata over-promises.

#### L4. Demo content in the site itself
`content/posts/sample-post.md` is theme-demo content: it references non-existent images (`/images/author.jpg`, `/images/sample.jpg` → broken images when published) and sets a non-standard `reading_time: true` key (reading time is always computed). Delete it or replace with a real first post. `content/posts/test.md` is a draft with a typo (`code rundering`) and invalid Go (`fun main()`).

#### L5. Workflow: unnecessary Dart Sass step
`sudo snap install dart-sass` runs on every deploy, but the theme uses plain CSS (no SCSS). Remove it (snap installs are also flaky/slow on runners).

#### L6. CSS inconsistencies
- `.post-meta` hardcodes `#666`/`#aaa` instead of theme variables.
- `--link-color` is used only by TOC links; default `<a>` elements fall back to browser-default blue, contradicting the variable. `--link-hover-color` and `--spacing-lg` are unused (the CSS-variable test *requires* `--spacing-lg` to exist, so it can't be removed without updating the test).
- `og:type` is `website` on article pages too (should be `article` on posts).
- `rel="noopener noreferrer"` — `noreferrer` is a non-standard token, ignored by modern browsers; use `rel="noopener"`.

#### L7. No 404 page
No `layouts/404.html` or `content/404.md`; the build emits no `404.html` (GitHub Pages will serve its own generic one).

#### L8. Deprecated Hugo APIs (tied to H7)
`languageCode` config key, `.Language.LanguageCode`, `.Language.LanguageDirection` — migrate to `locale` / `.Language.Locale` / `.Language.Direction` once the minimum Hugo version is bumped past 0.158.

---

## 3. Deployment context (verified)

- Production (`blog.zatamine.com`, deployed from `master`) still serves the **PaperMod** build with the dead GA ID; it currently has no published posts.
- All custom-theme work lives on unpushed local branches (`create-them`, plus `fix-issues`, `workflow`). Nothing in this review is live yet.
- The workflow only triggers on `master`, which matches the default branch — that part is fine.

---

## 4. Suggested fix order

| # | Action | Effort |
|---|---|---|
| 1 | H1 — fix the malformed `<span>` in `single.html` | 1 line |
| 2 | H6 — add front matter to `content/about/index.md` | 3 lines |
| 3 | H2 — remove `themes/zatamine/content/` demo content | delete dir |
| 4 | H3 — fix footer links (create or remove `/contact`, `/privacy`) | small |
| 5 | H4 — escape share URLs | small |
| 6 | H5 + M4 — fix GA ID, unify titles/author | config edits |
| 7 | M1 — `pagenate` → `paginate` | 1 line ×2 |
| 8 | M5 + M6 — mobile menu CSS anchor + JS null guard | small |
| 9 | H7 — align CI/local Hugo versions, re-verify build | medium |
| 10 | M7 — replace vacuous tests with real Playwright tests (or delete) | medium |
| 11 | Housekeeping: M8, M9, L1, L2, L3, L5 | small |

---

## 5. Validation log

| Check | Command / method | Result |
|---|---|---|
| Build (production flags) | `hugo --minify --gc` (v0.165.0 extended) | ✅ succeeds; 3 deprecation warnings (L8) |
| H1 malformed span | `grep` on `public/posts/sample-post/index.html` | ❌ confirmed |
| H2 theme content leak | rebuild after `mv themes/zatamine/content` | ✅ posts disappear without it |
| H3 dead footer links | `ls public/` | ❌ no `contact/`, `privacy/` |
| M2 placeholder og:image | `grep og:image public/index.html` | ❌ `example.com` confirmed |
| H6 empty about title | `grep` on `public/about/index.html` | ❌ `<title> \| zatamine's blog</title>`, `<h1></h1>` |
| Live site | fetch `https://blog.zatamine.com/` + `/posts/` | PaperMod, GA `UA-1707302-9`, `/posts/` 404 |
