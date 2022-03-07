import { addErrorInfo } from '../error/info.js'
import { getFullErrorInfo } from '../error/parse/parse.js'
import { serializeErrorStatus } from '../error/parse/serialize_status.js'

// Errors that happen during plugin loads should be reported as error statuses
export const addPluginLoadErrorStatus = function ({ error, packageName, version, debug }) {
  const fullErrorInfo = getFullErrorInfo({ error, colors: false, debug })
  const errorStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_build' })
  const statuses = [{ ...errorStatus, event: 'load', packageName, version }]
  addErrorInfo(error, { statuses })
}
