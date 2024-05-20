import { Transform } from 'stream'

const gateSymbol = Symbol.for('@netlify/output-gate')

/**
 * Utility class for conditionally rendering certain output only if additional
 * data flows through. When the gate is constructed, a function that contains
 * the "buffer" is defined. If the gate is opened, that buffer function will
 * be called.
 */
export class OutputGate {
  private buffer: () => void

  isOpen: boolean

  constructor(bufferFn: () => void) {
    this.isOpen = false
    this.buffer = bufferFn
  }

  open() {
    if (!this.isOpen) {
      this.buffer()
      this.isOpen = true
    }
  }
}

/**
 * A `Transform` stream that takes an `OutputGate` instance and opens the gate
 * before piping the data to its destination.
 */
export class OutputGateTransformer extends Transform {
  [gateSymbol]: OutputGate

  constructor(gate: OutputGate) {
    super()

    this[gateSymbol] = gate
  }

  _transform(chunk: any, _: string, callback: () => void) {
    this[gateSymbol].open()

    this.push(chunk)

    callback()
  }
}
