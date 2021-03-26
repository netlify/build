'use strict'

const {
  cyanBright: { bold: cyanBrightBold },
  cyan: { bold: cyanBold },
  cyan,
  redBright: { bold: redBrightBold },
  redBright,
  red: { bold: redBold },
  yellowBright: { bold: yellowBrightBold },
  yellowBright,
  yellow: { bold: yellowBold },
  gray,
} = require('chalk')

// Color theme. Please use this instead of requiring chalk directly, to ensure
// consistent colors.
const THEME = {
  // Main headers
  header: cyanBrightBold,
  // Single lines used as subheaders
  subHeader: cyanBold,
  // One of several words that should be highlighted inside a line
  highlightWords: cyan,
  // Same for errors
  errorHeader: redBrightBold,
  errorSubHeader: redBold,
  errorLine: redBright,
  errorHighlightWords: redBrightBold,
  // Same for warnings
  warningHeader: yellowBrightBold,
  warningSubHeader: yellowBold,
  warningLine: yellowBright,
  warningHighlightWords: yellowBrightBold,
  // One of several words that should be dimmed inside a line
  dimWords: gray,
  // No colors
  none: (string) => string,
}

module.exports = { THEME }
