import { styleText } from 'node:util'

// Color theme. Please use this instead of requiring styleText directly, to ensure
// consistent colors.
export const THEME = {
  // Single lines used as subheaders
  subHeader: (string) => styleText(['cyan', 'bold'], string),
  // Single lines used as subheaders indicating an error
  errorSubHeader: (string) => styleText(['red', 'bold'], string),
  // Same for warnings
  warningLine: (string) => styleText('yellowBright', string),
  // One of several words that should be highlighted inside a line
  highlightWords: (string) => styleText('cyan', string),
}
