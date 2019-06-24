# Build plugin example

`Netlify Build` is pluggable.

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
