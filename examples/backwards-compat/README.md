# Backwards compatible site

This site is a backwards compatible example of how Netlify Build works with your existing `netlify.toml` file.

The `netlify.toml` file looks like this:

```toml
# Build Settings
[build]
  command = "npm run makeSite"
  publish = "build"
  functions = "functions"
```

## Preview the build

To "dry run" and preview the build step, run the following command

```bash
npm run preview
```

## Run the build

To run `@netlify/build` run the following command

```bash
npm run build
```

## Adding a build lifecycle

Convert `build.command` to `build.lifecycle`

This will allow you to run multiple commands during the build lifecycle

```diff
[build]
- command: "npm run makeSite"
  publish = "build"
  functions = "functions"
+ [build.lifecycle]
+ init = [
+   "npm run setup",
+   "echo \"multiple commands! Neat-o torpedo!\""
+ ]
+ preBuild = "echo \"prebuild running!\""
+ build = "npm run makeSite"
```

Resulting in this `toml`

```toml
# Build Settings
[build]
  publish = "build"
  functions = "functions"
  [build.lifecycle]
  init = [
    "npm run setup",
    "echo \"multiple commands! Neat-o torpedo!\""
  ]
  preBuild = "echo \"prebuild running!\""
  build = "npm run makeSite"
```

Preview the new build steps:

```bash
npm run preview
```

Then run the build again

```bash
npm run build
```

## Adding plugins

Let's add some plugins!

For this example we will add the `@netlify/sitemap` plugin

1. Install the plugin

```
npm install @netlify/plugin-sitemap -D
```

2. Add the plugin to your netlify configuration (`netlify.toml`) file

```toml
# Build Plugins
[plugins]
  [plugins.siteMapPlugin]
  type = "@netlify/plugin-sitemap"
  config = { baseUrl = "https://my-site.com" }
```

Your full `toml` should look like this:

```toml
# Build Settings
[build]
  publish = "build"
  functions = "functions"
  [build.lifecycle]
  init = [
    "npm run setup",
    "echo \"multiple commands! Neat-o torpedo!\""
  ]
  preBuild = "echo \"prebuild running!\""
  build = "npm run makeSite"
# Build Plugins
[plugins]
  [plugins.siteMapPlugin]
  type = "@netlify/plugin-sitemap"
  config = { baseUrl = "https://my-site.com" }
```

3. Preview and run the build

Preview the new build steps:

```bash
npm run preview
```

Then run the build again

```bash
npm run build
```
