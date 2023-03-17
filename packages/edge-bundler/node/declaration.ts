import regexpAST from 'regexp-tree'

import { FunctionConfig, Path } from './config.js'

interface BaseDeclaration {
  cache?: string
  function: string
  name?: string
  generator?: string
}

type DeclarationWithPath = BaseDeclaration & {
  path: Path
  excludedPath?: Path
}

type DeclarationWithPattern = BaseDeclaration & {
  pattern: string
  excludedPattern?: string
}

export type Declaration = DeclarationWithPath | DeclarationWithPattern

export const mergeDeclarations = (
  tomlDeclarations: Declaration[],
  functionsConfig: Record<string, FunctionConfig>,
  deployConfigDeclarations: Declaration[],
) => {
  const declarations: Declaration[] = []
  const functionsVisited: Set<string> = new Set()

  // We start by iterating over all the declarations in the TOML file and in
  // the deploy configuration file. For any declaration for which we also have
  // a function configuration object, we replace the path because that object
  // takes precedence.
  for (const declaration of [...tomlDeclarations, ...deployConfigDeclarations]) {
    const config = functionsConfig[declaration.function]

    if (!config) {
      // If no config is found, add the declaration as is.
      declarations.push(declaration)
    } else if (config.path?.length) {
      // If we have a path specified as either a string or non-empty array,
      // create a declaration for each path.
      const paths = Array.isArray(config.path) ? config.path : [config.path]

      paths.forEach((path) => {
        declarations.push({ ...declaration, cache: config.cache, path })
      })
    } else {
      // With an in-source config without a path, add the config to the declaration.
      const { path, excludedPath, ...rest } = config

      declarations.push({ ...declaration, ...rest })
    }

    functionsVisited.add(declaration.function)
  }

  // Finally, we must create declarations for functions that are not declared
  // in the TOML at all.
  for (const name in functionsConfig) {
    const { cache, path } = functionsConfig[name]

    // If we have a path specified, create a declaration for each path.
    if (!functionsVisited.has(name) && path) {
      const paths = Array.isArray(path) ? path : [path]

      paths.forEach((singlePath) => {
        declarations.push({ cache, function: name, path: singlePath })
      })
    }
  }

  return declarations
}

// Validates and normalizes a pattern so that it's a valid regular expression
// in Go, which is the engine used by our edge nodes.
export const parsePattern = (pattern: string) => {
  // Escaping forward slashes with back slashes.
  const normalizedPattern = pattern.replace(/\//g, '\\/')
  const regex = regexpAST.transform(`/${normalizedPattern}/`, {
    Assertion(path) {
      // Lookaheads are not supported. If we find one, throw an error.
      if (path.node.kind === 'Lookahead') {
        throw new Error('Regular expressions with lookaheads are not supported')
      }
    },

    Group(path) {
      // Named captured groups in JavaScript use a different syntax than in Go.
      // If we find one, convert it to an unnamed capture group, which is valid
      // in both engines.
      if ('name' in path.node && path.node.name !== undefined) {
        path.replace({
          ...path.node,
          name: undefined,
          nameRaw: undefined,
        })
      }
    },
  })

  // Strip leading and forward slashes.
  return regex.toString().slice(1, -1)
}
