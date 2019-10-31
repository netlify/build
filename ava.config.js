export default {
  files: ['packages/**/*.test.js'],
  compileEnhancements: false,
  babel: false,
  verbose: true,
  environmentVariables: {
    BUILD_TELEMETRY_DISABLED: 'true',
  },
  serial: Boolean(process.env.GITHUB_ACTION),
}
