import chalk from 'chalk'

// Color theme. Please use this instead of requiring chalk directly, to ensure
// consistent colors.
export const THEME = {
  // Main headers
  header: chalk.cyanBright.bold,
  // Single lines used as subheaders
  subHeader: chalk.cyan.bold,
  // One of several words that should be highlighted inside a line
  highlightWords: chalk.cyan,
  // Same for errors
  errorHeader: chalk.redBright.bold,
  errorSubHeader: chalk.red.bold,
  errorLine: chalk.redBright,
  errorHighlightWords: chalk.redBright.bold,
  // Same for warnings
  warningHeader: chalk.yellowBright.bold,
  warningSubHeader: chalk.yellow.bold,
  warningLine: chalk.yellowBright,
  warningHighlightWords: chalk.yellowBright.bold,
  // One of several words that should be dimmed inside a line
  dimWords: chalk.gray,
  // No colors
  none: (string) => string,
}
