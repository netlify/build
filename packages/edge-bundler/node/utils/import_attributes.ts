import { Parser } from 'acorn'
import { tsPlugin } from '@sveltejs/acorn-typescript'
import jsx from 'acorn-jsx'

const acorn = Parser.extend(tsPlugin()).extend(jsx())

/**
 * Given source code rewrites import assert into import with
 */
export function rewriteSourceImportAssertions(source: string): string {
  if (!source.includes('assert')) {
    return source
  }

  let modified = source

  const parsedAST = acorn.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })

  parsedAST.body.forEach((node) => {
    if ((node.type === 'ImportDeclaration' || node.type === 'ExportNamedDeclaration') && node.source) {
      const statement = source.slice(node.source.end, node.end)
      if (statement.includes('assert')) {
        const newStatement = statement.replace('assert', 'with')
        modified = modified.replace(statement, newStatement)
      }
    }
  })

  return modified
}
