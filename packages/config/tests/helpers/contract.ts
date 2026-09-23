import type { Config } from '@netlify/config'

import type { SerializedConfig } from './result.js'

type Serialized<T> = T extends URL
  ? string
  : T extends (infer Item)[]
    ? Serialized<Item>[]
    : T extends object
      ? // `JSON.stringify` drops properties set to `undefined`.
        { [Key in keyof T]: Serialized<Exclude<T[Key], undefined>> }
      : T

// Compiling this fails if the public types stop describing what the tests pin.
export const publicTypesMatchContract: Serialized<Omit<Config, 'api'>> extends SerializedConfig ? true : false = true
