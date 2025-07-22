import type { BenchmarkUserOptions } from 'vitest/node'
import { defineConfig } from 'vitest/config'

const benchmarkOptions: BenchmarkUserOptions = {}

export default defineConfig({
  test: {
    benchmark: benchmarkOptions,
    restoreMocks: true,
    environment: 'node',
  },
})
