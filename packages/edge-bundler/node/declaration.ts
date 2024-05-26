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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const { cache, excludedPath, path, method } = functionConfigs[name]

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
        if (excludedPath) {
          declaration.excludedPath = excludedPath
        }
        declarations.push(declaration)
      })
    }
  }

  return declarations
}

/**
 * Normalizes a regular expression, ensuring it has a leading `^` and trailing
 * `$` characters.
 */
export const normalizePattern = (pattern: string) => {
  let enclosedPattern = pattern

  if (!pattern.startsWith('^')) {
    enclosedPattern = `^${enclosedPattern}`
  }

  if (!pattern.endsWith('$')) {
    enclosedPattern = `${enclosedPattern}$`
  }

  const regexp = new RegExp(enclosedPattern)

  // Strip leading and forward slashes.
  return regexp.toString().slice(1, -1)
}
