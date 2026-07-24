import type { NetlifyConfig } from '../../index.js'
import { logWarning } from '../../log/logger.js'
import { getConfigMutations } from '../../plugins/child/diff.js'
import { CoreStep, CoreStepFunction, CoreStepFunctionArgs } from '../types.js'

// The catch-all redirect that makes a single-page application's client-side
// router handle every path.
const SPA_FALLBACK_REDIRECT = {
  from: '/*',
  status: 200,
  to: '/index.html',
}

function findCatchAllRedirect(redirects: NetlifyConfig['redirects']) {
  return redirects.find((r) => r.from === '/*')
}

// A catch-all redirect only serves the single-page application the way ours
// would if it rewrites (rather than redirects) to the same destination.
function matchesSpaFallback(redirect: NonNullable<ReturnType<typeof findCatchAllRedirect>>) {
  return redirect.to === SPA_FALLBACK_REDIRECT.to && redirect.status === SPA_FALLBACK_REDIRECT.status
}

function coreStep(coreStepFunctionArgs: CoreStepFunctionArgs): ReturnType<CoreStepFunction> {
  const { netlifyConfig, logs } = coreStepFunctionArgs

  if (!netlifyConfig.build.spa) {
    return Promise.resolve({})
  }

  const existingCatchAll = findCatchAllRedirect(netlifyConfig.redirects)

  if (existingCatchAll) {
    // `build.spa` asked us to add a catch-all redirect, but the site already
    // has one. If it doesn't already do what ours would, warn the user
    // instead of silently overriding their explicit configuration.
    if (!matchesSpaFallback(existingCatchAll)) {
      logWarning(
        logs,
        `
Warning: "build.spa" is enabled, but a catch-all redirect ("/*") already exists that does not rewrite to "${SPA_FALLBACK_REDIRECT.to}" with a "${String(SPA_FALLBACK_REDIRECT.status)}" status, so Netlify did not add its own.
Please make sure your existing catch-all redirect correctly serves your single-page application.`,
      )
    }

    return Promise.resolve({})
  }

  const newConfig: Partial<NetlifyConfig> = {
    redirects: [...netlifyConfig.redirects, SPA_FALLBACK_REDIRECT],
  }

  const configMutations = getConfigMutations(
    netlifyConfig,
    {
      ...netlifyConfig,
      ...newConfig,
    },
    applySpaFallback.event,
  )

  return Promise.resolve({ configMutations })
}

export const applySpaFallback: CoreStep = {
  coreStep,
  coreStepDescription: () => '',
  coreStepId: 'spa_fallback',
  coreStepName: 'Applying SPA fallback redirect',
  event: 'onPostBuild',
  quiet: true,
}
