import { Parser } from 'acorn'
import { importAttributesOrAssertions } from 'acorn-import-attributes'

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
const acorn = Parser.extend(importAttributesOrAssertions)

/**
 * Given source code rewrites import assert into import with
 */
export function rewriteSourceImportAssertions(source: string): string {
  let modified = source

  const parsedAST = acorn.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
  })

  parsedAST.body
    .filter((node) => {
      return (
        (node.type === 'ImportDeclaration' && node.assertions !== undefined) ||
        (node.type === 'ExportNamedDeclaration' && node.assertions !== undefined)
      )
    })
    .forEach((node) => {
      const statement = source.slice(node.source.end, node.end)
      const newStatement = statement.replace('assert', 'with')
      modified = modified.replace(statement, newStatement)
    })

  return modified
}
