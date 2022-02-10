[![Build](https://github.com/netlify/edge-bundler/workflows/Build/badge.svg)](https://github.com/netlify/edge-bundler/actions)
[![Node](https://img.shields.io/node/v/@netlify-labs/edge-bundler.svg?logo=node.js)](https://www.npmjs.com/package/@netlify-labs/edge-bundler)

# Edge Bundler

Intelligently prepare Netlify Edge Handlers for deployment.

## Usage

1. Install this module as a dependency in your project

    ```
    npm install @netlify-labs/edge-bundler --save
    ```

2. Import it and create a bundle from a directory of Edge Handlers and a list of declarations.

    ```js
    import { bundle } from '@netlify-labs/edge-bundler'

    // List of directories to search for Edge Handlers.
    const sourceDirectories = [
        "/repo/netlify/edge-handlers",
        "/repo/.netlify/edge-handlers"
    ]

    // Directory where bundle should be placed.
    const distDirectory = "/repo/.netlify/edge-handlers-dist"

    // List of Edge Handlers declarations.
    const declarations = [
        {handler: "user-1", path: "/blog/*"},
        {handler: "internal-2", path: "/"}
    ]

    await bundle(sourceDirectories, distDirectory, declarations)
    ```
## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
