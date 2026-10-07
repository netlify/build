/** A key in the path to a property: an object property or an array index. */
export type PathSegment = string | number

/**
 * A check on one configuration property. Validations run in order, so one on a parent property
 * must come before those on its children, and a check can rely on earlier checks having passed.
 */
export interface Validation {
  /** Dot-delimited path to the property. `*` matches every element of an array or property of an object. */
  property: string
  /** Shown instead of the property path in error messages. */
  propertyName?: string
  /** `key` is the last segment of the path, and `path` the full path, with array indices as numbers. */
  check: (value: unknown, key: PathSegment, path: PathSegment[]) => boolean
  message: string
  /** Valid configuration to show in the error message, or a function returning it. */
  example:
    | Record<string, unknown>
    | ((value: unknown, key: PathSegment, path: PathSegment[]) => Record<string, unknown>)
  /** Reshapes the invalid configuration shown in the error message. */
  formatInvalid?: (invalid: unknown) => unknown
}
