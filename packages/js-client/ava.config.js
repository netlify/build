const config = {
  files: ['src/*.test.ts'],
  verbose: true,
  workerThreads: false,
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
}

export default config
