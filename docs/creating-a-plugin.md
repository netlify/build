# Creating Plugins

Netlify Plugins extend the functionality of the Netlify Build process.

Plugins are plain JavaScript objects that allow users to hook into the different lifecycle steps happening during their
site builds.

For example, hooking into the `onPreBuild` step to run something before your build command. Or the `onPostBuild` hook
for running things after your site build has completed.

## Available Lifecycle Hooks

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE:noAnchors=true) -->

| Lifecycle hook                                 | Description                              |
| :--------------------------------------------- | :--------------------------------------- |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onInit** ‏‏‎ ‏‏‎ ‏‏‎           | Runs before anything else                |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onGetCache** ‏‏‎ ‏‏‎ ‏‏‎       | Fetch previous build cache               |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onInstall** ‏‏‎ ‏‏‎ ‏‏‎        | Install project dependencies             |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onBuild** ‏‏‎ ‏‏‎ ‏‏‎          | Build commands are executed              |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onFunctionsBuild** ‏‏‎ ‏‏‎ ‏‏‎ | Build the serverless functions           |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onPackage** ‏‏‎ ‏‏‎ ‏‏‎        | Package & optimize artifact              |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onPreDeploy** ‏‏‎ ‏‏‎ ‏‏‎      | Runs before built artifacts are deployed |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onSaveCache** ‏‏‎ ‏‏‎ ‏‏‎      | Save cached assets                       |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onSuccess** ‏‏‎ ‏‏‎ ‏‏‎        | Runs on build success                    |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onError** ‏‏‎ ‏‏‎ ‏‏‎          | Runs on build error                      |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **onEnd** ‏‏‎ ‏‏‎ ‏‏‎            | Runs on build error or success           |

<!-- AUTO-GENERATED-CONTENT:END (LIFECYCLE_TABLE) -->

## Anatomy of a plugin

Plugins are JavaScript objects like so:

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  onPreBuild: () => {
    console.log('Hello world from onPreBuild lifecycle step!')
  },
}
```

This plugin will log out `Hello world from onPreBuild lifecycle step!` before right before the build commands are run.

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
  - type: ./plugins/netlify-plugin-hello-world
```

Now that the plugin is declared, we can verify it's loading correctly with the `netlify build --dry` command. This
execute a "dry run" of our build and show us the plugins & commands that will execute for a real build.

```bash
netlify build --dry
```

Notice how our `onPreBuild` step from our `netlify-plugin-hello-world` is listed in the things that execute.

Now, let's run the build!

```bash
netlify build
```

This will execute our `onPreBuild` function and the `npm run build` command.

## Adding configuration to plugins

If your plugin requires additional values from the user to do things, those can be provided as `config` to the plugin.

```yml
# Attach our plugin
plugins:
  - type: ./plugins/netlify-plugin-hello-world
    config:
      foo: bar
      fizz: pop
```

These `config` values are passed into the plugin when the lifecycle methods are being executed.

To access them in your plugin code you can:

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  onPreBuild: ({ pluginConfig }) => {
    console.log('Hello world from onPreBuild lifecycle step!')
    console.log(pluginConfig.foo) // bar
    console.log(pluginConfig.fizz) // pop
  },
}
```

Instead of a plugin being a simple object, it can also be a function returning an object:

```js
module.exports = function helloWorldPlugin(pluginConfig) {
  console.log(pluginConfig.foo) // bar
  console.log(pluginConfig.fizz) // pop

  return {
    name: 'netlify-plugin-hello-world',
    onPreBuild: ({ pluginConfig, config, constants }) => {
      console.log('Hello world from onPreBuild lifecycle step!')
      console.log(pluginConfig.foo) // bar
      console.log(pluginConfig.fizz) // pop
    },
  }
}
```

## Validating plugin configuration

The plugin configuration can be validated using a `config` property:

```js
module.exports = {
  name: 'netlify-plugin-hello-world',
  config: {
    required: ['foo'],
    properties: {
      foo: { type: 'string', enum: ['bar', 'one', 'two'] },
      bar: { type: 'string' },
      increment: { type: 'number', minimum: 0, maximum: 10, default: 5 }
    }
  },
  onPreBuild: ({ pluginConfig }) => { ... },
}
```

The `config` property is a JSON schema v7 describing the `pluginConfig` object.

More information about JSON schema can be found at https://json-schema.org/understanding-json-schema/.

`config.properties` can have `default` values as shown in the example above. They can also be `required` as shown above.

It is recommended to validate your plugin configuration and assign default values using the `config` property instead of
doing it inside hook methods.

## Plugin constants

Inside of each lifecycle function there is a `constants` key.

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

- `CONFIG_PATH` Path to the netlify configuration file
- `BUILD_DIR` The build directory of the site
- `CACHE_DIR` The directory files can be cached in between builds
- `FUNCTIONS_SRC` The directory where function source code lives
- `FUNCTIONS_DIST` The directory where built serverless functions are placed before deployment
  <!-- AUTO-GENERATED-CONTENT:END -->

## Publishing a plugin

The [`name` property in `package.json`](https://docs.npmjs.com/files/package.json#name) should start with
`netlify-plugin-` (such as `netlify-plugin-example` or `@scope/netlify-plugin-example`). It should match the plugin
`name` field.

It is recommended for the GitHub repository to be named like this as well.

The [`keywords` property in `package.json`](https://docs.npmjs.com/files/package.json#keywords) and the
[GitHub topics](https://github.com/topics) should contain the `netlify` and `netlify-plugin` keywords.
