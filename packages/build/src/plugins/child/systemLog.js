import { appendFileSync, openSync } from 'fs'

const systemLogLocation = '/dev/fd/4'

export const getSystemLog = () => {
  try {
    // throws if system log wasn't hooked up
    const fd = openSync(systemLogLocation, 'a')
    return (message) => {
      appendFileSync(fd, `${message}\n`)
    }
  } catch {
    return
  }
}
