[![Build](https://github.com/netlify/edge-bundler/workflows/Build/badge.svg)](https://github.com/netlify/edge-bundler/actions)
[![Node](https://img.shields.io/node/v/@netlify/edge-bundler.svg?logo=node.js)](https://www.npmjs.com/package/@netlify/edge-bundler)

# Edge Bundler

Intelligently prepare Netlify Edge Functions for deployment.

## Usage

1. Install this module as a dependency in your project

   ```
   npm install @netlify/edge-bundler --save
   ```

2. Import it and create a bundle from a directory of Edge Functions and a list of declarations.

   ```js
   import { bundle } from '@netlify/edge-bundler'

   // List of directories to search for Edge Functions.
   const sourceDirectories = ['/repo/netlify/edge-functions', '/repo/.netlify/edge-functions']

   // Directory where bundle should be placed.
   const distDirectory = '/repo/.netlify/edge-functions-dist'

   // List of Edge Functions declarations.
   const declarations = [
     { function: 'user-1', path: '/blog/*' },
     { function: 'internal-2', path: '/' },
   ]

   await bundle(sourceDirectories, distDirectory, declarations)
   ```

## Vendored modules

To avoid pulling in additional dependencies at runtime, this package vendors some Deno modules in the `deno/vendor`
directory.

This will go away soon as we move away from the ESZIP format.

> [!WARNING]  
> The `eszip` module contains a set of custom changes that diverge from the upstream. If you need to update this module,
> make sure to backport them.

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
