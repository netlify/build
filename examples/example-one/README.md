# Netlify Build Example

This is an example site using Netlify build.

[View the docs](https://github.com/netlify/build/)

## Configuration

Configuration is written in `YAML` instead of `TOML`

```yml
# Build Settings
build:
  functions: functions
  publish: build
  # Inline lifecycle hooks
  lifecycle:
    init:
      - echo "Starting the build"
    build:
      - npm run makeSite
    finally:
      - echo "Ending the build"

# Build plugins
plugins:
  - type: ./plugins/example
    config:
      hi: foo
```

[Convert TOML to YAML](https://toolkit.site/format.html) or [Convert YAML to TOML](https://toolkit.site/format.html)
