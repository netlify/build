# Creating Plugins

Netlify Plugins extend the functionality of the Netlify Build process.

Plugins are plain JavaScript objects that allow users to hook into the different lifecycle steps happening during their
site builds.

For example, hooking into the `preBuild` step to run something before your build command. Or the `postBuild` hook for
running things after your site build has completed.

## Available Lifecycle Hooks

<!-- AUTO-GENERATED-CONTENT:START (LIFECYCLE_TABLE:noAnchors=true) -->

| Lifecycle hook                               | Description                                 |
| :------------------------------------------- | :------------------------------------------ |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **init** ‏‏‎ ‏‏‎ ‏‏‎           | Runs before anything else                   |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **getCache** ‏‏‎ ‏‏‎ ‏‏‎       | Fetch previous build cache                  |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **install** ‏‏‎ ‏‏‎ ‏‏‎        | Install project dependencies                |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **preBuild** ‏‏‎ ‏‏‎ ‏‏‎       | Runs before functions & build commands run  |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **functionsBuild** ‏‏‎ ‏‏‎ ‏‏‎ | Build the serverless functions              |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **build** ‏‏‎ ‏‏‎ ‏‏‎          | Build commands are executed                 |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **postBuild** ‏‏‎ ‏‏‎ ‏‏‎      | Runs after site & functions have been built |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **package** ‏‏‎ ‏‏‎ ‏‏‎        | Package & optimize artifact                 |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **preDeploy** ‏‏‎ ‏‏‎ ‏‏‎      | Runs before built artifacts are deployed    |
| ⇩ ‏‏‎ ‏‏‎ ‏‏‎ **saveCache** ‏‏‎ ‏‏‎ ‏‏‎      | Save cached assets                          |
| 🎉 ‏‏‎ **finally** ‏‏‎ ‏‏‎ ‏‏‎               | Runs after anything else                    |

<!-- AUTO-GENERATED-CONTENT:END (LIFECYCLE_TABLE) -->

## Anatomy of a plugin

Plugins are JavaScript objects like so:

```js
const helloWorldPlugin = {
  preBuild: () => {
    console.log('Hello world from preBuild lifecycle step!')
  },
}

module.exports = helloWorldPlugin
```

This plugin will log out `Hello world from preBuild lifecycle step!` before right before the build commands are run.

Save the plugin code locally to a `./plugins/my-plugin` folder as `index.js`. This will allow us to use the plugin in
the next step.

## Using a plugin

To leverage this plugin we have just created, we need to declare it in our netlify config file.

Plugins live under the `plugins` top level key of your `netlify.yml` (or `netlify.toml`) file.

```yml
build:
  command: npm run build
  publish: dist

# Attach our plugin
plugins:
  - type: ./plugins/my-plugin
```

Now that the plugin is declared, we can verify it's loading correctly with the `netlify build --dry` command. This
execute a "dry run" of our build and show us the plugins & commands that will execute for a real build.

```bash
netlify build --dry
```

Notice how our `preBuild` step from our `helloWorldPlugin` is listed in the things that execute.

Now, let's run the build!

```bash
netlify build
```

This will execute our `preBuild` function and the `npm run build` command.

## Adding configuration to plugins

If your plugin requires additional values from the user to do things, those can be provided as `config` to the plugin.

```yml
# Attach our plugin
plugins:
  - type: ./plugins/my-plugin
    config:
      foo: bar
      fizz: pop
```

These `config` values are passed into the plugin when the lifecycle methods are being executed.

To access them in your plugin code you can:

```js
const helloWorldPlugin = {
  name: 'netlify-plugin-hello-world',
  preBuild: ({ pluginConfig }) => {
    console.log('Hello world from preBuild lifecycle step!')
    console.log(config.foo) // bar
    console.log(config.fizz) // pop
  },
}

module.exports = helloWorldPlugin
```

Plugin configuration is also supplied top level if you are returning a dynamic plugin.

Instead of a plugin being a simple object, instead the plugin is a `function` that returns a plain old JavaScript
object.

```js
function helloWorldPlugin(pluginConfig, config) {
  console.log(pluginConfig.foo) // bar
  console.log(pluginConfig.fizz) // pop
  return {
    name: 'netlify-plugin-hello-world',
    preBuild: ({ pluginConfig, config }) => {
      console.log('Hello world from preBuild lifecycle step!')
      console.log(pluginConfig.foo) // bar
      console.log(pluginConfig.fizz) // pop
    },
  }
}
module.exports = helloWorldPlugin
```

Plugins as functions returning the object is a powerful way to provide advanced functionality like:

- Returning only specific lifecycles to execute based on config
- Giving plugin users the ability to customize order of execution of functionality
- Preforming input validation on configuration to fail fast if invalid values are passed in

## Publishing a plugin

The [`name` property in `package.json`](https://docs.npmjs.com/files/package.json#name) should start with
`netlify-plugin-` (such as `netlify-plugin-example` or `@scope/netlify-plugin-example`). It should match the plugin
`name` field.

It is recommended for the GitHub repository to be named like this as well.

The [`keywords` property in `package.json`](https://docs.npmjs.com/files/package.json#keywords) and the
[GitHub topics](https://github.com/topics) should contain the `netlify` and `netlify-plugin` keywords.
