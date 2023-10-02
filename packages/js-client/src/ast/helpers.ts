import { camelCase, upperFirst } from 'lodash-es'
import ts from 'typescript'

import type { Parameter, Property } from './open-api.js'

const PROPERTY_NEEDS_QUOTES_REGEX = /[^a-zA-Z_$]|^[^a-zA-Z_$]|[\W_]\d/

export function printNode(node?: ts.Node): string {
  if (!node) {
    return ''
  }
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed })
  return printer.printNode(ts.EmitHint.Unspecified, node, node.getSourceFile())
}

export function createType<T extends Property>(schema: T): ts.TypeNode | undefined {
  if (typeof schema === 'object' && 'schema' in schema && schema.schema && typeof schema.schema === 'object') {
    //

    if (typeof schema.schema === 'object' && 'allOf' in schema.schema && Array.isArray(schema.schema.allOf)) {
      // merge all schema.allOf properties in one object
      const properties: ts.PropertySignature[] = []
      for (const part of schema.schema.allOf) {
        if ('properties' in part) {
          for (const [key, value] of Object.entries(part.properties || {})) {
            properties.push(createTypeProperty(value, key))
          }
        } else {
          throw new Error('not implemented')
        }
      }
      return ts.factory.createTypeLiteralNode(properties)
    }
    // if there is no schema.schema.allOf it's an object schema so create the type of it
    return createType(schema.schema)
  }

  if (typeof schema === 'object' && 'type' in schema) {
    if ('enum' in schema && Array.isArray(schema.enum)) {
      const members = schema.enum.map((type) => {
        switch (typeof type) {
          case 'string':
            return ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(type))
        }
      })
      return ts.factory.createUnionTypeNode(members)
    }

    switch (schema.type) {
      case 'string':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.StringKeyword)
      case 'number':
      case 'integer':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.NumberKeyword)
      case 'boolean':
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.BooleanKeyword)
      case 'array':
        if ('items' in schema && schema.items && typeof schema.items === 'object') {
          const childType = createType(schema.items)
          return childType && ts.factory.createArrayTypeNode(childType)
        }
        return ts.factory.createArrayTypeNode(ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword))
      case 'object':
        if ('properties' in schema && schema.properties && typeof schema.properties === 'object') {
          return createTypeFromSchema(schema.properties)
        }
        return ts.factory.createKeywordTypeNode(ts.SyntaxKind.ObjectKeyword)
    }
  }
}

export function createTypeProperty(schema: object, name: string, options: { required?: boolean } = {}) {
  const required =
    options.required !== undefined
      ? options.required
      : typeof schema === 'object' && 'required' in schema && schema.required === true
  const propertySignature = ts.factory.createPropertySignature(
    undefined,
    PROPERTY_NEEDS_QUOTES_REGEX.test(name) ? ts.factory.createStringLiteral(name) : name,
    !required ? ts.factory.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    createType(schema),
  )

  if ('description' in schema && typeof schema.description === 'string') {
    ts.addSyntheticLeadingComment(
      propertySignature,
      ts.SyntaxKind.MultiLineCommentTrivia,
      `* ${schema.description} `, // multilineCommentTrivia does not use a correct jsdoc annotation
      true,
    )
  }

  return propertySignature
}

/** Filters a property signature list and removes duplicates */
function filterForUniqueProperties(properties: ts.PropertySignature[]): ts.PropertySignature[] {
  const uniquePropertyNames = new Set<string>()
  return properties.filter((prop) => {
    if (ts.isPropertySignature(prop) && prop.name && ts.isIdentifier(prop.name)) {
      const propertyName = prop.name.text
      if (uniquePropertyNames.has(propertyName)) {
        return false // Duplicate found, ignore this member
      }
      uniquePropertyNames.add(propertyName)
    }
    return true // Keep this member
  })
}

/**
 * Creates a type literal node from a swagger schema object
 */
export function createTypeFromSchema<T extends object>(schema: T) {
  const properties: ts.PropertySignature[] = []
  for (const [key, value] of Object.entries(schema || {})) {
    properties.push(createTypeProperty(value, key))
  }
  return ts.factory.createTypeLiteralNode(filterForUniqueProperties(properties))
}

export function createMethodParams(params: Parameter[] = []) {
  if (params.length === 0) return []
  const isOptional = params.every((param) => !param.required)

  const properties: ts.PropertySignature[] = params.flatMap((param) => {
    if ('schema' in param && param.schema && 'properties' in param.schema && param.schema.properties) {
      return Object.entries(param.schema.properties || {}).map(([key, value]) => createTypeProperty(value, key))
    }
    return createTypeProperty(param, param.name)
  })

  return [
    ts.factory.createParameterDeclaration(
      undefined,
      undefined,
      'config',
      undefined,
      ts.factory.createTypeLiteralNode(filterForUniqueProperties(properties)),
      isOptional ? ts.factory.createObjectLiteralExpression() : undefined,
    ),
  ]
}

export function createReturnType(
  operationName: string,
  responses: Record<string, Property> = {},
): [ts.TypeAliasDeclaration | undefined, ts.TypeReferenceNode] {
  const [, response] = Object.entries(responses || {}).find(([key]) => key !== 'default') || []

  if (response) {
    const responseType = createType(response)
    if (responseType) {
      const typeName = `${upperFirst(camelCase(operationName))}Response`
      const typeAlias = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        typeName,
        undefined,
        responseType,
      )
      return [
        typeAlias,
        // wrap the return type in a promise
        ts.factory.createTypeReferenceNode('Promise', [ts.factory.createTypeReferenceNode(typeName, undefined)]),
      ]
    }
  }
  return [
    undefined,
    ts.factory.createTypeReferenceNode('Promise', [ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)]),
  ]
}
