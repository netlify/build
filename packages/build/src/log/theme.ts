import * as colors from 'ansis'

/**
 * Color theme. Please use this instead of requiring ansis directly,
 * to ensure consistent colors.
 */
export const THEME = {
  // Main headers
  header: colors.cyanBright.bold,
  // Single lines used as sub-headers
  subHeader: colors.cyan.bold,
  // One of several words that should be highlighted inside a line
  highlightWords: colors.cyan,
  // Same for errors
  errorHeader: colors.redBright.bold,
  errorSubHeader: colors.red.bold,
  errorLine: colors.redBright,
  errorHighlightWords: colors.redBright.bold,
  // Same for warnings
  warningHeader: colors.yellowBright.bold,
  warningSubHeader: colors.yellow.bold,
  warningLine: colors.yellowBright,
  warningHighlightWords: colors.yellowBright.bold,
  // One of several words that should be dimmed inside a line
  dimWords: colors.gray,
  // No colors
  none: (string) => string,
}
