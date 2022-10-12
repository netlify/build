const config = {
  files: ['test/**/*.ts', '!test/helpers'],
  verbose: true,
  extensions: {
    ts: 'module',
  },
  nodeArguments: ['--loader=ts-node/esm'],
}

export default config
