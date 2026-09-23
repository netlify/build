import { styleText } from 'node:util'

/** Colors for log output. Use these rather than `styleText` directly, so colors stay consistent. */
export const THEME = {
  /** Single lines used as subheaders */
  subHeader: (text: string) => styleText(['cyan', 'bold'], text),
  /** Single lines used as subheaders indicating an error */
  errorSubHeader: (text: string) => styleText(['red', 'bold'], text),
  /** Warning lines */
  warningLine: (text: string) => styleText('yellowBright', text),
  /** Words to highlight inside a line */
  highlightWords: (text: string) => styleText('cyan', text),
}
