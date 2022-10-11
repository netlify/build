const config = {
  verbose: true,
  files: ['tests/*.ts'],
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
}

export default config
