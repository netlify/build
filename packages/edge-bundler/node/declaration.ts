import { FunctionConfig } from './config.js'
import type { DeployConfig } from './deploy_config.js'

interface BaseDeclaration {
  cache?: string
  function: string
  name?: string
}

type DeclarationWithPath = BaseDeclaration & {
  path: string
}

type DeclarationWithPattern = BaseDeclaration & {
  pattern: string
}

type Declaration = DeclarationWithPath | DeclarationWithPattern

export const getDeclarationsFromConfig = (
  tomlDeclarations: Declaration[],
  functionsConfig: Record<string, FunctionConfig>,
  deployConfig: DeployConfig,
) => {
  const declarations: Declaration[] = []
  const functionsVisited: Set<string> = new Set()

  // We start by iterating over all the declarations in the TOML file and in
  // the deploy configuration file. For any declaration for which we also have
  // a function configuration object, we replace the path because that object
  // takes precedence.
  for (const declaration of [...tomlDeclarations, ...deployConfig.declarations]) {
    const config = functionsConfig[declaration.function]

    // If no config is found, add the declaration as is
    if (!config) {
      declarations.push(declaration)

      // If we have a path specified as either a string or non-empty array
      // create a declaration for each path
    } else if (config.path?.length) {
      const paths = Array.isArray(config.path) ? config.path : [config.path]

      paths.forEach((path) => {
        declarations.push({ ...declaration, ...config, path })
      })

      // With an in-source config without a path, add the config to the declaration
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { path, ...rest } = config
      declarations.push({ ...declaration, ...rest })
    }

    functionsVisited.add(declaration.function)
  }

  // Finally, we must create declarations for functions that are not declared
  // in the TOML at all.
  for (const name in functionsConfig) {
    const { ...config } = functionsConfig[name]
    const { path } = functionsConfig[name]

    // If we have path specified create a declaration for each path
    if (!functionsVisited.has(name) && path) {
      const paths = Array.isArray(path) ? path : [path]

      paths.forEach((singlePath) => {
        declarations.push({ ...config, function: name, path: singlePath })
      })
    }
  }

  return declarations
}

export { Declaration, DeclarationWithPath, DeclarationWithPattern }
