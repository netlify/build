import { basename, extname } from 'path'

import type { FeatureFlags } from '../../../feature_flags.js'

const NETLIFY_PLAY_SUFFIX = '-netlify-play'

export const NETLIFY_PLAY_BOOTSTRAP_VERSION = 'play0.0'

export const useNetlifyPlay = (featureFlags: FeatureFlags, mainFile: string): boolean => {
  if (!featureFlags.zisi_netlify_play) {
    return false
  }

  const ext = extname(mainFile)
  const filename = basename(mainFile, ext)

  return filename.endsWith(NETLIFY_PLAY_SUFFIX)
}
