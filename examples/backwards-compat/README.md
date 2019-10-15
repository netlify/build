# Backwards compatible site

This site is a backwards compatible example of how **Netlify Build** works with your existing site.

This example is using the `netlify.toml` file and we will be walking through how `@netlify/build` interacts with it.

<!-- AUTO-GENERATED-CONTENT:START (TOC) -->
- [1. Running netlify build with existing config](#1-running-netlify-build-with-existing-config)
- [2. Adding a build lifecycle steps to config](#2-adding-a-build-lifecycle-steps-to-config)
- [3. Adding a plugins to the build process](#3-adding-a-plugins-to-the-build-process)
<!-- AUTO-GENERATED-CONTENT:END -->

## 1. Running netlify build with existing config

Our standard `netlify.toml` config looks like this:

```toml
# Build Settings
[build]
  command = "npm run makeSite"
  publish = "build"
  functions = "functions"
```

1. **Preview the build**

    To preview the build step, run the following command:

    ```bash
    npm run preview
    ```

    These are the steps your build will go through.

2. **Run the build**

    To run `@netlify/build` run the following command

    ```bash
    npm run build
    ```

    This will execute your build command and output the site

## 2. Adding a build lifecycle steps to config

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

## 3. Adding a plugins to the build process

Let's add some plugins!

For this example we will add the `@netlify/sitemap` plugin

1. **Install the plugin**

    ```
    npm install @netlify/plugin-sitemap -D
    ```

2. **Add the plugin to your netlify configuration**

    In the `netlify.toml` file, add a `plugins` block and define the sitemap plugin

    ```toml
    # Build Plugins
    [plugins]
      [plugins.sitemap]
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

3. **Preview and run the build**

    Preview the new build steps:

    ```bash
    npm run preview
    ```

    Then run the build again

    ```bash
    npm run build
    ```

4. **Create your own plugins**

    Now it's time to [create your own build plugins](https://github.com/netlify/build/blob/master/docs/creating-a-plugin.md)!
