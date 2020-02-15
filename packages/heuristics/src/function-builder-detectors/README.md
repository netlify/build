## Function builder detectors

Similar to project detectors, each file here detects function builders. this is so that netlify dev never manages the
webpack or other config. the expected output is very simple:

```js
module.exports = {
  src: 'functions-source', // source for your functions
  functions: {
    "hello-world": {
        relativePath: "/hello-world",
        language: "golang",
        build: () => {},
        framework: "revel",
        buildCmd: "revel build",
    },
    "hello-js": {
        relativePath: "/hello-js",
        language: "js",
        build: () => {},
        framework: "cra",
        buildCmd: "build:functions",
    },
  },
}
```

example

- [src](https://github.com/netlify/cli/blob/f7b7c6adda3903fa02cf1b3fadcef026a4e56c13/src/function-builder-detectors/netlify-lambda.js#L22)
- [npmScript](https://github.com/netlify/cli/blob/f7b7c6adda3903fa02cf1b3fadcef026a4e56c13/src/function-builder-detectors/netlify-lambda.js#L23)
