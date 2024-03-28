import type { NetlifyAPI } from 'netlify'

export const getEnvelope = async function ({
  api,
  accountId,
  siteId,
  context,
}: {
  api: NetlifyAPI
  accountId: string
  siteId?: string
  context?: string
}) {
  if (accountId === undefined) {
    return {}
  }
  try {
    const environmentVariables = await (api as any).getEnvVars({ accountId, siteId, context_name: context })

    const sortedEnvVarsFromDevContext = environmentVariables
      .sort((left, right) => (left.key.toLowerCase() < right.key.toLowerCase() ? -1 : 1))
      .reduce((acc, cur) => {
        const envVar = cur.values.find((val) => ['dev', 'all'].includes(val.context))
        if (envVar && envVar.value) {
          return {
            ...acc,
            [cur.key]: envVar.value,
          }
        }
        return acc
      }, {})
    return sortedEnvVarsFromDevContext
  } catch {
    return {}
  }
}
