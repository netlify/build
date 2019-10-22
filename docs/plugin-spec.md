# Netlify Build spec

https://www.notion.so/netlify/Netlify-Build-Spec-f5705ef446434df495bf324c56de8ff5

## Design principles

- Stellar DX is paramount
- Lightweight core
- Extensible
- Sane defaults that are configurable

## Plugins

Plugins are a way for users to extend the functionality of the Netlify Platform.

**Plugins have the ability to:**

- Alter the behavior the flow of logic in the Netlify Build. This includes running custom functionality before, after, and during a given point in the build lifecycle
- Override default behavior of the build lifecycle
- Provision third party resources
- Extend the build lifecycle with their own hooks that other plugins can hook into

## Plugins Must

- Be able to hook into the various stages of the build lifecycle
- Be able to create their own lifecycle stages or "hooks" for other plugins to plug into
- Be able to add CLI commands
- Be able to provision (create/update/delete) resources
- Be able to return output data for other plugins to use

### Lifecycle

Plugins can listen to core lifecycle events that happen during different Netlify activities, for example during the build, while Netlify dev is running, or during a netlify deployment.

#### Extensibility

The lifecycle is extendable, plugins can define their own lifecycle events that other plugins and listen and react to. For example, the `mongoDb` plugin can expose an `afterDatabaseCreated` hook that other plugins can run functionality from.

#### Logging

All plugin logs should flow through a structured logging system.

Every console.log/warn/etc should be grouped for the UI + plugins to consume.

Logging should be a secure as possible without sacrificing performance. This means automatically redacting known `env` variables from plugins trying to console.log them out. At the end of the day, plugins installed should be vetted by users to ensure they are not installing malware.

## Outputs & Manifest

Plugins can return outputs that other plugins may leverage.

This means a mongoDB provisioning plugin might pass a connection string back as an output that a "mongo crud function" plugin can reference  

This means order is is important in how plugins are defined in the configuration and a dependancy graph of outputs is required to ensure things run in the correct order.

### Manifest

The manifest is the aggregated list of all outputs returned from the build.

This includes things like `liveSiteUrl`, deployId, plugin outputs, function names, function urls, etc.

This manifest file is written to `.netlify/manifest.json`

## CLI commands

Plugins can expose additional commands to the netlify CLI.

For example the `mongoDb` plugin could expose a `netlify mongo:delete` command that tears down the given resource.

Proposed syntax:

```js
module.exports = function netlifyPlugin(config) {
  return {
    name: 'plugin-xyz',
    commands: {
      // shorthand
      foo: () => { /* run thing */ },
      // long hand
      bar: {
        description: "The bar command does this",
        options: {
           xyx: {
             description: 'This option is for xyz',
             required: true,
             shortcut: 'x'
        },
        run: () => { /* run thing */ }
      }
    }
}
```

### Creating Plugins

[Creating Plugins](./creating-a-plugins.md)
