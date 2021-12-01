import { JSONValue } from '../utils/json_value'

// Helper type to be used as a workaround for the fact that `interface`s don't have implicit
// index signatures: https://github.com/microsoft/TypeScript/issues/15300
export type StringKeys<TObject extends object> = keyof TObject & string

export type PluginInputs<Keys extends string = string> = Partial<Record<Keys, JSONValue>>
