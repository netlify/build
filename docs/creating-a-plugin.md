# Creating Plugins

Netlify Plugins extend the functionality of the Netlify Build process.

Plugins are plain JavaScript objects with event handlers for the different events happening during builds.

For example, the `onPreBuild` event handler runs before your build command. Or the `onPostBuild` event handler runs
after your site build has completed.

## Available event handlers

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE:noAnchors=true) -->
| Event          | Description |
|:------|:-------|
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **onInit** ‏‏‎  ‏‏‎  ‏‏‎  | Runs before anything else |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **onPreBuild** ‏‏‎  ‏‏‎  ‏‏‎  | Before build commands are executed |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **onBuild** ‏‏‎  ‏‏‎  ‏‏‎  | Build commands are executed |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **onPostBuild** ‏‏‎  ‏‏‎  ‏‏‎  | After Build commands are executed |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **onSuccess** ‏‏‎  ‏‏‎  ‏‏‎  | Runs on build success |
| ⇩ ‏‏‎  ‏‏‎  ‏‏‎ **onError** ‏‏‎  ‏‏‎  ‏‏‎  | Runs on build error |
| 🎉 ‏‏‎ **onEnd** ‏‏‎  ‏‏‎  ‏‏‎  | Runs on build error or success |
<!-- AUTO-GENERATED-CONTENT:END (LIFECYCLE_TABLE) -->

## Anatomy of a plugin

Plugins are JavaScript objects like so:

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  onPreBuild: () => {
    console.log('Hello world from onPreBuild event!')
  },
}
```

This plugin will log out `Hello world from onPreBuild event!` before right before the build commands are run.

Save the plugin code locally to a `./plugins/netlify-plugin-hello-world` folder as `index.js`. This will allow us to use
the plugin in the next step.

## Using a plugin

To leverage this plugin we have just created, we need to declare it in our netlify config file.

Plugins live under the `plugins` top level key of your `netlify.yml` (or `netlify.toml`) file.

```yml
build:
  command: npm run build
  publish: dist

# Attach our plugin
plugins:
  - package: ./plugins/netlify-plugin-hello-world
```

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

This will execute our `onPreBuild` function and the `npm run build` command.

## Adding inputs to plugins

If your plugin requires additional values from the user to do things, those can be provided as `inputs` to the plugin.

```yml
# Attach our plugin
plugins:
  - package: ./plugins/netlify-plugin-hello-world
    inputs:
      foo: bar
      fizz: pop
```

These `inputs` values are passed into the plugin when the event handlers are being executed.

To access them in your plugin code you can:

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  onPreBuild: ({ inputs }) => {
    console.log('Hello world from onPreBuild event!')
    console.log(inputs.foo) // bar
    console.log(inputs.fizz) // pop
  },
}
```

Instead of a plugin being a simple object, it can also be a function returning an object:

```js
module.exports = function helloWorldPlugin(inputs) {
  console.log(inputs.foo) // bar
  console.log(inputs.fizz) // pop

  return {
    name: 'netlify-plugin-hello-world',
    onPreBuild: ({ inputs, netlifyConfig, constants }) => {
      console.log('Hello world from onPreBuild event!')
      console.log(inputs.foo) // bar
      console.log(inputs.fizz) // pop
    },
  }
}
```

## Validating plugin inputs

The plugin inputs can be validated using an `inputs` property:

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  inputs: {
    required: ['foo'],
    properties: {
      foo: { type: 'string', enum: ['bar', 'one', 'two'] },
      bar: { type: 'string' },
      increment: { type: 'number', minimum: 0, maximum: 10, default: 5 }
    }
  },
  onPreBuild: ({ inputs }) => { ... },
}
```

The `inputs` property is a JSON schema v7 describing the `inputs` object.

More information about JSON schema can be found at https://json-schema.org/understanding-json-schema/.

`inputs.properties` can have `default` values as shown in the example above. They can also be `required` as shown above.

It is recommended to validate your plugin inputs and assign default values using the `inputs` property instead of doing
it inside event handlers.

## Plugin constants

Inside of each event handler there is a `constants` key.

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  onPreBuild: ({ constants }) => {
    console.log(constants)
  },
}
```

The `constants` key contains the following values:

<!-- AUTO-GENERATED-CONTENT:START (CONSTANTS) -->
- `CONFIG_PATH` Path to the Netlify configuration file
- `PUBLISH_DIR` Directory that contains the deploy-ready HTML files and assets generated by the build
- `FUNCTIONS_SRC` The directory where function source code lives
- `FUNCTIONS_DIST` The directory where built serverless functions are placed before deployment
- `CACHE_DIR` Path to the Netlify build cache folder
- `IS_LOCAL` Boolean indicating whether the build was run locally (Netlify CLI) or in the production CI
- `SITE_ID` The Netlify Site ID
<!-- AUTO-GENERATED-CONTENT:END -->

## Error reporting

Exceptions thrown inside event handlers are reported in logs as bugs. You should handle errors with `try`/`catch` blocks
and use `utils.build`:

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  onPreBuild: ({ utils }) => {
    try {
      badMethod()
    } catch (error) {
      utils.build.fail('Failure message')
    }
  },
}
```

The following methods are available depending on the error's type:

- `utils.build.fail('message')`: fails the build - the build in your dashboard would show “Failed”. Use this to indicate
  something went wrong.
- `utils.build.cancel('message')`: cancels the build - the dashboard would show “Cancelled” for that build. Use this to
  indicate that the build is being cancelled as planned.

This works inside `async` event handlers as well.

`utils.build.fail()` and `utils.build.cancel()` can specify an options object with the following properties:

- `error`: the original `Error` instance. Its stack trace will be preserved and its error message will be appended to
  the `'message'` argument.

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  onPreBuild: ({ utils }) => {
    try {
      badMethod()
    } catch (error) {
      utils.build.fail('Failure message', { error })
    }
  },
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
