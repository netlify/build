import type { NetlifyAPI } from '@netlify/api'

type EnvelopeOptions = {
  api: NetlifyAPI
  accountId: string | undefined
  /** Without a site, only account-wide variables. */
  siteId?: string
  context: string
}

type ContextName = NonNullable<
  Extract<Parameters<NetlifyAPI['getEnvVars']>[0], { context_name?: unknown }>['context_name']
>

/** Environment variables from the environment variables API, for the given context, sorted by name. */
export const getEnvelope = async function ({
  api,
  accountId,
  siteId,
  context,
}: EnvelopeOptions): Promise<Record<string, string>> {
  if (accountId === undefined) {
    return {}
  }

  try {
    // Any context can be passed, not only the ones the API's published types list.
    const environmentVariables = await api.getEnvVars({ accountId, siteId, contextName: context as ContextName })
    return Object.fromEntries(
      environmentVariables
        .sort((left, right) => ((left.key ?? '').toLowerCase() < (right.key ?? '').toLowerCase() ? -1 : 1))
        .flatMap(({ key, values = [] }) => {
          const value = values.find((envValue) => envValue.context === 'all' || envValue.context === context)?.value
          return key !== undefined && value ? [[key, value]] : []
        }),
    )
  } catch {
    // TODO(ndhoule): We should probably not quietly fail to retrieve environment variables: This
    // will produce confusingly inconsistent builds.
    return {}
  }
}
