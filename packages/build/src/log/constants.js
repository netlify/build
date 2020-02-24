const { tick, pointer, arrowDown } = require('figures')

// We need to add a zero width space character in empty lines. Otherwise the
// buildbot removes those due to a bug: https://github.com/netlify/buildbot/issues/595
const EMPTY_LINE = '\u{200b}'

const TICK = tick
const HEADING_PREFIX = pointer
const ARROW_DOWN = arrowDown
const INDENT_SIZE = 2
const SUBTEXT_PADDING = ' '.repeat(INDENT_SIZE)

module.exports = { EMPTY_LINE, HEADING_PREFIX, SUBTEXT_PADDING, TICK, ARROW_DOWN, INDENT_SIZE }
