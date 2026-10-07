/** A key in the path to a property: an object property or an array index. */
export type PathSegment = string | number

/** The error reported when a configuration property fails a check. */
export interface Rule {
  /** Shown instead of the property path in error messages. */
  propertyName?: string
  message: string
  /** Valid configuration to show in the error message, or a function returning it. */
  example:
    | Record<string, unknown>
    | ((value: unknown, key: PathSegment, path: PathSegment[]) => Record<string, unknown>)
  /** Reshapes the invalid configuration shown in the error message. */
  formatInvalid?: ((invalid: unknown) => unknown) | undefined
}
