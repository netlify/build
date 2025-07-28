import { stripVTControlCharacters } from 'node:util'

// Remove ANSI sequences from `error.message`
export const removeErrorColors = function (error) {
  if (!(error instanceof Error)) {
    return
  }

  // Setting error values might fail if they are getters or are non-writable.
  try {
    error.message = stripVTControlCharacters(error.message)
    error.stack = stripVTControlCharacters(error.stack)
  } catch {
    // continue
  }
}
