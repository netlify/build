const { logMessage, logHeader, logSubHeader } = require('../logger')
const { THEME } = require('../theme')

const logStatuses = function(logs, statuses) {
  logHeader(logs, 'Summary')
  statuses.forEach(status => logStatus(logs, status))
}

const logStatus = function(logs, { package, title = `Plugin ${package} ran successfully`, summary, text }) {
  const titleA = title.includes(package) ? title : `${package}: ${title}`
  const body = text === undefined ? summary : `${summary}\n${THEME.dimWords(text)}`
  logSubHeader(logs, titleA)
  logMessage(logs, body)
}

module.exports = {
  logStatuses,
}
