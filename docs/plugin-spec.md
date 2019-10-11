# Plugins spec

Plugins are a way for users to extend the functionality of the Netlify Platform.

Plugins have the ability to:

- Change the default behavior of how the netlify build lifecycle & CLI operate
- Provision custom third party resources (such as mongoDb tables or AWS resources etc)
- Hook into the netlify lifecycle and enrich users builds

## Plugins should

- Be able to hook into lifecycle methods
- Be able to create their own lifecycle hooks for other plugins to hook into
- Be able to add CLI commands
- Be able to provision (create/update/delete) resources
- Be able to return output data for other plugins to use

### Lifecycle methods

Plugins can listen to core lifecycle events that happen during different Netlify activities, for example during the build, while Netlify dev is running, or during a netlify deployment.

The lifecycle is extendable, plugins can define their own lifecycle events that other plugins and listen and react to. For example, the `mongoDb` plugin can expose an `afterDatabaseCreated` hook that other plugins can run functionality from.

### CLI commands

Plugins can expose additional commands to the netlify CLI

For example the `mongoDb` plugin could expose a `netlify mongo:delete` command that tears down the given resource.

### Creating Plugins

[Creating Plugins](./creating-plugins.md)
