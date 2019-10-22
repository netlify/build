# Netlify sitemap plugin

Automatically generate a sitemap for your site.

## How to use

In your netlify config file add:

```yml
plugins:
  - type: '@netlify/plugin-sitemap'
```

## Configuration

Configure the plugin `distPath` (defaults to `build`)

```yml
plugins:
  - type: '@netlify/plugin-sitemap'
    config:
      distPath: build
```
