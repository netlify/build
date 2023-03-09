import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    environment: 'node',
    testTimeout: 100000,
    include: ['src/**/*.test.ts'],
  },
})
