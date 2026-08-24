# Implementation Plan: `zatamine` Hugo Theme

This plan outlines the step-by-step process to architect and implement the `zatamine` Hugo theme for Amine's portfolio and blog.

## Phase 1: Foundation & Configuration
1. **Initialize Directory Structure**: Create all necessary directories within `themes/zatamine/`.
2. **Project Configuration**:
   - Write `hugo.toml` in the project root.
   - Write `themes/zatamine/theme.toml`.
3. **Data Layer**:
   - Create `themes/zatamine/data/services.yaml` for core service matrix.
   - Create `themes/zatamine/data/status.yaml` for system status and tech stack badges.

## Phase 2: Styling & Assets
1. **CSS Architecture**:
   - Write `themes/zatamine/assets/css/main.css` using modern CSS (variables, grid, flexbox).
   - Implement the dark matte aesthetic with emerald/cyan accents.
   - Add typography settings for 'Inter' and 'JetBrains Mono'.

## Phase 3: Core Layouts & Partial Templates
1. **Base Structure**:
   - Create `themes/zatamine/layouts/_default/baseof.html` as the master template.
2. **Partial Components**:
   - `nav.html`: Navigation and availability badge.
   - `hero.html`: Greeting, subtext, and status widget.
   - `services.html`: Service matrix from data.
   - `recent-posts.html`: Blog preview section.
   - `contact.html`: Contact card with social links.
   - `footer.html`: Minimalist footer.
3. **Page Templates**:
   - `layouts/index.html`: Homepage assembling all partials.
   - `layouts/_default/list.html`: Chronological blog archive.
   - `layouts/_default/single.html`: Focused reading view for posts with TOC and prose styling.

## Phase 4: Content & Validation
1. **Sample Content**:
   - Create `content/posts/zero-downtime-migrations-guide.md` to verify single post rendering.
2. **Final Review**: Verify all links, styles, and data bindings are working as intended.

## Design Decisions
- **Aesthetic**: Minimalist dark mode inspired by high-end engineering blogs (Paco Coursey). High contrast for readability but low eye strain.
- **Performance**: Zero JavaScript dependency for core functionality; CSS-only status pulses and animations where possible.
- **Typography**: Emphasis on 'JetBrains Mono' for all technical/metadata elements to reinforce the SRE identity.
