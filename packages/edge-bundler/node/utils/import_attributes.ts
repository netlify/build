import { Parser, Node } from 'acorn'
import type { ExportAllDeclaration, ExportNamedDeclaration, ImportDeclaration, ImportExpression } from 'acorn'
import { tsPlugin } from '@sveltejs/acorn-typescript'

const acorn = Parser.extend(tsPlugin({ jsx: true }))

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
      locations: true,
    })

    const statements = collectImportAssertions(source, parsedAST.body)

    // Bulk replacement of import assertions
    for (const statement of statements.sort((a, b) => b.start - a.start)) {
      modified = `${modified.slice(0, statement.start)}${statement.text}${modified.slice(statement.end)}`
    }

    return modified
  } catch (error) {
    if (!modified.includes('assert')) {
      return modified
    }

    throw error
  }
}

type StatementsWithAssertions = ImportDeclaration | ImportExpression | ExportAllDeclaration | ExportNamedDeclaration
type ImportReplacement = { start: number; end: number; text: string }

function collectImportAssertions(source: string, node: Node | Node[]): ImportReplacement[] {
  const collectedNodes: ImportReplacement[] = []

  if (Array.isArray(node)) {
    return node.flatMap((n) => collectImportAssertions(source, n))
  }

  // Capture all import assertion statements
  const assertionNodeTypes = ['ImportDeclaration', 'ImportExpression', 'ExportAllDeclaration', 'ExportNamedDeclaration']
  if (assertionNodeTypes.includes(node.type)) {
    const parsedImportNode = parseImportAssertion(source, node as StatementsWithAssertions)
    if (parsedImportNode !== undefined) {
      return [parsedImportNode]
    }
  }

  // Fallthrough tree traversal + support for dynamic imports and JSX syntax
  for (const [key, value] of Object.entries(node)) {
    if (['loc', 'typeName'].includes(key)) continue
    if (value === null) continue
    if (typeof value === 'object') {
      const childNodes = collectImportAssertions(source, value as Node | Node[])
      collectedNodes.push(...childNodes)
    }
  }

  return collectedNodes
}

function parseImportAssertion(
  source: string,
  node: ImportDeclaration | ImportExpression | ExportAllDeclaration | ExportNamedDeclaration,
): ImportReplacement | undefined {
  if (!node.source) return undefined

  const statement = source.slice(node.source.end, node.end)
  if (!statement.includes('assert')) return undefined

  return {
    start: node.source.end,
    end: node.end,
    text: statement.replace('assert', 'with'),
  }
}
