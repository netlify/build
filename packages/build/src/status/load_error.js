'use strict'

const { addErrorInfo } = require('../error/info')
const { getFullErrorInfo } = require('../error/parse/parse')
const { serializeErrorStatus } = require('../error/parse/serialize_status')

// Errors that happen during plugin loads should be reported as error statuses
const addPluginLoadErrorStatus = function ({ error, packageName, version, debug }) {
  const fullErrorInfo = getFullErrorInfo({ error, colors: false, debug })
  const errorStatus = serializeErrorStatus({ fullErrorInfo, state: 'failed_build' })
  const statuses = [{ ...errorStatus, event: 'load', packageName, version }]
  addErrorInfo(error, { statuses })
}

module.exports = { addPluginLoadErrorStatus }
