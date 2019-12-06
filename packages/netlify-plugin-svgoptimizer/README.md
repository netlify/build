# Netlify Plugin SVG Optimizer

This build plugin with take in a directory of SVG assets, and optimize them.

## Usage

In the plugins, src, directory, add the path that the assets are in (last line in the yml below)

`netlify.yml`

```yml
build:
  publish: build
  lifecycle:
    onInit:
      - echo "Starting the build"
    onBuild:
      - npm run build
    onEnd: echo "Ending the build"

plugins:
  - type: '@netlify/plugin-svgoptimizer'
    config:
      directory: /src/assets/
```

## Configuration

- `directory` - where our svg assets are located. please note: this will overwrite the files in this directory
- `svgoSettings` - Custom SVGO setting overrides
