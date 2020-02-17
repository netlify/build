// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINE = '\u{200b}'

module.exports = { EMPTY_LINE }
