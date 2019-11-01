export default {
  files: ['packages/**/tests/*.js'],
  compileEnhancements: false,
  babel: false,
  verbose: true,
  environmentVariables: {
    BUILD_TELEMETRY_DISABLED: 'true',
  },
}
