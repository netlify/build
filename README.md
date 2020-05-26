# Netlify Build

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

Netlify Build is a new, pluggable tool for running builds locally and in Netlify CI. It introduces Build Plugins, which
are **now in public beta.** Learn how to enable your site to use Netlify Build and Build Plugins in the
[Netlify docs](https://docs.netlify.com/configure-builds/plugins).

<details>
<summary>Expand Table of Contents</summary>

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [What are Build Plugins?](#what-are-build-plugins)
- [What can plugins do?](#what-can-plugins-do)
- [Creating plugins](#creating-plugins)
  - [Available event handlers](#available-event-handlers)
  - [Anatomy of a plugin](#anatomy-of-a-plugin)
  - [Using a local plugin](#using-a-local-plugin)
  - [Adding inputs to plugins](#adding-inputs-to-plugins)
  - [Validating plugin inputs](#validating-plugin-inputs)
  - [Plugin constants](#plugin-constants)
  - [Utilities](#utilities)
  - [Error reporting](#error-reporting)
  - [Logging](#logging)
  - [Asynchronous code](#asynchronous-code)
  - [Dynamic events](#dynamic-events)
- [Publishing a plugin](#publishing-a-plugin)
  - [Sharing with the community](#sharing-with-the-community)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

</details>

## What are Build Plugins?

Netlify Build Plugins extend the functionality of the Netlify Build process. You can install plugins made by others, or
write your own. You can save them locally in your repository, or share them with others via npm.

For more information on installing, managing, and running published Build Plugins on your Netlify site, visit the
[Netlify docs](https://docs.netlify.com/configure-builds/plugins).

The content in this repository focuses on how to build your own plugins.

## What can plugins do?

Quite a lot! Community members have already created
[several plugins](https://github.com/netlify/plugins#community-plugins) to perform a variety of tasks during the build,
including:

- controlling how files are cached between builds
- checking for broken links in a site after building
- importing and converting data from external sources
- analyzing and optimizing site asset handling for better runtime performance
- generating content like sitemaps, RSS feeds, and search indexes

## Creating plugins

Plugins are plain JavaScript objects with event handlers for the different events happening during builds.

For example, the `onPreBuild` event handler runs before your build command. Or the `onPostBuild` event handler runs
after your site build has completed.

### Available event handlers

| Event                                     | Description                        |
| :---------------------------------------- | :--------------------------------- |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onPreBuild** ‏‏‎ ‏‏‎ ‏‏‎  | Before build commands are executed |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onBuild** ‏‏‎ ‏‏‎ ‏‏‎     | Build commands are executed        |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onPostBuild** ‏‏‎ ‏‏‎ ‏‏‎ | After Build commands are executed  |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onSuccess** ‏‏‎ ‏‏‎ ‏‏‎   | Runs on build success              |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onError** ‏‏‎ ‏‏‎ ‏‏‎     | Runs on build error                |
| 🎉 ‏‏‎ **onEnd** ‏‏‎ ‏‏‎ ‏‏‎              | Runs on build error or success     |

_Please keep in mind that these events are for build events only and do not include deploy events, pertinent in cases
that you're working with our API._

### Anatomy of a plugin

A plugin consists of two files:

- A `manifest.yml` file in the package root with the plugin's name at minimum:

  ```yml
  # manifest.yml

  name: netlify-plugin-hello-world
  ```

- A JavaScript object like so:

  ```js
  // index.js

  module.exports = {
    onPreBuild: () => {
      console.log('Hello world from onPreBuild event!')
    },
  }
  ```

The plugin defined above will log out `Hello world from onPreBuild event!` right before the site's build commands are
run.

The `index.js` file runs in a regular Node.js environment and can use any
[Node.js core methods](https://nodejs.org/api/) and [modules](https://www.npmjs.com/).
[Environment variables](https://docs.netlify.com/configure-builds/environment-variables/) can be accessed and modified
with [`process.env`](https://nodejs.org/api/process.html#process_process_env).

Save the `index.js` file locally to a `./plugins/netlify-plugin-hello-world`. This will allow us to use the plugin in
the next step.

### Using a local plugin

To leverage this plugin we have just created, we need to declare it in our Netlify configuration file.

Plugins are declared as top-level `[[plugins]]` tables in your `netlify.toml` file.

```toml
# netlify.toml

[[plugins]]
package = "./plugins/netlify-plugin-hello-world"
```

(Note that each plugin you add to the `netlify.toml` file has its own `[[plugins]]` line.)

Local plugins `package` value must start with `.` or `/`.

Now that the plugin is declared, we can verify it's loading correctly with the `netlify build --dry` command. This
execute a "dry run" of our build and show us the plugins & commands that will execute for a real build.

```bash
netlify build --dry
```

Notice how our `onPreBuild` event handler from our `netlify-plugin-hello-world` is listed in the things that execute.

Now, let's run the build!

```bash
netlify build
```

This will execute our `onPreBuild` function.

More information about the `netlify build` command can be found in the
[Netlify CLI documentation](https://github.com/netlify/cli/blob/master/docs/commands/build.md).

### Adding inputs to plugins

If your plugin requires additional values from the user to do things, you can specify these requirements in an `inputs`
array in the plugin's `manifest.yml` file:

```yml
# manifest.yml

name: netlify-plugin-hello-world
inputs:
  - name: foo
    description: Describe what foo does
  - name: fizz
    description: Describe what fizz does
```

When you or a user install the plugin, the input names are used as keys with user-supplied values in the site
`netlify.toml` file:

```toml
# netlify.toml

[[plugins]]
package = "./plugins/netlify-plugin-hello-world"
  [plugins.inputs]
  foo = "bar"
  fizz = "pop"
```

These `inputs` values are passed into the plugin when the event handlers are being executed.

To access them in your plugin code you can:

```js
// index.js

module.exports = {
  onPreBuild: ({ inputs }) => {
    console.log('Hello world from onPreBuild event!')
    console.log(inputs.foo) // bar
    console.log(inputs.fizz) // pop
  },
}
```

### Validating plugin inputs

The plugin inputs can be validated using the `inputs` property in the plugin `manifest.yml` file:

```yml
# manifest.yml

name: netlify-plugin-hello-world
inputs:
  - name: foo
    description: Describe what foo does
    required: true
  - name: fizz
    description: Describe what fizz does
    default: 5
```

The `inputs` property is an array of objects with the following members:

- `name` `{string}`: Name of the input. Required.
- `description` `{string}`: Description of the input.
- `required` `{boolean}`
- `default` `{any}`: Default value.

It is recommended to validate your plugin inputs and assign default values using the `inputs` property instead of doing
it inside event handlers.

### Plugin constants

Inside of each event handler there is a `constants` key.

```js
// index.js

module.exports = {
  onPreBuild: ({ constants }) => {
    console.log(constants)
  },
}
```

The `constants` key contains the following values:

- `CONFIG_PATH` Path to the Netlify configuration file. `undefined` if none was used.
- `PUBLISH_DIR` Directory that contains the deploy-ready HTML files and assets generated by the build. Its value is
  always defined, but the target might not have been created yet.
- `FUNCTIONS_SRC` The directory where function source code lives. `undefined` if not specified by the user.
- `FUNCTIONS_DIST` The directory where built serverless functions are placed before deployment. Its value is always
  defined, but the target might not have been created yet.
- `IS_LOCAL` Boolean indicating whether the build was run locally (Netlify CLI) or in the production CI
- `NETLIFY_BUILD_VERSION` Version of Netlify Build as a `major.minor.patch` string
- `SITE_ID` The Netlify Site ID

### Utilities

Several utilities are provided with the `utils` argument to event handlers:

- [`build`](#error-reporting): to report errors or cancel builds
- [`status`](#logging): to display information in the deploy summary
- [`cache`](/packages/cache-utils/README.md): to cache files between builds
- [`run`](/packages/run-utils/README.md): to run commands and processes
- [`git`](/packages/git-utils/README.md): to retrieve git-related information such as the list of
  modified/created/deleted files

```js
// index.js

module.exports = {
  onPreBuild: async ({ utils: { build, status, cache, run, git } }) => {
    await run.command('eslint src/ test/')
  },
}
```

### Error reporting

Exceptions thrown inside event handlers are reported in logs as bugs. You should handle errors with `try`/`catch` blocks
and use `utils.build`:

```js
// index.js

module.exports = {
  onPreBuild: ({ utils }) => {
    try {
      badMethod()
    } catch (error) {
      return utils.build.failBuild('Failure message')
    }
  },
}
```

The following methods are available depending on the error's type:

- `utils.build.failBuild('message')`: fails the build - the build in your dashboard would show “Failed”. Use this to
  indicate something went wrong.
- `utils.build.failPlugin('message')`: fails the plugin but not the build.
- `utils.build.cancelBuild('message')`: cancels the build - the dashboard would show “Cancelled” for that build. Use
  this to indicate that the build is being cancelled as planned.

`utils.build.failBuild()`, `utils.build.failPlugin()` and `utils.build.cancelBuild()` can specify an options object with
the following properties:

- `error`: the original `Error` instance. Its stack trace will be preserved and its error message will be appended to
  the `'message'` argument.

```js
// index.js

module.exports = {
  onPreBuild: ({ utils }) => {
    try {
      badMethod()
    } catch (error) {
      return utils.build.failBuild('Failure message', { error })
    }
  },
}
```

### Logging

Anything printed on the console will be shown in the build logs.

```js
// index.js

module.exports = {
  onPreBuild() {
    console.log('This is printed in the build logs')
  },
}
```

If you'd prefer to make the information more visible, `utils.status.show()` can be used to display them in the deploy
summary instead.

```js
// index.js

module.exports = {
  onPreBuild({ utils }) {
    utils.status.show({
      // Optional. Default to the plugin's name followed by a generic title.
      title: 'Main title',
      // Required.
      message: 'Message below the title',
      // Optional. Empty by default.
      text: 'Detailed information shown in a collapsible section',
    })
  },
}
```

Only one status is shown per plugin. Calling `utils.status.show()` twice overrides the previous status.

This is meant for successful information. Errors should be reported [with `utils.build.*` instead](#error-reporting).

### Asynchronous code

Asynchronous code can be achieved by using `async` methods:

```js
// index.js

module.exports = {
  onPreBuild: async ({ utils }) => {
    try {
      await doSomethingAsync()
    } catch (error) {
      utils.build.failBuild('Failure message', { error })
    }
  },
}
```

Any thrown `Error` or rejected `Promise` that is not handled by [`utils.build`](#error-reporting) will be shown in the
build logs as a plugin bug.

```js
// index.js

module.exports = {
  onPreBuild: async ({ utils }) => {
    // Any error thrown inside this function will be shown in the build logs as a plugin bug.
    await doSomethingAsync()
  },
}
```

Plugins end as soon as their methods end. Therefore you should `await` any asynchronous operation. The following
examples show invalid code and the way to fix it.

```js
// index.js
// Example showing how to use callbacks.
const { promisify } = require('util')

module.exports = {
  // INVALID EXAMPLE: do not use this.
  // This callback will not be awaited.
  onPreBuild: ({ utils }) => {
    doSomethingAsync((error, response) => {
      console.log(response)
    })
  },

  // VALID EXAMPLE: please use this instead.
  // This callback will be awaited.
  onPostBuild: async ({ utils }) => {
    const response = await promisify(doSomethingAsync)()
    console.log(response)
  },
}
```

```js
// index.js
// Example showing how to use events.
const pEvent = require('p-event')

module.exports = {
  // INVALID EXAMPLE: do not use this.
  // This event will not be awaited.
  onPreBuild: ({ utils }) => {
    const emitter = doSomethingAsync()
    emitter.on('response', response => {
      console.log(response)
    })
    emitter.start()
  },

  // VALID EXAMPLE: please use this instead.
  // This event will be awaited.
  onPreBuild: async ({ utils }) => {
    const emitter = doSomethingAsync()
    emitter.start()
    const response = await pEvent(emitter, 'response')
    console.log(response)
  },
}
```

```js
// index.js
// Example showing how to use `Array.forEach()`.

module.exports = {
  // INVALID EXAMPLE: do not use this.
  // This callback will not be awaited.
  onPreBuild: ({ utils }) => {
    array.forEach(async () => {
      await doSomethingAsync()
    })
  },

  // VALID EXAMPLE: please use this instead.
  // This callback will be awaited.
  onPostBuild: async ({ utils }) => {
    await Promise.all(
      array.map(async () => {
        await doSomethingAsync()
      }),
    )
  },
}
```

### Dynamic events

Some plugins trigger different events depending on the user's `inputs`. This can be achieved by returning the plugin
object from a function instead.

```js
// index.js

module.exports = function helloWorldPlugin(inputs) {
  if (inputs.before) {
    return {
      onPreBuild: () => {
        console.log('Hello world from onPreBuild event!')
      },
    }
  } else {
    return {
      onPostBuild: () => {
        console.log('Hello world from onPostBuild event!')
      },
    }
  }
}
```

## Publishing a plugin

The following properties in `package.json` should be added:

- [`name`](https://docs.npmjs.com/files/package.json#name) should start with `netlify-plugin-` (such as
  `netlify-plugin-example` or `@scope/netlify-plugin-example`). It should match the plugin `name` field. It is
  recommended for the GitHub repository to be named like this as well.
- [`keywords`](https://docs.npmjs.com/files/package.json#keywords) should contain the `netlify` and `netlify-plugin`
  keywords. The same applies to [GitHub topics](https://github.com/topics). This helps users find your plugin.
- [`repository`](https://docs.npmjs.com/files/package.json#repository) and
  [`bugs`](https://docs.npmjs.com/files/package.json#bugs) should be defined. Those are displayed to users when an error
  occurs inside your plugin.

### Sharing with the community

There is a plugins directory of community-created plugins over at https://github.com/netlify/plugins.

To add a plugin, add information to the
[plugins.json file]('https://github.com/netlify/plugins/blob/master/plugins.json').

The content of this file is also used to generate the
[**Plugins directory**](https://docs.netlify.com/configure-builds/plugins/#explore-plugins) in the Netlify UI.

## Contributors

Thanks for contributing!

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repo itself.
