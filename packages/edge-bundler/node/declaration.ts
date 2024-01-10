import regexpAST, { NodePath } from 'regexp-tree'

import { FunctionConfig, HTTPMethod, Path } from './config.js'
import { FeatureFlags } from './feature_flags.js'

interface BaseDeclaration {
  cache?: string
  function: string
  method?: HTTPMethod | HTTPMethod[]
  // todo: remove these two after a while and only support in-source config for non-route related configs
  name?: string
  generator?: string
}

type DeclarationWithPath = BaseDeclaration & {
  path: Path
  excludedPath?: Path | Path[]
}

type DeclarationWithPattern = BaseDeclaration & {
  pattern: string
  excludedPattern?: string | string[]
}

export type Declaration = DeclarationWithPath | DeclarationWithPattern

export const mergeDeclarations = (
  tomlDeclarations: Declaration[],
  userFunctionsConfig: Record<string, FunctionConfig>,
  internalFunctionsConfig: Record<string, FunctionConfig>,
  deployConfigDeclarations: Declaration[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _featureFlags: FeatureFlags = {},
  // eslint-disable-next-line max-params
) => {
  const functionsVisited: Set<string> = new Set()

  const declarations: Declaration[] = [
    // INTEGRATIONS
    // 1. Declarations from the integrations deploy config
    ...getDeclarationsFromInput(deployConfigDeclarations, internalFunctionsConfig, functionsVisited),
    // 2. Declarations from the integrations ISC
    ...createDeclarationsFromFunctionConfigs(internalFunctionsConfig, functionsVisited),

    // USER
    // 3. Declarations from the users toml config
    ...getDeclarationsFromInput(tomlDeclarations, userFunctionsConfig, functionsVisited),
    // 4. Declarations from the users ISC
    ...createDeclarationsFromFunctionConfigs(userFunctionsConfig, functionsVisited),
  ]

  return declarations
}

const getDeclarationsFromInput = (
  inputDeclarations: Declaration[],
  functionConfigs: Record<string, FunctionConfig>,
  functionsVisited: Set<string>,
): Declaration[] => {
  const declarations: Declaration[] = []
  // For any declaration for which we also have a function configuration object,
  // we replace the path because that object takes precedence.
  for (const declaration of inputDeclarations) {
    const config = functionConfigs[declaration.function]

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

  return declarations
}

const createDeclarationsFromFunctionConfigs = (
  functionConfigs: Record<string, FunctionConfig>,
  functionsVisited: Set<string>,
): Declaration[] => {
  const declarations: Declaration[] = []

  for (const name in functionConfigs) {
    const { cache, path, method } = functionConfigs[name]

    // If we have a path specified, create a declaration for each path.
    if (!functionsVisited.has(name) && path) {
      const paths = Array.isArray(path) ? path : [path]

      paths.forEach((singlePath) => {
        const declaration: Declaration = { function: name, path: singlePath }
        if (cache) {
          declaration.cache = cache
        }
        if (method) {
          declaration.method = method
        }
        declarations.push(declaration)
      })
    }
  }

  return declarations
}

/**
 * Validates and normalizes a pattern so that it's a valid regular expression
 * in Go, which is the engine used by our edge nodes.
 *
 * @param pattern Original regular expression
 * @param extractedExclusionPatterns If set, negative lookaheads (which are
 * not supported in Go) are transformed into a list of exclusion patterns to
 * be stored in this array
 * @returns Normalized regular expression
 */
export const parsePattern = (pattern: string, extractedExclusionPatterns?: string[]) => {
  let enclosedPattern = pattern

  if (!pattern.startsWith('^')) {
    enclosedPattern = `^${enclosedPattern}`
  }

  if (!pattern.endsWith('$')) {
    enclosedPattern = `${enclosedPattern}$`
  }

  let lookaheadDepth = 0

  // Holds the location of every lookahead expression found.
  const lookaheads = new Set<string>()
  const regexp = new RegExp(enclosedPattern)
  const newRegexp = regexpAST.transform(regexp, {
    Assertion: {
      // If we're entering a negative lookahead expression, register its
      // location.
      pre(path) {
        if (path.node.kind !== 'Lookahead') {
          return
        }

        if (!extractedExclusionPatterns) {
          throw new Error('Regular expressions with lookaheads are not supported')
        }

        if (!path.node.negative) {
          throw new Error('Regular expressions with positive lookaheads are not supported')
        }

        lookaheadDepth += 1

        if (lookaheadDepth > 1) {
          throw new Error('Regular expressions with nested lookaheads are not supported')
        }

        const lookahead = serializeNodeLocation(path.node)

        if (lookahead) {
          lookaheads.add(lookahead)
        }
      },

      // If we're leaving a negative lookahead expression, remove it from the
      // AST. We'll later replace its functionality with an exclusion pattern.
      post(path) {
        if (path.node.kind !== 'Lookahead' || !path.node.negative) {
          return
        }

        lookaheadDepth -= 1

        path.remove()
      },
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

  // The `extractedExclusionPatterns` property works as a shut-off valve: if
  // it's not supplied, don't even traverse the AST again to further process
  // lookaheads.
  if (extractedExclusionPatterns) {
    const exclusionPatterns = [...lookaheads].map((lookahead) => getExclusionPatternFromLookahead(regexp, lookahead))

    extractedExclusionPatterns.push(...exclusionPatterns)
  }

  // Strip leading and forward slashes.
  return newRegexp.toString().slice(1, -1)
}

/**
 * Takes a regular expression and a lookahead inside it and returns a new
 * regular expression that acts as an exclusion pattern to replace the
 * lookahead.
 *
 * @param regexp Original regular expression
 * @param location Serialized location of the lookahead
 * @returns Exclusion pattern regular expression
 */
const getExclusionPatternFromLookahead = (regexp: RegExp, location: string) => {
  const exclusionRegexp = regexpAST.transform(regexp, {
    Assertion(path) {
      if (
        path.node.kind !== 'Lookahead' ||
        path.node.assertion === null ||
        serializeNodeLocation(path.node) !== location
      ) {
        return
      }

      // Unwrap the lookahead by replacing it with the expression it holds —
      // e.g. `(?!foo)` becomes `foo`.
      path.replace(path.node.assertion)

      // Traverse the parents of the lookahead all the way up to the root. When
      // we find a disjunction, replace it with the child we travelled from. In
      // practice this means getting rid of all the branches that are not the
      // lookahead.
      // For example, in `(a|b(?!c)|d)` the exclusion patterns cannot contain
      // the `a` or `d` branches of the disjunction, otherwise `ab` and `ad`
      // would incorrectly be excluded. The exclusion must be `bc` only.
      let visitor: NodePath | null = path

      while (visitor !== null) {
        const child = visitor

        visitor = visitor.parentPath

        if (visitor?.node.type !== 'Disjunction') {
          continue
        }

        visitor.replace(child.node)
      }
    },
  })

  return exclusionRegexp.toString()
}

/**
 * Creates a string representation of a regexp AST node in the format
 * `<start line>,<start column>,<start offset>,<end line>,<end column>,<end offset>`
 */
const serializeNodeLocation = (node: NodePath['node']) => {
  if (!node.loc) {
    return ''
  }

  const { start, end } = node.loc

  return [start.line, start.column, start.offset, end.line, end.column, end.offset].join(',')
}
