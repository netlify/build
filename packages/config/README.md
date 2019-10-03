# Netlify Config

Library for reading netlify configuration files.

## About

`@netlify/config` brings a wide variety of new functionality to Netlify's config ecosystem.

Including:

- Multiple config formats
- `environment` variable support
- (Future) `secret` support

## Environment Variable Support

To reference `env` variables in your config file. Use the `${}` bracket notation.

`${env:MY_VARIABLE_KEY_NAME}`

**Example**

```yml
thing: ${env:MY_VAR} # <-- resolves to the environment variable MY_VAR value
```

**Example with default value**

```yml
thing: ${env:OTHER_VAR, 'my-default-value'}
#      👆 If OTHER_VAR not found, this resolves my-default-value
```

## Formats

Currently `yml`, `toml`, and `json` are supported by `@netlify/config`

**Format Examples**

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
