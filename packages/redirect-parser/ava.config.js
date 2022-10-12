const config = {
  files: ['tests/*.ts'],
  verbose: true,
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
}

export default config
