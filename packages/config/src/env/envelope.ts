import type { NetlifyAPI } from '@netlify/api'
import type { operations } from '@netlify/open-api'

type Context = operations['getEnvVars']['parameters']['query']['context_name']
type EnvVar = operations['getEnvVars']['responses'][200]['content']['application/json'][number]

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
    const environmentVariables = await api.getEnvVars({
      accountId,
      site_id: siteId,
      context_name: context as Context,
    })

    const sortedEnvVarsFromContext = environmentVariables
      .filter((envVar): envVar is EnvVar & { key: string; values: NonNullable<EnvVar['values']> } =>
        Boolean(envVar.key && envVar.values),
      )
      .sort((left, right) => (left.key.toLowerCase() < right.key.toLowerCase() ? -1 : 1))
      .reduce<Record<string, string>>((acc, { key, values }) => {
        const envVar = values.find(({ context: valueContext }) => ['all', context].includes(valueContext))

        if (envVar?.value) {
          acc[key] = envVar.value
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
