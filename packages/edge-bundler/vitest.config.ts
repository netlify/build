import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    target: 'esnext',
  },
  test: {
    include: ['node/**/*.test.ts'],
    testTimeout: 30_000,
    env: {
      FORCE_COLOR: '0',
    },
  },
})
