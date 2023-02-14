import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    environment: 'node',
    testTimeout: 10000,
    // onConsoleLog: (log, type) => {
    //   process[type].write(log)
    // },
    setupFiles: ['tests/test-setup.ts'],
    deps: {
      // this is to work inside memfs as well
      inline: ['find-up', 'locate-path'],
    },
  },
})
