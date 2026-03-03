import { Parser } from 'acorn'
import { tsPlugin } from '@sveltejs/acorn-typescript'

import * as walk from 'acorn-walk'

const acorn = Parser.extend(tsPlugin({ jsx: true }))

/**
 * Given source code rewrites import assert into import with
 */
export function rewriteSourceImportAssertions(source: string): string {
  if (!source.includes('assert')) {
    return source
  }

  let modified = source

  const edits: { start: number; end: number; text: string }[] = []
  const queueRewrite = (start: number, end: number) => {
    const statement = source.slice(start, end)
    if (statement.includes('assert')) {
      edits.push({
        start,
        end,
        text: statement.replace('assert', 'with'),
      })
    }
  }

  try {
    const parsedAST = acorn.parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'module',
      locations: true,
    })

    walk.simple(
      parsedAST,
      {
        ImportDeclaration(node) {
          queueRewrite(node.source.end, node.end)
        },
        ImportExpression(node) {
          queueRewrite(node.source.end, node.end)
        },
        ExportNamedDeclaration(node) {
          if (!node.source) return
          queueRewrite(node.source.end, node.end)
        },
        ExportAllDeclaration(node) {
          queueRewrite(node.source.end, node.end)
        },
      },
      acornWalkBaseExtended,
    )

    // Bulk replacement of import assertions
    for (const edit of edits.sort((a, b) => b.start - a.start)) {
      modified = `${modified.slice(0, edit.start)}${edit.text}${modified.slice(edit.end)}`
    }

    return modified
  } catch (error) {
    if (!modified.includes('assert')) {
      return modified
    }
    throw error
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/prefer-for-of */

const TS_NODE_TYPES = [
  'TSAnyKeyword',
  'TSArrayType',
  'TSAsExpression',
  'TSBigIntKeyword',
  'TSBooleanKeyword',
  'TSConstructSignatureDeclaration',
  'TSDeclareFunction',
  'TSDeclareMethod',
  'TSEnumDeclaration',
  'TSEnumMember',
  'TSExpressionWithTypeArguments',
  'TSFunctionType',
  'TSIndexedAccessType',
  'TSInterfaceBody',
  'TSInterfaceDeclaration',
  'TSIntersectionType',
  'TSLiteralType',
  'TSMappedType',
  'TSModuleBlock',
  'TSModuleDeclaration',
  'TSNamedTupleMember',
  'TSNeverKeyword',
  'TSNonNullExpression',
  'TSNullKeyword',
  'TSNumberKeyword',
  'TSObjectKeyword',
  'TSParameterProperty',
  'TSParenthesizedType',
  'TSPropertySignature',
  'TSQualifiedName',
  'TSRestType',
  'TSSatisfiesExpression',
  'TSStringKeyword',
  'TSSymbolKeyword',
  'TSTupleType',
  'TSTypeAliasDeclaration',
  'TSTypeAnnotation',
  'TSTypeAssertion',
  'TSTypeLiteral',
  'TSTypeOperator',
  'TSTypeParameter',
  'TSTypeParameterDeclaration',
  'TSTypeParameterInstantiation',
  'TSTypeQuery',
  'TSTypeReference',
  'TSUndefinedKeyword',
  'TSUnionType',
  'TSUnknownKeyword',
  'TSVoidKeyword',
]

// A base visitor that ignores node types unknown to acorn-walk (JSX, TypeScript, etc.)
const acornWalkBaseExtended: walk.RecursiveVisitors<unknown> = new Proxy(walk.base, {
  get(target: Record<string, unknown>, prop: string): any {
    if (prop in target) {
      return target[prop]
    }

    // Skip all TS nodes
    if (TS_NODE_TYPES.includes(prop)) {
      return () => {}
    }

    switch (prop) {
      // Definitions for elements with an acorn-walk equivalent
      case 'JSXExpressionContainer':
      case 'JSXSpreadChild':
        return walk.base.ExpressionStatement
      case 'JSXClosingFragment':
      case 'JSXEmptyExpression':
      case 'JSXIdentifier':
      case 'JSXOpeningFragment':
      case 'JSXText':
        return walk.base.Identifier
      case 'JSXSpreadAttribute':
        return walk.base.SpreadElement

      // Definitions for elements with custom handling
      case 'JSXAttribute':
        // @ts-expect-error node, state, callback have implicit any type TS(7006)
        return (node, state, callback) => {
          callback(node.name, state)
          if (node.value) callback(node.value, state)
        }
      case 'JSXMemberExpression':
        // @ts-expect-error node, state, callback have implicit any type TS(7006)
        return (node, state, callback) => {
          callback(node.object, state)
          callback(node.property, state)
        }
      case 'JSXNamespacedName':
        // @ts-expect-error node, state, callback have implicit any type TS(7006)
        return (node, state, callback) => {
          callback(node.namespace, state)
          callback(node.name, state)
        }
      case 'JSXOpeningElement':
        // @ts-expect-error node, state, callback have implicit any type TS(7006)
        return (node, state, callback) => {
          callback(node.name, state)
          for (let i = 0; i < node.attributes.length; ++i) {
            callback(node.attributes[i], state)
          }
        }
      case 'JSXClosingElement':
        // @ts-expect-error node, state, callback have implicit any type TS(7006)
        return (node, state, callback) => {
          callback(node.name, state)
        }
      case 'JSXElement':
        // @ts-expect-error node, state, callback have implicit any type TS(7006)
        return (node, state, callback) => {
          callback(node.openingElement, state)
          for (let i = 0; i < node.children.length; ++i) {
            callback(node.children[i], state)
          }
          if (node.closingElement) callback(node.closingElement, state)
        }
      case 'JSXFragment':
        // @ts-expect-error node, state, callback have implicit any type TS(7006)
        return (node, state, callback) => {
          callback(node.openingFragment, state)
          for (let i = 0; i < node.children.length; ++i) {
            callback(node.children[i], state)
          }
          callback(node.closingFragment, state)
        }

      default:
        throw new Error(`Acorn walk has no handling for node of type ${prop}`)
    }
  },
})
