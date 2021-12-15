import chalk from 'chalk'

// Color theme. Please use this instead of requiring chalk directly, to ensure
// consistent colors.
export const THEME = {
  // Single lines used as subheaders
  subHeader: chalk.cyan.bold,
  // Single lines used as subheaders indicating an error
  errorSubHeader: chalk.red.bold,
  // Same for warnings
  warningLine: chalk.yellowBright,
  // One of several words that should be highlighted inside a line
  highlightWords: chalk.cyan,
}
