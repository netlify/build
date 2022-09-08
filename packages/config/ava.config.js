const config = {
  files: ['tests/other.test.js', 'tests/*.{cjs,mjs,js}', 'tests/**/tests.{cjs,mjs,js}'],
  verbose: true,
  timeout: '150s',
  workerThreads: false,
  environmentVariables: {
    FORCE_COLOR: '1',
  },
  extensions: {
    js: true,
  },
}

export default config
