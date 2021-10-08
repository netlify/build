type ArrayByMode<T, Mode extends 'immutable' | 'mutable' = 'immutable'> = {
  immutable: readonly T[]
  mutable: T[]
}[Mode]

export type Many<T, Mode extends 'immutable' | 'mutable' = 'immutable'> = T | ArrayByMode<T, Mode>
