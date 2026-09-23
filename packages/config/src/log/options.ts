import { DEFAULT_FEATURE_FLAGS } from '../options/feature_flags.js'
import { removeEmptyArray } from '../simplify.js'
import type { ResolveConfigOptions } from '../types/options.js'
import { removeFalsy } from '../utils/remove_falsy.js'

type PrintableOptions = Pick<
  ResolveConfigOptions,
  'config' | 'cwd' | 'context' | 'branch' | 'mode' | 'repositoryRoot' | 'siteId' | 'baseRelDir' | 'env' | 'featureFlags'
>

/** The options without anything that could be secret, for printing. Uses an allow-list. */
export const cleanupConfigOpts = function ({
  config,
  cwd,
  context,
  branch,
  mode,
  repositoryRoot,
  siteId,
  baseRelDir,
  env = {},
  featureFlags = {},
}: PrintableOptions) {
  return removeFalsy({
    config,
    cwd,
    context,
    branch,
    mode,
    repositoryRoot,
    siteId,
    baseRelDir,
    ...removeEmptyArray(Object.keys(env), 'env'),
    featureFlags: Object.entries(featureFlags)
      .filter(([name, enabled]) => enabled && name in DEFAULT_FEATURE_FLAGS)
      .map(([name]) => name),
  })
}
