import { writeFile } from 'fs/promises'

import swagger from '@netlify/open-api/dist/swagger.json' assert { type: 'json' }
import prettier from 'prettier'
import ts from 'typescript'

import { createMethodParams, createReturnType, printNode } from './ast/helpers.js'

// Our template where we will add the methods
const code = `
import { BaseAuth, type APIOptions } from './base-api.js';

export class NetlifyAPI extends BaseAuth {
  constructor(options?: APIOptions)
  constructor(accessToken: string | undefined, options?: APIOptions)
  constructor(firstArg: string | undefined | APIOptions, secondArg?: APIOptions) {
    super(firstArg, secondArg);
  }
}
`

const sourceFile = ts.createSourceFile('index.ts', code, ts.ScriptTarget.ESNext, true, ts.ScriptKind.TS)

function updateAPIWithSwagger(sourceFile: ts.SourceFile) {
  const statements: ts.Statement[] = []
  const index = sourceFile.statements.findIndex(ts.isClassDeclaration)
  const apiClass = index > -1 ? (sourceFile.statements[index] as ts.ClassDeclaration) : undefined
  if (apiClass && apiClass.name?.text === 'NetlifyAPI') {
    const methods: ts.MethodDeclaration[] = []

    for (const [, actions] of Object.entries(swagger.paths || {})) {
      for (const [, operation] of Object.entries(actions)) {
        // if (operation.operationId !== 'uploadDeployFile') {
        //   continue
        // }

        if (operation.operationId?.length) {
          const [typeAlias, returnType] = createReturnType(operation.operationId, operation.responses) || []
          if (typeAlias) {
            statements.push(typeAlias)
          }
          methods.push(
            ts.factory.createMethodDeclaration(
              undefined,
              undefined,
              operation.operationId,
              undefined,
              undefined,
              createMethodParams([...(operation.parameters || []), ...((actions as any).parameters || [])]),
              returnType,
              ts.factory.createBlock([], true),
            ),
          )
        }
      }
    }

    // update the class declaration with the newly created methods
    const updatedClassDeclaration = ts.factory.updateClassDeclaration(
      apiClass,
      apiClass.modifiers,
      apiClass.name,
      apiClass.typeParameters,
      apiClass.heritageClauses,
      [...apiClass.members, ...methods],
    )
    const updated = [...sourceFile.statements, ...statements]
    updated[index] = updatedClassDeclaration
    return ts.factory.updateSourceFile(sourceFile, updated, false, sourceFile.referencedFiles)
  }
}

const formatted = prettier.format(printNode(updateAPIWithSwagger(sourceFile)), {
  parser: 'typescript',
})

await writeFile('./src/index.ts', `/* eslint-disable */\n${formatted}`)
