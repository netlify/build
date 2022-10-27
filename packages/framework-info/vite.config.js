import { fileURLToPath } from 'node:url'
import nodePolyfills from 'rollup-plugin-node-polyfills'

const CORE_FILE = fileURLToPath(new URL('src/core.js', import.meta.url))

/** @type {import('vite').UserConfig} */
export default {
  resolve: {
    alias: {
      path: 'rollup-plugin-node-polyfills/polyfills/path',
    },
  },
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
