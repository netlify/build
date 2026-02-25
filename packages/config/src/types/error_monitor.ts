export type ErrorMonitor = {
  notify: (error: Error, callback?: (event: any) => void) => void
}
