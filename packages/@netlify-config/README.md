# Netlify Config

Library for reading netlify configuration files.

## Formats supported

`yml`, `toml`, and `json`

## Examples

`netlify.toml`!

```toml
[build]
  publish = "dist"
  command = "npm run build"
  functions = "functions"
```

`netlify.yml`!

```yaml
build:
  publish: dist
  command: npm run build
  functions: functions
```

`netlify.json`!

```json
{
  "build": {
    "publish": "dist",
    "command": "npm run build",
    "functions": "functions"
  }
}
```
