import { promises as fs } from 'fs'

import { parse } from '@babel/parser'
import type { Program } from '@babel/types'

// Parses a JS/TS source and returns the resulting AST.
const parseSource = (source: string) => {
  const ast = parse(source, {
    plugins: ['typescript'],
    sourceType: 'module',
    // disable tokens, ranges and comments for performance and we do not use them
    tokens: false,
    ranges: false,
    attachComment: false,
  })

  return ast.program
}

// Parses a JS/TS source and returns the resulting AST. If there is a parsing
// error, it will get swallowed and `null` will be returned.
export const safelyParseSource = (source: string): Program | null => {
  try {
    return parseSource(source)
  } catch {
    return null
  }
}

// Attempts to parse a JS/TS file at the given path, returning its AST if
// successful, or `null` if not.
export const safelyReadSource = async (path: string) => {
  if (!path) {
    return null
  }

  try {
    const source = await fs.readFile(path, 'utf8')

    return source
  } catch {
    return null
  }
}
