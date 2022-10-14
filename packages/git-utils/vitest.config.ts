import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
    environment: 'node',
    onConsoleLog: (log, type) => {
      process[type].write(log)
    },
  },
})
