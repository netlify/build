export interface FunctionsBag {
  generated: FunctionsCategory
  user: FunctionsCategory
}

export interface FunctionsCategory {
  /**
   * List of paths for directories containing one or more functions. Entries in
   * these directories are considered functions when they are files that match
   * one of the supported extensions or when they are sub-directories that
   * contain a function following the sub-directory naming patterns.
   * Paths can be relative.
   */
  directories: string[]

  /**
   * List of paths for specific functions. Paths can be files that match one
   * of the supported extensions or sub-directories that contain a function
   * following the sub-directory naming patterns. Paths can be relative.
   */
  functions: string[]
}

export type MixedPaths =
  | string
  | string[]
  | {
      /**
       * Functions generated on behalf of the user by a build plugin, extension
       * or a framework.
       */
      generated?: Partial<FunctionsCategory>

      /**
       * Functions authored by the user.
       */
      user?: Partial<FunctionsCategory>
    }

/**
 * Normalizes the `zipFunctions` input into a `FunctionsBag` object.
 */
export const getFunctionsBag = (input: MixedPaths): FunctionsBag => {
  if (typeof input === 'string') {
    return {
      generated: {
        directories: [],
        functions: [],
      },
      user: {
        directories: [input],
        functions: [],
      },
    }
  }

  if (Array.isArray(input)) {
    return {
      generated: {
        directories: [],
        functions: [],
      },
      user: {
        directories: input,
        functions: [],
      },
    }
  }

  return {
    generated: {
      directories: input.generated?.directories ?? [],
      functions: input.generated?.functions ?? [],
    },
    user: {
      directories: input.user?.directories ?? [],
      functions: input.user?.functions ?? [],
    },
  }
}
