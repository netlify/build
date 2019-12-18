<img src="static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Utility for executing commands and processes inside Netlify Build.

This module is based on [Execa](https://github.com/sindresorhus/execa).

# Examples

```js
// Runs `eslint src/ test/` and prints the result
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { exec } }) {
    await exec('eslint', ['src/', 'test/'], { stdio: 'inherit' })
  },
}
```

```js
// Same but with a more convenient syntax
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { exec } }) {
    await exec.command('eslint src/ test/', { stdio: 'inherit' })
  },
}
```

```js
// Retrieve command's output and exit code as variables
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { exec } }) {
    const { stdout, stderr, exitCode } = await exec('eslint', ['src/', 'test/'])
    console.log({ stdout, stderr, exitCode })
  },
}
```

```js
// Streaming mode
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { exec } }) {
    const { stdout } = exec('eslint', ['src/', 'test/'], { buffer: false })
    stdout.pipe(fs.createWriteStream('stdout.txt'))
  },
}
```

```js
// If the command exit code is not 0 or was terminated by a signal, an error
// is thrown with failure information
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { exec } }) {
    try {
      await exec('eslint', ['does_not_exist'])
    } catch (error) {
      console.error(error)
    }
  },
}
```

```js
// If the binary is installed locally (instead of globally), the following
// option must be used
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { exec } }) {
    await exec('eslint', ['src/', 'test/'], { preferLocal: true })
  },
}
```

```js
// Pass environment variables
const exampleNetlifyPlugin = {
  name: 'example-netlify-plugin',
  async onBuild({ utils: { exec } }) {
    await exec('eslint', ['src/', 'test/'], { env: { TEST: 'true' } })
  },
}
```

# Install

```
npm install @netlify/exec-utils
```

# API

## exec(file, arguments, options?)

Execute a command/file.

Please see [here](https://github.com/sindresorhus/execa#execafile-arguments-options) for more information about the
available options.

## exec.command(command, options?)

Same as [`exec()`](#execfile-arguments-options) except both file and arguments are specified in a single `command`
string. For example, `execa('echo', ['netlify'])` is the same as `execa.command('echo netlify')`.

If the file or an argument contains spaces, they must be escaped with backslashes. This matters especially if `command`
is not a constant but a variable, for example with `__dirname` or `process.cwd()`. Except for spaces, no
escaping/quoting is needed.
