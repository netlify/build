const config = {
  files: ['src/**/*.test.ts'],
  timeout: '240s',
  verbose: true,
  workerThreads: false,
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
}

export default config
