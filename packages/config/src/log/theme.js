const {
  cyan: { bold: cyanBold },
} = require('chalk')

// Color theme. Please use this instead of requiring chalk directly, to ensure
// consistent colors.
const THEME = {
  // Single lines used as subheaders
  subHeader: cyanBold,
}

module.exports = { THEME }
