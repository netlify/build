import type { NetlifyAPI } from '@netlify/api'

function valueHasMatchingContext(context?: string) {
  return (value: any) => {
    if (value.context === 'all') return true

    if (value.context === context) return true

    return value.context === 'branch' && value.context_parameter === context
  }
}

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
    // TODO(ndhoule): The api client now has types; remove this type assertion to any and fix errors
    const environmentVariables = await (api as any).getEnvVars({ accountId, siteId, contextName: 'all' })

    const sortedEnvVarsFromContext = environmentVariables
      .sort((left, right) => (left.key.toLowerCase() < right.key.toLowerCase() ? -1 : 1))
      .reduce((acc, cur) => {
        const envVar = cur.values.find(valueHasMatchingContext(context))

        if (envVar && envVar.value) {
          acc[cur.key] = envVar.value
        }

        return acc
      }, {})
    return sortedEnvVarsFromContext
  } catch {
    // TODO(ndhoule): We should probably not quietly fail to retrieve environment variables: This
    // will produce confusingly inconsistent builds.
    return {}
  }
}
