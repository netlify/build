import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: '.',
  test: {
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    environment: 'node',
    testTimeout: 100000,
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
    server: {
      deps: {
        // These are workspace packages symlinked from outside `node_modules`,
        // so Vite's default externalization heuristic treats them as source
        // and re-transforms them, breaking CJS/ESM interop for their
        // dependencies (e.g. `omit.js`). Force them to load as plain Node
        // modules instead.
        external: [/@netlify\/config/, /@netlify\/testing/, /packages\/config\//, /packages\/testing\//],
      },
    },
  },
})
