# Backwards compatible site

This site is a backwards compatible example of how Netlify Build works with your existing `netlify.toml` file.

The `netlify.toml` file looks like this:

```toml
[build]
  command = "npm run makeSite"
  publish = "build"
  functions = "functions"
```

## Run the build

To run `@netlify/build` run the following command

```bash
npm run build
```

## Next steps

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
