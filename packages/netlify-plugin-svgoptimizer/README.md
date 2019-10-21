# Netlify Plugin SVG Optimizer

This build plugin with take in a directory of SVG assets, and optimize them.

## Usage

In the plugins, src, directory, add the path that the assets are in (last line in the yml below)

`netlify.yml`

```yml
build:
  publish: build
  lifecycle:
    init:
      - echo "Starting the build"
    build:
      - npm run build
    finally: echo "Ending the build"

plugins:
  # Local plugin
  - id: svgoptimizer
    type: ./plugins/netlify-plugin-svg-optimizer
    enabled: true
    config:
      src:
        # directory: where our svg assets are located. please note: this will overwrite the files in this directory
        directory: /src/assets/
```

### Env Variable

For now, you will also need this in your environment variables:

- **NETLIFY_BUILD_LIFECYCLE_TRIAL** - enabled=true
