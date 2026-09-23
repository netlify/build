export interface EnvironmentVariable {
  sources: string[]
  value: string
}

export interface SerializedExtension {
  author: string
  buildPlugin: { origin: 'local' | 'remote'; packageURL: string } | null
  dev?: { path: string; force_run_in_build?: boolean } | null
  extension_token: string
  has_build: boolean
  name: string
  slug: string
  version: string
}

/** Unlisted properties pass through from the sources. */
export type SerializedNetlifyConfig = Record<string, unknown> & {
  build: Record<string, unknown> & {
    base?: string
    command?: string
    edge_functions?: string
    publish: string
  }
  functions?: Record<string, Record<string, unknown> | undefined>
  functionsDirectory?: string
}

// Declared rather than derived from the package's types, so it pins the contract independently of them.
export interface SerializedConfig {
  accounts: Record<string, unknown>[]
  branch: string
  buildDir: string
  config: SerializedNetlifyConfig
  configPath?: string
  context: string
  env: Record<string, EnvironmentVariable | undefined>
  headersPath: string
  integrations: SerializedExtension[]
  logs?: { stdout: string[]; stderr: string[] }
  redirectsPath: string
  repositoryRoot: string
  siteInfo: Record<string, unknown> & { account_id?: string; id?: string }
  token?: string
}

// The fixtures print JSON, so its shape can only be asserted.
export const asConfig = (result: unknown) => result as SerializedConfig
