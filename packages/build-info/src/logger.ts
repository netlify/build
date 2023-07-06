enum LogLevel {
  DEBUG = 'debug',
  LOG = 'log',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

type LogLevelString = `${LogLevel}`

export interface Logger {
  logLevel?: LogLevelString
  debug(...any: any[]): void
  log(...any: any[]): void
  error(...any: any[]): void
  info(...any: any[]): void
  warn(...any: any[]): void
}

export class DefaultLogger implements Logger {
  constructor(public logLevel: LogLevelString = LogLevel.ERROR) {}

  private shouldLog(logLevel: LogLevelString): boolean {
    const logLevelOrder: LogLevelString[] = ['debug', 'log', 'info', 'warn', 'error']
    return logLevelOrder.indexOf(logLevel) >= logLevelOrder.indexOf(this.logLevel)
  }

  debug(...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(...args)
    }
  }

  log(...args: any[]): void {
    if (this.shouldLog(LogLevel.LOG)) {
      console.log(...args)
    }
  }

  info(...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(...args)
    }
  }

  warn(...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(...args)
    }
  }

  error(...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(...args)
    }
  }
}
