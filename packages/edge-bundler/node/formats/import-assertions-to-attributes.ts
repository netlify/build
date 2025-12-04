import { parse } from '@babel/parser'
import traverse, { type NodePath } from '@babel/traverse'
import generate, { type GeneratorResult } from '@babel/generator'
import {
  isExpression,
  isIdentifier,
  isImport,
  isObjectExpression,
  isObjectProperty,
  isStringLiteral,
} from '@babel/types'
import type {
  CallExpression,
  Expression,
  ExportAllDeclaration,
  ExportNamedDeclaration,
  Identifier,
  ImportAttribute,
  ImportDeclaration,
  ImportExpression,
  ObjectExpression,
  ObjectMember,
  ObjectProperty,
  SpreadElement,
  StringLiteral,
} from '@babel/types'

type HasImportAssertions = {
  assertions?: ImportAttribute[] | null
  attributes?: ImportAttribute[] | null
}

type ImportExpressionWithOptions = ImportExpression & {
  options?: Expression | null
}

const isImportAttributesObject = (value: Expression | null | undefined): value is ObjectExpression =>
  isObjectExpression(value)

const isImportAttributesProperty = (
  value: ObjectMember | SpreadElement,
): value is ObjectProperty & { key: Identifier | StringLiteral } =>
  isObjectProperty(value) && (isIdentifier(value.key) || isStringLiteral(value.key))

const rewriteImportOptions = (options: Expression | null | undefined): void => {
  if (!isImportAttributesObject(options)) return

  for (const prop of options.properties) {
    if (!isImportAttributesProperty(prop)) continue

    if (isIdentifier(prop.key) && prop.key.name === 'assert') {
      prop.key.name = 'with'
    } else if (isStringLiteral(prop.key) && prop.key.value === 'assert') {
      prop.key.value = 'with'
    }
  }
}

const moveAssertionsToAttributes = (node: HasImportAssertions): void => {
  const { assertions, attributes } = node
  if (!assertions?.length) return

  node.attributes = attributes?.length
    ? // Preserve any existing attributes before appending the migrated assertions.
      [...attributes, ...assertions]
    : Array.from(assertions)

  node.assertions = []
}

/**
 * Transform `assert` import attributes to `with` import attributes.
 *
 * - Static imports / re-exports: uses Babel's `assertions` -> `attributes` fields.
 * - Dynamic imports: rewrites `{ assert: { ... } }` to `{ with: { ... } }`.
 */
export function transformImportAssertionsToAttributes(code: string): string {
  const ast = parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', ['importAttributes', { deprecatedAssertSyntax: true }]],
  })

  traverse(ast, {
    ImportDeclaration(path: NodePath<ImportDeclaration>) {
      moveAssertionsToAttributes(path.node)
    },

    ExportNamedDeclaration(path: NodePath<ExportNamedDeclaration>) {
      moveAssertionsToAttributes(path.node)
    },

    ExportAllDeclaration(path: NodePath<ExportAllDeclaration>) {
      moveAssertionsToAttributes(path.node)
    },

    ImportExpression(path: NodePath<ImportExpressionWithOptions>) {
      rewriteImportOptions(path.node.options)
    },

    CallExpression(path: NodePath<CallExpression>) {
      if (!isImport(path.node.callee)) return

      const [, options] = path.node.arguments

      if (isExpression(options)) {
        rewriteImportOptions(options)
      }
    },
  })

  const output = generate(
    ast,
    {
      importAttributesKeyword: 'with',
    },
    code,
  ) as GeneratorResult

  return output.code
}
