/// <reference types="vitest" />
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    target: 'esnext',
  },
  test: {
    include: ['node/**/*.test.ts'],
    testTimeout: 15_000,
  },
})
