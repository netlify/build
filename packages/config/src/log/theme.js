'use strict'

const {
  cyan: { bold: cyanBold },
  cyan,
  red: { bold: redBold },
  yellowBright,
} = require('chalk')

// Color theme. Please use this instead of requiring chalk directly, to ensure
// consistent colors.
const THEME = {
  // Single lines used as subheaders
  subHeader: cyanBold,
  // Single lines used as subheaders indicating an error
  errorSubHeader: redBold,
  // Same for warnings
  warningLine: yellowBright,
  // One of several words that should be highlighted inside a line
  highlightWords: cyan,
}

module.exports = { THEME }
