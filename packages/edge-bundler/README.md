[![Build](https://github.com/netlify/deno-bridge/workflows/Build/badge.svg)](https://github.com/netlify/deno-bridge/actions)
[![Node](https://img.shields.io/node/v/@netlify/deno-bridge.svg?logo=node.js)](https://www.npmjs.com/package/@netlify/deno-bridge)

# Deno Bridge

This module allows you to interact with the Deno CLI programmatically in a Node application. It's also capable of downloading the CLI on-demand and caching it for subsequent invocations.

## Usage

1. Install this module as a dependency in your project

    ```
    npm install @netlify/deno-bridge --save
    ```

2. Import it and create an instance of the Deno Bridge

    ```js
    import { DenoBridge } from '@netlify/deno-bridge'

    const deno = new DenoBridge()
    ```

3. Run a command

    ```js
    const { stdout } = await deno.run(['help'])
    ```
## Contributors

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for instructions on how to set up and work on this repository. Thanks
for contributing!
