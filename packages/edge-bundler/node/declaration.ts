import { FunctionConfig, FunctionConfigWithAllPossibleFields, HTTPMethod, Path } from './config.js'
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
    } else if ('pattern' in config && config.pattern?.length) {
      // If we have a pattern specified as either a string or non-empty array,
      // create a declaration for each pattern.
      const patterns = Array.isArray(config.pattern) ? config.pattern : [config.pattern]

      patterns.forEach((pattern) => {
        declarations.push({ ...declaration, cache: config.cache, pattern })
      })
    } else if ('path' in config && config.path?.length) {
      // If we have a path specified as either a string or non-empty array,
      // create a declaration for each path.
      const paths = Array.isArray(config.path) ? config.path : [config.path]

      paths.forEach((path) => {
        declarations.push({ ...declaration, cache: config.cache, path })
      })
    } else {
      // With an in-source config without a path, add the config to the declaration.
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { path, excludedPath, pattern, excludedPattern, ...rest } = config as FunctionConfigWithAllPossibleFields

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
    const functionConfig = functionConfigs[name]
    const { cache, method } = functionConfigs[name]

    if (!functionsVisited.has(name)) {
      // If we have a pattern specified, create a declaration for each pattern.
      if ('pattern' in functionConfig && functionConfig.pattern) {
        const { pattern, excludedPattern } = functionConfig
        const patterns = Array.isArray(pattern) ? pattern : [pattern]
        patterns.forEach((singlePattern) => {
          const declaration: Declaration = { function: name, pattern: singlePattern }
          if (cache) {
            declaration.cache = cache
          }
          if (method) {
            declaration.method = method
          }
          if (excludedPattern) {
            declaration.excludedPattern = excludedPattern
          }
          declarations.push(declaration)
        })
      }
      // If we don't have a pattern but we have a path specified, create a declaration for each path.
      else if ('path' in functionConfig && functionConfig.path) {
        const { path, excludedPath } = functionConfig
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
