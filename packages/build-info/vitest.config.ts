import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
    environment: 'node',
    testTimeout: 10000,
    onConsoleLog: (log, type) => {
      process[type].write(log)
    },
  },
})
