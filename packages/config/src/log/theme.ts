import chalk from 'chalk'

/** Colors for log output. Use these rather than `chalk` directly, so colors stay consistent. */
export const THEME = {
  /** Single lines used as subheaders */
  subHeader: chalk.cyan.bold,
  /** Single lines used as subheaders indicating an error */
  errorSubHeader: chalk.red.bold,
  /** Warning lines */
  warningLine: chalk.yellowBright,
  /** Words to highlight inside a line */
  highlightWords: chalk.cyan,
}
