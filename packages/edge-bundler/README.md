[![Build](https://github.com/netlify/edge-bundler/workflows/Build/badge.svg)](https://github.com/netlify/edge-bundler/actions)
[![Node](https://img.shields.io/node/v/@netlify/edge-bundler.svg?logo=node.js)](https://www.npmjs.com/package/@netlify/edge-bundler)

# Edge Bundler

This module allows you to interact with the Deno CLI programmatically in a Node application. It's also capable of downloading the CLI on-demand and caching it for subsequent invocations.

## Usage

1. Install this module as a dependency in your project

    ```
    npm install @netlify/edge-bundler --save
    ```

2. Import it and create an instance of the Deno Bridge

    ```js
    import { DenoBridge } from '@netlify/edge-bundler'

    const deno = new DenoBridge()
    ```

3. Run a command

    ```js
    const { stdout } = await deno.run(['help'])
    ```
## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
