export type ModeOption = 'buildbot' | 'cli' | 'require'

export type TestOptions = {
  env?: boolean
  host?: string
  returnBaseUrl?: (url: string) => void
}
