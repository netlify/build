import { throwUserError } from '../error.js'
import { ERROR_CALL_TO_ACTION } from '../log/messages.js'

export const getEnvelope = async function ({ api, accountId, siteId }) {
  if (accountId === undefined) {
    return {}
  }
  try {
    const environmentVariables = await api.getEnvVars({ accountId, siteId })
    // eslint-disable-next-line fp/no-mutating-methods
    const envVars = environmentVariables
      .sort((left, right) => (left.key.toLowerCase() < right.key.toLowerCase() ? -1 : 1))
      .reduce((acc, cur) => {
        const envVar = cur.values.find((val) => ['dev', 'all'].includes(val.context))
        if (envVar && envVar.value) {
          // eslint-disable-next-line fp/no-mutation, no-param-reassign
          acc[cur.key] = envVar.value
        }
        return acc
      }, {})
    return envVars
  } catch (error) {
    throwUserError(`Failed retrieving envelope for site ${siteId}: ${error.message}. ${ERROR_CALL_TO_ACTION}`)
  }
}
