export type ModeOption = 'buildbot' | 'cli' | 'require'

export type TestOptions = {
  env?: boolean
  host?: string
  setBaseUrl?: (url: string) => void
}
