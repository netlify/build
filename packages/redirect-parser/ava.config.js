const config = {
  files: ['tests/*.ts', '!tests/helpers'],
  verbose: true,
  timeout: '240s',
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
}

export default config
