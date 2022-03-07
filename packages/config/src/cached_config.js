import { promises as fs } from 'fs'

// Performance optimization when @netlify/config caller has already previously
// called it and cached the result.
// This is used by the buildbot which:
//  - first calls @netlify/config since it needs configuration property
//  - later calls @netlify/build, which runs @netlify/config under the hood
// This is also used by Netlify CLI.
export const getCachedConfig = async function ({ cachedConfig, cachedConfigPath, token, api }) {
  const parsedCachedConfig = await parseCachedConfig(cachedConfig, cachedConfigPath)
  // The CLI does not print some properties when they are not serializable or
  // are confidential. Those will be missing from `cachedConfig`. The caller
  // must supply them again when using `cachedConfig`.
  return parsedCachedConfig === undefined ? undefined : { token, ...parsedCachedConfig, api }
}

// `cachedConfig` is a plain object while `cachedConfigPath` is a file path to
// a JSON file. The former is useful in programmatic usage while the second one
// is useful in CLI usage, to avoid hitting the OS limits if the configuration
// file is too big.
const parseCachedConfig = async function (cachedConfig, cachedConfigPath) {
  if (cachedConfig !== undefined) {
    return cachedConfig
  }

  if (cachedConfigPath !== undefined) {
    return JSON.parse(await fs.readFile(cachedConfigPath))
  }
}
