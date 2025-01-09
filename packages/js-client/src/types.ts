import type { operations } from '@netlify/open-api'

type OperationParams<K extends keyof operations> = 'parameters' extends keyof operations[K]
  ? operations[K]['parameters']
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
