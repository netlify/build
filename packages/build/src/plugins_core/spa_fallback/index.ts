import type { NetlifyConfig } from '../../index.js'
import { getConfigMutations } from '../../plugins/child/diff.js'
import { CoreStep, CoreStepFunction, CoreStepFunctionArgs } from '../types.js'

// The catch-all redirect that makes a single-page application's client-side
// router handle every path.
const SPA_FALLBACK_REDIRECT = {
  from: '/*',
  status: 200,
  to: '/index.html',
}

function hasCatchAllRedirect(redirects: NetlifyConfig['redirects']) {
  return redirects.some((r) => r.from === '/*')
}

function coreStep(coreStepFunctionArgs: CoreStepFunctionArgs): ReturnType<CoreStepFunction> {
  if (
    !coreStepFunctionArgs.netlifyConfig.build.spa ||
    hasCatchAllRedirect(coreStepFunctionArgs.netlifyConfig.redirects)
  ) {
    return Promise.resolve({})
  }

  const newConfig: Partial<NetlifyConfig> = {
    redirects: [...coreStepFunctionArgs.netlifyConfig.redirects, SPA_FALLBACK_REDIRECT],
  }

  const configMutations = getConfigMutations(
    coreStepFunctionArgs.netlifyConfig,
    {
      ...coreStepFunctionArgs.netlifyConfig,
      ...newConfig,
    },
    applySpaFallback.event,
  ) as unknown[]

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
