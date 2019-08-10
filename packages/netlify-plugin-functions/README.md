# Netlify Functions Config Plugin

Add paths to functions

## How to use

In your netlify config file add:

```yml
plugins:
  - netlify-plugin-functions
```

## Configuration

```yml
plugins:
  - netlify-plugin-functions
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
  - netlify-plugin-functions
      functions:
        foo:
          handler: ./path/to/function-code.handler
          method: post
          path: /foo
          memory: 3gb
          timeout: 15min
```
