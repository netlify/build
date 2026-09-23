import isPlainObj from 'is-plain-obj'

import type {
  BuildConfig,
  FunctionConfig,
  FunctionsConfig,
  FunctionsDirectoryOrigin,
  NodeBundler,
} from './types/config.js'
import { isDefined } from './utils/remove_falsy.js'

export const bundlers: readonly NodeBundler[] = ['esbuild', 'nft', 'zisi', 'none']
export const WILDCARD_ALL = '*'

export const FUNCTION_CONFIG_PROPERTIES: ReadonlySet<string> = new Set([
  'deno_import_map',
  'directory',
  'external_node_modules',
  'ignored_node_modules',
  'included_files',
  'memory',
  'node_bundler',
  'region',
  'schedule',
  'vcpu',
])

type FunctionsDirectoryProps = { functionsDirectory?: string; functionsDirectoryOrigin?: FunctionsDirectoryOrigin }

/**
 * Normalize `functions` so its keys are only function names or globs, and move the functions
 * directory out of it, and out of the legacy `build.functions`, into `functionsDirectory`.
 *
 * Function config properties at the top level of `functions` apply to all functions, e.g.
 * `{ external_node_modules: ['one'], api: { ... } }` becomes `{ '*': { external_node_modules: ['one'] }, api: { ... } }`.
 * A key that is a config property name but whose value is an object of config properties is a
 * function with that name instead.
 *
 * `functions` is validated right after normalization, so its values are only asserted here.
 */
export const normalizeFunctionsProps = function (
  { functions: v1FunctionsDirectory, ...build }: BuildConfig,
  { [WILDCARD_ALL]: wildcardProps, ...functions }: Record<string, unknown>,
): { build: BuildConfig; functions: FunctionsConfig; functionsDirectoryProps: FunctionsDirectoryProps } {
  const normalized = Object.entries(functions).reduce<Record<string, unknown>>(
    (all, [propName, propValue]) =>
      isConfigProperty(propName) && !isConfigLeaf(propValue)
        ? { ...all, [WILDCARD_ALL]: { [propName]: propValue, ...(all[WILDCARD_ALL] as FunctionConfig) } }
        : { ...all, [propName]: propValue },
    { [WILDCARD_ALL]: wildcardProps },
  )
  // `*` goes last, where the directory was taken out of it.
  const { [WILDCARD_ALL]: normalizedWildcard, ...namedFunctions } = normalized
  const { directory, ...wildcardConfig } = normalizedWildcard as FunctionConfig
  return {
    build,
    functions: { ...namedFunctions, [WILDCARD_ALL]: wildcardConfig } as FunctionsConfig,
    functionsDirectoryProps: getFunctionsDirectoryProps(directory, v1FunctionsDirectory),
  }
}

const isConfigProperty = (propName: string) => FUNCTION_CONFIG_PROPERTIES.has(propName)

const isConfigLeaf = (functionConfig: unknown) =>
  isPlainObj(functionConfig) && Object.keys(functionConfig).every(isConfigProperty)

const getFunctionsDirectoryProps = function (
  functionsDirectory: string | undefined,
  v1FunctionsDirectory: string | undefined,
): FunctionsDirectoryProps {
  if (isDefined(functionsDirectory)) {
    return { functionsDirectory, functionsDirectoryOrigin: 'config' }
  }

  if (isDefined(v1FunctionsDirectory)) {
    return { functionsDirectory: v1FunctionsDirectory, functionsDirectoryOrigin: 'config-v1' }
  }

  return {}
}
