# Netlify Functions Config Plugin

Add paths to functions

## How to use

In your netlify config file add:

```yml
plugins:
  - type: '@netlify/plugin-functions'
```

## Configuration

```yml
plugins:
  - type: '@netlify/plugin-functions'
    config:
      functions:
        foo:
          handler: ./path/to/function-code.handler
          method: post
          path: /foo
```

## Future:

In future functions can take additional configuration

```yml
plugins:
  - type: '@netlify/plugin-functions'
    config:
      functions:
        foo:
          handler: ./path/to/function-code.handler
          method: post
          path: /foo
          memory: 3gb
          timeout: 15min
```
