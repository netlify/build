<img src="static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for running commands inside Netlify Build.

# Examples

```js
// Runs `eslint src/ test/` and prints the result
// Either local or global binaries can be run
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { run } }) {
    await run('eslint', ['src/', 'test/'])
  },
}
```

```js
// Same but with a more convenient syntax
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { run } }) {
    await run.command('eslint src/ test/')
  },
}
```

```js
// Retrieve command's output and exit code as variables
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { run } }) {
    const { stdout, stderr, exitCode } = await run('eslint', ['src/', 'test/'])
    console.log({ stdout, stderr, exitCode })
  },
}
```

```js
// Streaming mode
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { run } }) {
    const { stdout } = run('eslint', ['src/', 'test/'])
    stdout.pipe(fs.createWriteStream('stdout.txt'))
  },
}
```

```js
// If the command exit code is not 0 or was terminated by a signal, an error
// is thrown with failure information
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { run } }) {
    try {
      await run('eslint', ['does_not_exist'])
    } catch (error) {
      console.error(error)
    }
  },
}
```

```js
// Pass environment variables
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { run } }) {
    await run('eslint', ['src/', 'test/'], { env: { TEST: 'true' } })
  },
}
```

# API

## run(file, arguments, options?)

Execute a command/file.

## run.command(command, options?)

Same as [`run()`](#runfile-arguments-options) except both file and arguments are specified in a single `command` string.
For example, `run('echo', ['netlify'])` is the same as `run.command('echo netlify')`.

If the file or an argument contains spaces, they must be escaped with backslashes. This matters especially if `command`
is not a constant but a variable, for example with `__dirname` or `process.cwd()`. Except for spaces, no
escaping/quoting is needed.
