import type { operations } from '@netlify/open-api'

type OperationParams<K extends keyof operations> = 'parameters' extends keyof operations[K]
  ? 'path' extends keyof operations[K]['parameters']
    ? 'query' extends keyof operations[K]['parameters']
      ? Omit<operations[K]['parameters']['path'], keyof operations[K]['parameters']['query']> & // Combine `path` and `query`
          operations[K]['parameters']['query']
      : operations[K]['parameters']['path'] // If no `query`, only `path`
    : 'query' extends keyof operations[K]['parameters']
      ? operations[K]['parameters']['query'] // If no `path`, only `query`
      : undefined // No `parameters`
  : undefined

type SuccessHttpStatusCodes = 200 | 201 | 202 | 203 | 204 | 205 | 206 | 207 | 208 | 226

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
