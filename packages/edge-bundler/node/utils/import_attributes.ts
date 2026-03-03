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

  // try {
  const parsedAST = acorn.parse(source, {
    ecmaVersion: 'latest',
    sourceType: 'module',
    locations: true,
  })

  const statements = collectImportAssertions(source, parsedAST)
  console.log('statements', statements)

  // Bulk replacement of import assertions
  for (const statement of statements.sort((a, b) => b.start - a.start)) {
    modified = `${modified.slice(0, statement.start)}${statement.text}${modified.slice(statement.end)}`
  }

  return modified
  // } catch (error) {
  //   if (!modified.includes('assert')) {
  //     return modified
  //   }
  //   throw error
  // }
}

type StatementsWithAssertions = ImportDeclaration | ImportExpression | ExportAllDeclaration | ExportNamedDeclaration
type ImportReplacement = { start: number; end: number; text: string }

function collectImportAssertions(source: string, node: Node): ImportReplacement[] {
  let collectedNodes: ImportReplacement[] = []

  // console.log(node.type)
  // console.log(Object.keys(node))

  const assertionNodeTypes = ['ImportDeclaration', 'ImportExpression', 'ExportAllDeclaration', 'ExportNamedDeclaration']
  if (assertionNodeTypes.includes(node.type)) {
    const parsedImportNode = parseImportAssertion(source, node as StatementsWithAssertions)
    if (parsedImportNode !== undefined) {
      collectedNodes.push(parsedImportNode)
    }

    // console.log(node)
  }

  // const dynamicAssertionNodeTypes = ['VariableDeclaration']
  // if (dynamicAssertionNodeTypes.includes(node.type)) {
  //   console.log(node)
  //   // const parsedImportNode = parseImportAssertion(source, node as StatementsWithAssertions)
  //   // if (parsedImportNode !== undefined) {
  //   //   collectedNodes.push(parsedImportNode)
  //   // }

  //   // @ts-expect-error node.body + node.declarations are not defined for all node types
  //   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  //   for (const child of [...(node.body ?? []), ...(node.declarations ?? [])] as Node[]) {
  //     const childNodes = collectImportAssertions(source, child)
  //     collectedNodes.concat(childNodes)
  //   }
  // }

  // @ts-expect-error node.body + node.declarations are not defined for all node types
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  for (const child of [...(node.body ?? [])] as Node[]) {
    // for (const child of [...(node.body ?? []), ...(node.declarations ?? [])] as Node[]) {
    const childNodes = collectImportAssertions(source, child)
    collectedNodes = collectedNodes.concat(childNodes)
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
