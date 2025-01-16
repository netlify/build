import type { operations } from '@netlify/open-api'

/**
 * Determines whether all keys in T are optional.
 */
type AreAllOptional<T> = keyof T extends never // If T has no keys, it's considered optional
  ? true
  : T extends Record<string, any>
    ? { [K in keyof T]-?: undefined extends T[K] ? never : K }[keyof T] extends never
      ? true
      : false
    : false

/**
 * Determines whether `path` and `query` are both optional.
 */
type IsPathAndQueryOptional<K extends keyof operations> = 'parameters' extends keyof operations[K]
  ? AreAllOptional<
      'path' extends keyof operations[K]['parameters'] ? operations[K]['parameters']['path'] : object
    > extends true
    ? AreAllOptional<
        'query' extends keyof operations[K]['parameters'] ? operations[K]['parameters']['query'] : object
      > extends true
      ? true
      : false
    : false
  : true

/**
 * Converts snake_case to camelCase for TypeScript types.
 */
type CamelCase<S extends string> = S extends `${infer T}_${infer U}` ? `${T}${Capitalize<CamelCase<U>>}` : S

/**
 * Creates a union of both snake_case and camelCase keys with their respective types.
 */
type SnakeToCamel<T> = {
  [K in keyof T as CamelCase<K & string>]: T[K]
}

/**
 * Combines snake_case and camelCase parameters into one Params type.
 */
type Params<T> = SnakeToCamel<T> | T

type HasRequestBody<K extends keyof operations> = 'requestBody' extends keyof operations[K]
  ? operations[K]['requestBody'] extends { content: any }
    ? 'application/json' extends keyof operations[K]['requestBody']['content']
      ? true
      : 'application/octet-stream' extends keyof operations[K]['requestBody']['content']
        ? true
        : false
    : false
  : false

type RequestBody<K extends keyof operations> = 'requestBody' extends keyof operations[K]
  ? operations[K]['requestBody'] extends { content: any }
    ? 'application/json' extends keyof operations[K]['requestBody']['content']
      ? operations[K]['requestBody']['content']['application/json']
      : 'application/octet-stream' extends keyof operations[K]['requestBody']['content']
        ? any // TODO: handle types for binary data (Blob, File, Buffer, etc.)
        : never
    : never
  : never

type IsRequestBodyOptional<K extends keyof operations> =
  HasRequestBody<K> extends true ? (AreAllOptional<RequestBody<K>> extends true ? true : false) : true

type IsAnythingRequired<K extends keyof operations> = 'parameters' extends keyof operations[K]
  ? IsPathAndQueryOptional<K> extends true
    ? IsRequestBodyOptional<K> extends true
      ? false
      : true
    : true
  : false

/**
 * Extracts and combines `path` and `query` parameters into a single type.
 */
type ExtractPathAndQueryParameters<K extends keyof operations> = 'parameters' extends keyof operations[K]
  ? 'path' extends keyof operations[K]['parameters']
    ? 'query' extends keyof operations[K]['parameters']
      ? Params<
          Omit<operations[K]['parameters']['path'], keyof operations[K]['parameters']['query']> &
            operations[K]['parameters']['query']
        >
      : Params<operations[K]['parameters']['path']>
    : 'query' extends keyof operations[K]['parameters']
      ? Params<operations[K]['parameters']['query']>
      : undefined
  : undefined

type CombinedParamsAndRequestBody<K extends keyof operations> =
  HasRequestBody<K> extends true
    ? ExtractPathAndQueryParameters<K> & {
        body: RequestBody<K>
      }
    : ExtractPathAndQueryParameters<K>

type OperationParams<K extends keyof operations> = 'parameters' extends keyof operations[K]
  ? IsAnythingRequired<K> extends false
    ? CombinedParamsAndRequestBody<K> | void
    : CombinedParamsAndRequestBody<K>
  : HasRequestBody<K> extends true
    ? IsRequestBodyOptional<K> extends true
      ? { body: RequestBody<K> } | void
      : { body: RequestBody<K> }
    : void

type SuccessHttpStatusCodes = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226
/**
 * Extracts the response type from the operation.
 */
type OperationResponse<K extends keyof operations> = 'responses' extends keyof operations[K]
  ? SuccessHttpStatusCodes extends infer StatusKeys
    ? StatusKeys extends keyof operations[K]['responses']
      ? 'content' extends keyof operations[K]['responses'][StatusKeys]
        ? 'application/json' extends keyof operations[K]['responses'][StatusKeys]['content']
          ? operations[K]['responses'][StatusKeys]['content']['application/json']
          : never
        : never
      : never
    : never
  : never

export type DynamicMethods = {
  [K in keyof operations]: (params: OperationParams<K>) => Promise<OperationResponse<K>>
}
