## Function builder detectors

Similar to project detectors, each file here detects function builders. this is so that Netlify Build never manages the
webpack or other config. the expected output is very simple:

```js
module.exports = {
  src: 'functions-source', // source for your functions
  functions: {
    "hello-world": {
      language: 'golang',
      command: 'go',
      possibleArgsArrs: [['build', 'main.go']],
      env: { ...process.env },
      dist: 'hello-world',
    },
    "hello-js": {
      language: 'js',
      command: 'npm',
      possibleArgsArrs: [['run', 'build']],
      env: { ...process.env },
      dist: 'build',
    },
  },
}
```
