const config = {
  files: ['tests/*.ts', '!tests/helpers'],
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
  verbose: true,
  workerThreads: false,
  timeout: '240s',
}

export default config
