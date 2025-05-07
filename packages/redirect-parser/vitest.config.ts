import type { BenchmarkUserOptions } from 'vitest'
import { defineConfig } from 'vitest/config'

const benchmarkOptions: BenchmarkUserOptions = {}
// Tinybench dropped support for Node 14 recently so we need to skip benchmark tests for it
// https://github.com/tinylibs/tinybench/pull/40 and
// https://github.com/tinylibs/tinybench/pull/43
// This is just a quick workaround to not run the bench tests in node 14 while we still support it
if (process.version.startsWith('v14')) {
  benchmarkOptions.exclude = ['tests/**/*.bench.ts']
}

export default defineConfig({
  test: {
    benchmark: benchmarkOptions,
    restoreMocks: true,
    environment: 'node',
  },
})
