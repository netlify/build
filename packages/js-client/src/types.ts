import type { operations } from '@netlify/open-api'

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
 * Combines snake_case and camelCase parameters.
 */
type CombinedCaseParams<T> = SnakeToCamel<T> | T

/**
 * Combines `path` and `query` parameters into a single type.
 */
type OperationParams<K extends keyof operations> = 'parameters' extends keyof operations[K]
  ? 'path' extends keyof operations[K]['parameters']
    ? 'query' extends keyof operations[K]['parameters']
      ? CombinedCaseParams<
          Omit<operations[K]['parameters']['path'], keyof operations[K]['parameters']['query']> &
            operations[K]['parameters']['query']
        >
      : CombinedCaseParams<operations[K]['parameters']['path']>
    : 'query' extends keyof operations[K]['parameters']
      ? CombinedCaseParams<operations[K]['parameters']['query']>
      : undefined
  : undefined

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
