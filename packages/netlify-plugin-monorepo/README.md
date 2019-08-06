# Netlify monorepo support

A netlify plugin that determines if a sub folder should build or exit early.

## Usage

If you only want to publish your site when certain source files change set `files` option.

Example: Only build my site is files in `src` directory have changed `src/**`

```yml
plugins:
  - netlify-plugin-monorepo:
      enabled: true
      # files to check for changes
      files:
        - "src/**.html"
```
