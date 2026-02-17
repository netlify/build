import { Parser } from 'acorn'
// @ts-expect-error no declaration file for 'acorn-import-attributes'
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (node.type === 'ImportDeclaration' && (node as any).assertions !== undefined) ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        (node.type === 'ExportNamedDeclaration' && (node as any).assertions !== undefined)
      )
    })
    .forEach((node) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
      const statement = source.slice((node as any).source.end, node.end)
      const newStatement = statement.replace('assert', 'with')
      modified = modified.replace(statement, newStatement)
    })

  return modified
}
