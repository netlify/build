const stringWidth = require('string-width')

// Print a rectangular header
const getHeader = function(message) {
  const messageWidth = stringWidth(message)
  const headerWidth = Math.max(HEADER_MIN_WIDTH, messageWidth + MIN_PADDING * 2)
  const line = '─'.repeat(headerWidth)
  const paddingWidth = (headerWidth - messageWidth) / 2
  const paddingLeft = ' '.repeat(Math.floor(paddingWidth))
  const paddingRight = ' '.repeat(Math.ceil(paddingWidth))
  return `┌${line}┐
│${paddingLeft}${message}${paddingRight}│
└${line}┘`
}

const HEADER_MIN_WIDTH = 29
const MIN_PADDING = 1

module.exports = { getHeader }
