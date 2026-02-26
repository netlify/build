import { Parser } from 'acorn'
import { tsPlugin } from '@sveltejs/acorn-typescript'
import jsx from 'acorn-jsx'

import * as walk from 'acorn-walk'
// @ts-expect-error no corresponding types package for acorn-jsx-walk TS(7016)
import { extend } from 'acorn-jsx-walk'

const acorn = Parser.extend(tsPlugin()).extend(jsx())
// eslint-disable-next-line @typescript-eslint/no-unsafe-call
extend(walk.base)

/**
 * Given source code rewrites import assert into import with
 */
export function rewriteSourceImportAssertions(source: string): string {
  if (!source.includes('assert')) {
    return source
  }

  let modified = source

  try {
    const parsedAST = acorn.parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    })

    walk.simple(parsedAST, {
      ImportDeclaration(node) {
        const statement = source.slice(node.source.end, node.end)
        if (statement.includes('assert')) {
          const newStatement = statement.replace('assert', 'with')
          modified = modified.replace(statement, newStatement)
        }
      },
      ImportExpression(node) {
        const statement = source.slice(node.source.end, node.end)
        if (statement.includes('assert')) {
          const newStatement = statement.replace('assert', 'with')
          modified = modified.replace(statement, newStatement)
        }
      },
      ExportNamedDeclaration(node) {
        if (!node.source) return
        const statement = source.slice(node.source.end, node.end)
        if (statement.includes('assert')) {
          const newStatement = statement.replace('assert', 'with')
          modified = modified.replace(statement, newStatement)
        }
      },
    })

    return modified
  } catch (error) {
    if (!modified.includes('assert')) {
      return modified
    }
    throw error
  }
}
