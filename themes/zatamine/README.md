# Zatamine Hugo Theme

A dark-only, high-performance Hugo theme for personal portfolios and technical engineering blogs. Built for speed, readability, and a distraction-free writing experience.

## Design System

- **Canvas:** Deep matte dark `#0d1117`
- **Cards:** Slate `#161b22` with hairline borders
- **Accents:** Emerald `#10b981` / Cyan `#06b6d4`
- **Fonts:** Inter (body) + JetBrains Mono (code)
- **Dark-only** — no light-mode toggle

## Features

- Responsive design (mobile nav collapse at ~768px)
- Hero section with terminal-style status widget (CSS-only pulse, no JS)
- Services matrix (2×2 grid from `data/services.yaml`)
- Recent posts grid (3 latest)
- Blog archive with client-side tag filtering
- Server-side taxonomy term pages for deep-linking/SEO
- Single post layout with sticky TOC, Chroma syntax highlighting (`base16-snazzy`), author bio, prev/next navigation
- Contact section with social links
- RSS feed link in footer
- SEO: meta, Open Graph, Twitter cards, canonical URLs
- Minified + fingerprinted assets in production
- Reduced-motion support

## Requirements

- Hugo **v0.116.0+** (extended)
- Tested with Hugo v0.165.0

## Installation

Clone or copy the theme into your site's `themes/` directory:

```bash
git clone <repo-url> themes/zatamine
```

Set in your site config:

```yaml
theme: 'zatamine'
```

## Configuration

See `hugo.toml` in this directory for a complete sample config. Key settings:

### Site Params

```yaml
params:
  description: 'Your tagline'
  author: 'Your Name'
  role: 'Your Role'
  email: 'you@example.com'
  availability: 'Available for new projects'
  social:
    - name: 'GitHub'
      url: 'https://github.com/you'
    - name: 'X'
      url: 'https://x.com/you'
    - name: 'LinkedIn'
      url: 'https://linkedin.com/in/you'
```

### Menus

```yaml
menus:
  main:
    - identifier: about
      name: About
      url: /about/
      weight: 100
    - identifier: services
      name: What I Do
      url: /#services
      weight: 200
    - identifier: posts
      name: Blog
      url: /posts/
      weight: 300
    - identifier: contact
      name: Contact
      url: /#contact
      weight: 400
```

### Data Files

The theme reads two YAML data files:

- **`data/status.yaml`** — Hero status widget (title, updated, line, metrics, stack)
- **`data/services.yaml`** — Services grid (icon, title, description, points)

### Taxonomies

```yaml
taxonomies:
  - tags
```

### Pagination

```yaml
pagination:
  pagerSize: 6
```

### Chroma Highlighting

```yaml
markup:
  highlight:
    noClasses: false
    style: 'base16-snazzy'
  tableOfContents:
    startLevel: 2
    endLevel: 3
```

## Front Matter Options

For posts:

- `title`: Post title
- `date`: Publication date
- `draft`: Whether the post is a draft
- `tags`: List of tags
- `description`: Meta description (falls back to summary)

## Customization

The theme uses CSS custom properties (variables) defined in `assets/css/main.css`. Override them by adding custom CSS to your site:

```css
:root {
  --color-accent: #f59e0b; /* Change accent color */
}
```

## Taskfile Commands

```bash
task serve    # Serve with Hugo server
task build    # Production build
task dev      # Dev mode with live reload
task clean    # Clean public directory
task test     # Validation checks
task deploy   # Build + list output
```

Install [Task](https://taskfile.dev/) to use these commands.

## License

MIT. See [LICENSE](LICENSE).
