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

You can recreate this directory by running `npm run vendor`.

> [!WARNING]  
> At the time of writing, the underlying Deno CLI command doesn't correctly pull the WASM binary required by the ESZIP
> module. If you run the command to update the list of vendores modules, please ensure you're not deleting
> `eszip_wasm_bg.wasm`.

## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
