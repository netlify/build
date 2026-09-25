import { Parser, Node } from 'acorn'
import type {
  ExportAllDeclaration,
  ExportNamedDeclaration,
  ImportDeclaration,
  ImportExpression,
  Options as AcornOptions,
  Program,
} from 'acorn'
import { tsPlugin } from '#acorn-typescript'

const acornNoJSX = Parser.extend(tsPlugin({ jsx: false }))
const acornJSX = Parser.extend(tsPlugin({ jsx: true }))
const acornDts = Parser.extend(tsPlugin({ dts: true }))

const parseOptions: AcornOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  locations: true,
}

// The file extensions Deno treats as TypeScript declaration files.
const DECLARATION_FILE = /\.d\.[cm]?ts$/

export const isDeclarationFile = (path: string) => DECLARATION_FILE.test(path)

export const parseAST = (source: string, { isDeclaration = false } = {}): Program => {
  // Declaration files are an ambient context, where syntax such as a `const`
  // without an initializer is valid, so they need the parser's `dts` mode.
  if (isDeclaration) {
    return acornDts.parse(source, parseOptions)
  }

  try {
    return acornJSX.parse(source, parseOptions)
  } catch (error) {
    // for non-jsx typescript casting to type via "<type> value" (normally done with "value as type") will throw an "Unexpected token" error in acorn-jsx,
    // but is valid syntax in TypeScript. In this case, we can retry parsing with the non-jsx parser.
    if (error instanceof SyntaxError) {
      return acornNoJSX.parse(source, parseOptions)
    }
    throw error
  }
}

/**
 * Given source code rewrites import assert into import with
 */
export function rewriteSourceImportAssertions(source: string, options: { isDeclaration?: boolean } = {}): string {
  if (!source.includes('assert')) {
    return source
  }

  let modified = source

  try {
    const parsedAST = parseAST(source, options)

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
    return node.filter(isNode).flatMap((n) => collectImportAssertions(source, n))
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

function isNode(arg: unknown): arg is Node {
  return typeof arg === 'object' && arg !== null && 'type' in arg
}
