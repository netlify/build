# Creating Plugins

Netlify Plugins extend the functionality of the netlify build process.

Plugins are plain javascript objects that allow users to hook into the different lifecycle steps happening during their site builds.

For example, hooking into the `preBuild` step to run something before your build command. Or the `postBuild` hook for running things after your site build has completed.

[See a full list of the lifecycle methods](https://www.youtube.com/watch?v=oHg5SJYRHA0)

## Anatomy of a plugin

Plugins are javascript objects like so:

```js
const helloWorldPlugin = {
  preBuild: () => {
    console.log('Hello world from preBuild lifecycle step!')
  }
}

module.exports = helloWorldPlugin
```

This plugin will log out `Hello world from preBuild lifecycle step!` before right before the build commands are run.

Save the plugin code locally to a `./plugins/my-plugin` folder as `index.js`. This will allow us to use the plugin in the next step.

## Using a plugin

To leverage this plugin we have just created, we need to declare it in our netlify config file.

Plugins live under the `plugins` top level key of your `netlify.yml` (or `netlify.toml`) file.

```yml
build:
  command: npm run build
  publish: dist

# Attach our plugin
plugins:
  myFirstPlugin:
    type: ./plugins/my-plugin
```

Now that the plugin is declared, we can verify it's loading correctly with the `netlify build --dry` command. This execute a "dry run" of our build and show us the plugins & commands that will execute for a real build.

```
netlify build --dry
```

Notice how our `preBuild` step from our `helloWorldPlugin` is listed in the things that execute.

Now, let's run the build!

```
netlify build
```

This will execute our `preBuild` function and the `npm run build` command.

## Adding configuration to plugins

If your plugin requires additional values from the user to do things, those can be provided as `config` to the plugin.

```yml
# Attach our plugin
plugins:
  myFirstPlugin:
    type: ./plugins/my-plugin
    config:
      foo: bar
      fizz: pop
```

These `config` values are passed into the plugin when the lifecycle methods are being executed.

To access them in your plugin code you can:

```js
const helloWorldPlugin = {
  preBuild: ({ config }) => {
    console.log('Hello world from preBuild lifecycle step!')
    console.log(config.foo) // bar
    console.log(config.fizz) // pop
  }
}

module.exports = helloWorldPlugin
```

Plugin configuration is also supplied top level if you are returning a dynamic plugin.

Instead of a plugin being a simple object, instead the plugin is a `function` that returns a plain old javascript object.

```js
function helloWorldPlugin(pluginConfig) {
  console.log(config.foo) // bar
  console.log(config.fizz) // pop
  return {
    preBuild: ({ config }) => {
      console.log('Hello world from preBuild lifecycle step!')
    }
  }
}
module.exports = helloWorldPlugin
```

Plugins as functions returning the object is a powerful way to provide advanced functionality like:

- Returning only specific lifecycles to execute based on config
- Giving plugin users the ability to customize order of execution of functionality
- Preforming input validation on configuration to fail fast if invalid values are passed in
