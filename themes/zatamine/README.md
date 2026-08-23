# Zatamine Hugo Theme

A clean, minimal Hugo theme designed for personal blogs and portfolios. It focuses on readability, performance, and a distraction-free writing experience.

## Features

- Responsive design
- Dark mode support (with system preference detection)
- Fast loading times
- Clean typography
- SEO friendly
- Easy customization
- Minimal dependencies
- Table of contents support
- Reading time estimation
- Share buttons
- Author information
- Previous/next post navigation

## Installation

1. Add the theme to your `config.toml`:
   ```toml
   theme = 'zatamine'
   ```

2. Or clone the theme into your `themes/zatamine` directory:
   ```bash
   git clone https://github.com/zatamine/zatamine-theme.git themes/zatamine
   ```

## Configuration

See the [example site](https://github.com/zatamine/zatamine-theme/tree/main/exampleSite) for a complete configuration example.

### Menu Configuration

You can customize the main menu in your `config.toml`:

```toml
[[menus.main]]
name = 'Home'
pageRef = '/'
weight = 10

[[menus.main]]
name = 'Posts'
pageRef = '/posts'
weight = 20

[[menus.main]]
name = 'Tags'
pageRef = '/tags'
weight = 30
```

### Dark Mode

Dark mode is enabled by default and can be toggled in the UI. It respects system preference and persists across sessions.

### Front Matter Options

In your content files, you can use these front matter options:

- `author`: Author name (for author info display)
- `author_image`: Path to author image
- `featured_image`: Path to featured image
- `description`: Page/post description
- `toc`: Set to true to enable table of contents
- `reading_time`: Set to false to disable reading time estimation

## Customization

The theme uses CSS variables for easy customization. You can override colors, fonts, and spacing by adding custom CSS to your site.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Taskfile Commands

This theme includes a Taskfile with convenient commands:

```bash
# Serve the site for development
(task serve)

# Build for production
(task build)

# Development mode with live reload
(task dev)

# Clean public directory
(task clean)

# Run validation checks
(task test)

# Run UI tests
(task test-ui)

# Deploy the site
(task deploy)
```

Install [Task](https://taskfile.dev/) to use these commands.

## License

This theme is licensed under the MIT License. See [LICENSE](LICENSE) for more information.
