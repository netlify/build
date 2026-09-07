import { realpathSync } from 'fs'
import { tmpdir } from 'os'

import { defineConfig } from 'vitest/config'

const tempDirPaths = [tmpdir(), realpathSync.native(tmpdir())]
const tempDirPatterns = tempDirPaths.map(
  (dir) => new RegExp(dir.replaceAll('\\', '/').replace(/[.*+?^${}()|[\]]/g, '\\$&'), 'i'),
)

export default defineConfig({
  test: {
    setupFiles: ['./tests/helpers/vitest_setup.ts'],
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    testTimeout: 90_000,
    deps: {
      // Disable vitest handling of imports to these paths, especially the tmpdir is important as we extract functions to there
      // and then import them and we want them to be handled as normal Node.js imports without any vite magic
      external: [/\/fixtures\//, /\/fixtures-esm\//, /\/node_modules\//, /\/dist\//, ...tempDirPatterns],
      interopDefault: false,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
  },
})
