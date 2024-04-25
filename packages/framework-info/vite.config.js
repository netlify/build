import { fileURLToPath } from 'node:url'

import nodePolyfills from 'rollup-plugin-node-polyfills'

const CORE_FILE = fileURLToPath(new URL('src/core.ts', import.meta.url))

/** @type {import('vite').UserConfig} */
export default {
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      path: 'rollup-plugin-node-polyfills/polyfills/path',
    },
  },
  // Need to specify the directory because if this is invoked from the repository root,
  // the 'dist' folder is created outside of the 'framework-info' directory
  root: '.',
  publicDir: 'assets',
  build: {
    lib: {
      entry: CORE_FILE,
      name: 'frameworkInfo',
      fileName: 'index',
    },
    sourcemap: true,
    rollupOptions: {
      plugins: [nodePolyfills()],
    },
  },
}
