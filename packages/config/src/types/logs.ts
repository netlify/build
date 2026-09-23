/** Called before printing, so output buffered elsewhere (for example by `@netlify/build`) is written first. */
export interface OutputFlusher {
  flush(): void
}

/** Logs collected in memory, with the `buffer` option. */
export interface BufferedLogs {
  stdout: string[]
  stderr: string[]
  outputFlusher?: OutputFlusher
}

/** Logs printed to the console as they happen. */
export interface StreamedLogs {
  outputFlusher?: OutputFlusher
}

export type Logs = BufferedLogs | StreamedLogs
