import type { FrameworkName } from './generated/frameworkNames.js'

interface PollingStrategy {
  name: 'HTTP' | 'TCP'
}

interface Plugin {
  packageName: string
  condition: {
    minNodeVersion: string
  }
}

interface BaseFramework {
  id: FrameworkName
  name: string
  category: 'build_tool' | 'frontend_framework' | 'static_site_generator'
  logo?: {
    default: string
    light: string
    dark: string
  }
  staticAssetsDirectory?: string
  env: Record<string, string>
}

export interface FrameworkDefinition extends BaseFramework {
  detect: {
    npmDependencies: string[]
    excludedNpmDependencies: string[]
    configFiles: string[]
  }
  dev: {
    command?: string
    port?: number
    pollingStrategies?: PollingStrategy[]
  }
  build: {
    command: string
    directory: string
  }
  plugins: Plugin[]
}

export interface Framework extends BaseFramework {
  package: {
    name: string
    version: string
  }
  dev: {
    commands?: string[]
    port?: number
    pollingStrategies?: PollingStrategy[]
  }
  build: {
    commands: string[]
    directory: string
  }
  plugins: string[]
}
