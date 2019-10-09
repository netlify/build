# Netlify Plugin No More 404 

This build plugin will remember the html files you've built, and either warn or fail your build when you make the next build and accidentally lose some html pages (whether on purpose or intentional). The plugin understands redirects, so you can add a redirect to resolve missing html.

## Usage

In the plugins, src, directory, add the path that the assets are in (last line in the yml below)

`netlify.yml`

```
build:
  publish: build # NOTE: you should have a publish folder specified here for this to work

plugins:
  404-no-more:
    type: '@netlify/plugin-404-no-more'
    config:
      on404: 'error' # can switch to warn
      cacheKey: 'anystring' # bump this key any time you need to restart from scratch
      # not yet implemented - compare vs specific build IDs to ensure no regression
      # preserveBuildIds: 
        # - foo 
        # - foo 
        # - foo 
```


### Env Variable

For now, you will also need this in your environment variables:

