import stripAnsi from 'strip-ansi'

// Remove ANSI sequences from `error.message`
export const removeErrorColors = function (error) {
  if (!(error instanceof Error)) {
    return
  }

  error.message = stripAnsi(error.message)
  error.stack = stripAnsi(error.stack)
}
