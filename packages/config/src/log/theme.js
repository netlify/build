const {
  cyan: { bold: cyanBold },
  cyan,
  red: { bold: redBold },
} = require('chalk')

// Color theme. Please use this instead of requiring chalk directly, to ensure
// consistent colors.
const THEME = {
  // Single lines used as subheaders
  subHeader: cyanBold,
  // Single lines used as subheaders indicating an error
  errorSubHeader: redBold,
  // One of several words that should be highlighted inside a line
  highlightWords: cyan,
}

module.exports = { THEME }
