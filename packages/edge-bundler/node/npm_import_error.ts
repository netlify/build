class NPMImportError extends Error {
  constructor(originalError: Error, moduleName: string) {
    super(
      `It seems like you're trying to import an npm module. This is only supported in Deno via CDNs like esm.sh. Have you tried 'import mod from "https://esm.sh/${moduleName}"'?`,
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
  }

  return input
}

export { NPMImportError, wrapNpmImportError }
