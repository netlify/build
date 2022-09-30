import { FunctionConfig } from './config.js'

interface DeclarationWithPath {
  function: string
  path: string
}

interface DeclarationWithPattern {
  function: string
  pattern: string
}

type Declaration = DeclarationWithPath | DeclarationWithPattern

export const getDeclarationsFromConfig = (
  tomlDeclarations: Declaration[],
  functionsConfig: Record<string, FunctionConfig>,
) => {
  const declarations: Declaration[] = []
  const functionsVisited: Set<string> = new Set()

  // We start by iterating over all the TOML declarations. For any declaration
  // for which we also have a function configuration object, we replace the
  // path because that object takes precedence.
  for (const declaration of tomlDeclarations) {
    const { path } = functionsConfig[declaration.function] ?? {}

    if (path) {
      functionsVisited.add(declaration.function)

      declarations.push({ function: declaration.function, path })
    } else {
      declarations.push(declaration)
    }
  }

  // Finally, we must create declarations for functions that are not declared
  // in the TOML at all.
  for (const name in functionsConfig) {
    const { path } = functionsConfig[name]

    if (!functionsVisited.has(name) && path) {
      declarations.push({ function: name, path })
    }
  }

  return declarations
}

export { Declaration, DeclarationWithPath, DeclarationWithPattern }
