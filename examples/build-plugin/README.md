# Build plugin example

`Netlify Build` is pluggable via third (or first) party extensions.

Some examples:

- The netlify lighthouse plugin to automatically track your lighthouse site score between deployments
- The netlify gatsby build plugin to automatically cache common gatbsy assets to speed up builds
- The `netlify-notify-plugin` plugin to automatically wired up build notifications
- The `netlify-cypress-plugin` to automatically run integration tests
- The `netlify-tweet-new-post-plugin` to automatically share new content via twitter on new publish.
- etc.

## Using a plugin

```
[plugins]
 - pluginName:
    configValue: one
    configValueTwo: hi
 - pluginNameTwo:
    configValue: one
    configValueTwo: hi    
```

## API

Plugins are POJOs (plain old javascript objects) with the methods the plugin wishes to hook into.

See `plugin-example.js`

A common set of utilities are including within the plugin context. For example `caching` utilities functions, the current build config, etc.
