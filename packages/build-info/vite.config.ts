import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: '.',
  publicDir: 'assets',
  test: {
    restoreMocks: true,
    clearMocks: true,
    mockReset: true,
    environment: 'node',
    testTimeout: 100000,
    // onConsoleLog: (log, type) => {
    //   process[type].write(log)
    // },
    setupFiles: ['tests/test-setup.ts'],
    deps: {
      // this is to work inside memfs as well
      inline: ['empathic', 'locate-path'],
    },
  },
})
