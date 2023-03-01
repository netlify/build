import { readFile } from 'fs/promises'

import bugsnag from '@bugsnag/js'

import { NoopLogger } from './get-build-info.js'

const { default: Bugsnag } = bugsnag
const pkgJSON = new URL('../../package.json', import.meta.url)

export async function initializeMetrics(): Promise<void> {
  try {
    const { version } = JSON.parse(await readFile(pkgJSON, 'utf-8'))
    Bugsnag.start({
      apiKey: process.env.BUGSNAG_KEY || '',
      appVersion: version,
      releaseStage: 'production',
      enabledReleaseStages: ['production'],
      metadata: {},
      logger: new NoopLogger(),
    })
  } catch {
    // noop this handles it gracefully
  }
}
