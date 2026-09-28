import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    target: 'esnext',
  },
  test: {
    include: ['node/**/*.test.ts'],
    globalSetup: ['test/global_setup.ts'],
    // Some tests download and install deno CLI, so allow some extra time for that
    testTimeout: 60_000,
    env: {
      FORCE_COLOR: '0',
    },
  },
})
