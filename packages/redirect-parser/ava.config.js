const config = {
  files: ['tests/*.ts', '!tests/helpers'],
  verbose: true,
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
}

export default config
