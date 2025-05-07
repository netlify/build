class NPMImportError extends Error {
  constructor(originalError: Error, moduleName: string) {
    super(
      `There was an error when loading the '${moduleName}' npm module. Support for npm modules in edge functions is an experimental feature. Refer to https://ntl.fyi/edge-functions-npm for more information.`,
    )

    this.name = 'NPMImportError'
    this.stack = originalError.stack

    // https://github.com/microsoft/TypeScript-wiki/blob/8a66ecaf77118de456f7cd9c56848a40fe29b9b4/Breaking-Changes.md#implicit-any-error-raised-for-un-annotated-callback-arguments-with-no-matching-overload-arguments
    Object.setPrototypeOf(this, NPMImportError.prototype)
  }
}

const wrapNpmImportError = (input: unknown) => {
  if (input instanceof Error) {
    const match = input.message.match(/Relative import path "(.*)" not prefixed with/)
    if (match !== null) {
      const [, moduleName] = match
      return new NPMImportError(input, moduleName)
    }

    const schemeMatch = input.message.match(/Error: Module not found "npm:(.*)"/)
    if (schemeMatch !== null) {
      const [, moduleName] = schemeMatch
      return new NPMImportError(input, moduleName)
    }
  }

  return input
}

export { NPMImportError, wrapNpmImportError }
