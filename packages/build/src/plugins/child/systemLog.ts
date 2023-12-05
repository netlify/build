import { appendFileSync, openSync } from 'fs'
import { inspect } from 'util'

const systemLogLocation = '/dev/fd/4'

export const getSystemLog = () => {
  try {
    // throws if system log wasn't hooked up
    const fd = openSync(systemLogLocation, 'a')
    return (message: unknown) => {
      const stringifiedMessage = typeof message === 'string' ? message : inspect(message)
      appendFileSync(fd, `${stringifiedMessage}\n`)
    }
  } catch {
    return () => {
      /** noop */
    }
  }
}
