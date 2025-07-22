import stripAnsi from 'strip-ansi'

// Remove ANSI sequences from `error.message`
export const removeErrorColors = function (error) {
  if (!(error instanceof Error)) {
    return
  }

  // Setting error values might fail if they are getters or are non-writable.
  try {
    error.message = stripAnsi(error.message)
    error.stack = stripAnsi(error.stack)
  } catch {
    // continue
  }
}
