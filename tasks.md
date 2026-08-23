# Zatamine Theme - AI Agent Tasks

## Phase 1: Metadata & Configuration

- [x] **Update `theme.toml`**
  - Set `name = 'zatamine'`
  - Update `description` with a meaningful theme description
  - Update `homepage`, `demosite`, `tags`, `features`
  - Set correct `author` details (name, homepage)
  - Update `license` and `licenselink` if needed

- [x] **Update `README.md`**
  - Replace placeholder content with real theme documentation
  - Add theme name, description, screenshots (placeholder links)
  - Document features, installation steps, and configuration options

- [x] **Update `hugo.toml` (theme config)**
  - Update `title` to reflect the zatamine theme
  - Update `baseURL` to a placeholder or remove it (let site config handle this)
  - Review menu entries and adjust if needed
  - Document this file as example/default config in a comment

- [x] **Clean up `themes/PaperMod`**
  - Delete the empty `PaperMod` directory (or confirm if it's needed)

---

## Phase 2: Design & Styling

- [x] **Expand `assets/css/main.css`**
  - Add CSS custom properties (variables) for colors, fonts, spacing
  - Define a typography system (headings, body, code)
  - Style navigation/menu with hover states
  - Style tags/terms with visual distinction
  - Add responsive design breakpoints
  - Add dark mode support (CSS media query or class-based)

- [ ] **Consider migrating to Sass/SCSS**
  - Rename `main.css` to `main.scss` if Hugo extended is available
  - Organize CSS into partials (`_variables.scss`, `_typography.scss`, `_components.scss`, etc.)
  - Update `head/css.html` to use `resources.ToCSS` if switching to SCSS

- [x] **Add `assets/js/main.js` functionality**
  - Implement dark mode toggle (if added)
  - Add mobile menu toggle (if responsive nav is added)
  - Remove placeholder `console.log`

---

## Phase 3: Layouts & Features

- [x] **Enhance `partials/head.html`**
  - Add meta description
  - Add Open Graph tags (og:title, og:description, og:image, og:url)
  - Add Twitter Card meta tags
  - Add canonical URL
  - Add RSS feed link

- [x] **Enhance `single.html`**
  - Add author info / bio
  - Add reading time estimate
  - Add last modified date
  - Add "share" buttons or links
  - Add table of contents (if desired)
  - Add previous/next post navigation

- [x] **Enhance `list.html` and `home.html`**
  - Add pagination support
  - Add featured images to post previews
  - Add post metadata (date, reading time) to summaries

- [x] **Enhance `header.html`**
  - Add logo support
  - Make navigation responsive (hamburger menu for mobile)

- [x] **Enhance `footer.html`**
  - Add links (About, Contact, Social, etc.)
  - Add "powered by Hugo" credit
  - Make copyright year dynamic (already done)

---

## Phase 4: Content & Archetypes

- [x] **Update `archetypes/default.md`**
  - Add front matter template (title, date, draft, tags, categories, featured image, description)
  - Consider creating specific archetypes for posts, pages, etc.

- [x] **Review theme `content/` directory**
  - Decide if demo content (`_index.md`, `posts/`) should be kept or removed
  - If kept, ensure it serves as useful example content for the theme

---

## Phase 5: Testing & Validation

- [ ] **Test theme with Hugo**
  - Run `hugo` to ensure site builds without errors
  - Test in development mode (`hugo server`)
  - Test production build (`hugo --minify`)

- [ ] **Test across browsers**
  - Verify rendering in Chrome, Firefox, Safari
  - Test responsive breakpoints

- [ ] **Test dark mode** (if implemented)
  - Verify toggle works
  - Verify all elements are styled correctly in both modes

---

## Phase 6: Implementation Tasks for AI Agent

### CSS Fixes
- [ ] Fix syntax error in `read-more` class (extra semicolon)
- [ ] Implement responsive mobile menu styles
- [ ] Add missing hover states for navigation items
- [ ] Complete styling of all components

### JavaScript Enhancements
- [ ] Add mobile menu toggle functionality
- [ ] Improve dark mode UX
- [ ] Ensure consistent theme persistence across sessions

### Layout Improvements
- [ ] Implement pagination support in list/home layouts
- [ ] Add table of contents feature to single posts
- [ ] Enhance semantic HTML structure

### Feature Implementation
- [ ] Add reading time estimation
- [ ] Implement share buttons
- [ ] Improve author info display

### Testing & Validation
- [ ] Test responsive design across breakpoints (mobile, tablet, desktop)
- [ ] Verify dark mode functionality works properly in all browsers
- [ ] Validate all JavaScript functionality without errors
- [ ] Check accessibility features (ARIA attributes, semantic HTML)

## Notes for AI Agent
- Keep changes consistent with Hugo best practices
- Prefer using Hugo's built-in features over custom JS where possible
- Use `partialCached` for partials that don't change per page
- Document any new configuration options in `README.md`
- Keep CSS minimal and performant
- Ensure accessibility (semantic HTML, ARIA attributes, keyboard navigation)