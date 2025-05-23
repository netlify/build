import { readFile } from 'fs/promises'

import bugsnag, { type Client } from '@bugsnag/js'

import { NoopLogger } from './get-build-info.js'

const { default: Bugsnag } = bugsnag
const pkgJSON = new URL('../../package.json', import.meta.url)

export async function initializeMetrics(): Promise<Client | undefined> {
  try {
    const { version, name } = JSON.parse(await readFile(pkgJSON, 'utf-8'))
    const metadata: { [key: string]: any } = {
      deploy_id: process.env.DEPLOY_ID,
      build_id: process.env.BUILD_ID,
      repository_url: process.env.REPOSITORY_URL,
    }
    Bugsnag.start({
      apiKey: process.env.BUGSNAG_KEY_BUILD_INFO || '',
      appType: name,
      appVersion: version,
      releaseStage: 'production',
      enabledReleaseStages: ['production'],
      metadata,
      autoTrackSessions: false,

      logger: new NoopLogger(),
    })
    return Bugsnag.startSession()
  } catch {
    // noop this handles it gracefully
  }
}
