export default {
  files: ['packages/**/tests/*.js', 'packages/**/tests/**/tests.js', 'packages/**/tests/*.js'],
  compileEnhancements: false,
  babel: false,
  verbose: true,
  environmentVariables: {
    BUILD_TELEMETRY_DISABLED: 'true',
  },
}
