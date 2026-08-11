import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
    environment: 'node',
    testTimeout: 100_000,
    include: ['tests/**/*.test.{js,ts}'],
    exclude: ['**/fixtures/**', '**/node_modules/**'],
  },
})
