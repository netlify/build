import * as z from 'zod'

import { logWarning } from '../log.js'
import type { Logs } from '../types.js'

/**
 * Type input that used to be trusted as is. A mismatch only warns, and the input is used unchanged
 * so nothing that worked breaks: the type is then only as reliable as the warning is heeded.
 */
export const parseLeniently = function <Output>(
  schema: z.ZodType<Output>,
  value: unknown,
  { description, logs }: { description: string; logs: Logs | undefined },
): Output {
  const result = schema.safeParse(value)
  if (!result.success) {
    logWarning(logs, `Unexpected ${description}, used as is:\n${z.prettifyError(result.error)}`)
  }
  // Used as is: a mismatch has no `data`, and the parsed data would lose properties nested schemas don't list.
  return value as Output
}
