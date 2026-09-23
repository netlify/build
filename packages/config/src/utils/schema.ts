import * as z from 'zod'

import { logWarning } from '../log/logger.js'
import type { Logs } from '../types/logs.js'

type LenientParseOptions = {
  /** What the value is, e.g. "site information from the Netlify API". */
  description: string
  logs: Logs | undefined
}

/**
 * Type input from outside the package, which used to be trusted as is, with a schema. A mismatch
 * is logged and the input is still used unchanged, so nothing that worked before breaks: the type
 * is then only as reliable as the warning is heeded.
 */
export const parseLeniently = function <Output>(
  schema: z.ZodType<Output>,
  value: unknown,
  { description, logs }: LenientParseOptions,
): Output {
  const result = schema.safeParse(value)
  if (!result.success) {
    logWarning(logs, `Unexpected ${description}, used as is:\n${z.prettifyError(result.error)}`)
  }
  // A mismatch has no `data`, and nested `z.object`s strip properties they don't list.
  return value as Output
}
