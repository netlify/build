import { Transform } from 'stream'

const managerSymbol = Symbol.for('@netlify/conditional-input-manager')

/**
 * Utility class for managing the output of different parts of the application.
 * Its main purpose is to conditionally run certain code paths if amd only if
 * data has flowed through a certain pipe — e.g. render the header for a plugin
 * step only if it emitted any data to stdout or stderr.
 */
export class OutputManager {
  private hasData: boolean
  private headCallback: () => void

  constructor(headCallback: () => void) {
    this.hasData = false
    this.headCallback = headCallback
  }

  isOpen(): boolean {
    return this.hasData
  }

  registerWrite() {
    if (!this.hasData) {
      this.headCallback()
      this.hasData = true
    }
  }
}

/**
 * A Transform stream that takes an `OutputManager` instance and registers any
 * transformed data before piping it to the destination.
 */
export class OutputManagerTransformer extends Transform {
  [managerSymbol]: OutputManager

  constructor(manager: OutputManager) {
    super()

    this[managerSymbol] = manager
  }

  _transform(chunk: any, _: string, callback: () => void) {
    this[managerSymbol].registerWrite()

    this.push(chunk)

    callback()
  }
}
