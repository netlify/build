This document explains some of the main file paths used in a Netlify site. This is mostly intended for code
contributors.

## Current directory

Process's current directory, as specified by `process.cwd()`.

This is mostly relevant for the Netlify CLI, where users can change it in their terminal.

## Repository root

Project root repository. In monorepos, this is the monorepo root.

This is the closest parent with a `.git` directory. If none is found, this defaults to the current directory.

## Build directory

This is used as the current directory when running the build command and Build plugins.

This is also used to resolve any file paths inside `netlify.toml` or the UI build settings, except for the `base`
configuration property (which is relative to the repository root instead).

We sometimes refer to this as the "base directory" or the "site root" instead.

Its value is (from highest to lowest priority):

- The `base` property specified in `netlify.toml` or UI build settings. This is useful when targetting specific
  directories inside a monorepo.
- In the Netlify CLI: if a project has multiple Netlify sites, the user can change directories to this build directory
  inside the terminal (using `cd` for example). The closest parent with a `netlify.toml` or `.netlify` will be used.
- The repository root.

## Configuration path

Path to the `netlify.toml`.

This is `undefined` if no `netlify.toml` exists.

This is relative to the current directory.

The following directories are searched (from highest to lowest priority):

- In the Netlify CLI: `--config` flag
- The build directory
- The current directory
- Any parent directory to the current directory

If the `netlify.toml` specifies a `base` directory, the configuration file is searched for a second time using the
`base` directory instead (\*).

## Absolute paths

The Netlify configuration never allows absolute paths. Any leading `/` in a path is omitted, resulting in a relative
path.

Prepending `./` is not required and does not do anything.

## baseRelDir

Boolean flag intended for backward compatibility. This is set for any sites created since the end of 2019.

When unset:

- The points marked with (\*) above do not apply
- Paths in `netlify.toml` are relative to the repository root instead of the build directory

## Publish directory

Directory where the site's built assets are output

Set using the `build.publish` property in `netlify.toml` or the UI build setting.

This defaults to the build directory.

## Functions source directory

Location of the Netlify Functions source files.

Set using the `build.functions` property in `netlify.toml` or the UI build setting.

Can be `undefined`.

## Functions destination directory

Where Netlify Functions are bundled.

In:

- The production builds: this is a temporary directory inside `/tmp`
- The CLI: this is `.netlify/functions/`, relative to the build directory

## Edge handlers source directory

Location of the Edge handlers source files.

Its value is (from highest to lowest priority):

- `build.edge_handlers` property in `netlify.toml`
- `./edge-handlers`, providing this directory exists

Can be `undefined`.

## Edge handlers destination directory

Where Edge handlers are bundled.

It is always `.netlify/edge-handlers`, relative to the build directory.
