import type { BenchmarkUserOptions } from 'vitest'
import { defineConfig } from 'vitest/config'

const benchmarkOptions: BenchmarkUserOptions = {}

export default defineConfig({
  test: {
    benchmark: benchmarkOptions,
    restoreMocks: true,
    environment: 'node',
  },
})
