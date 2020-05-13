// Retrieve `utils.status.*` methods
const getStatusUtil = function(runState) {
  return { show: show.bind(undefined, runState) }
}

// Report status information to the UI
const show = function(runState, { title, summary, text }) {
  runState.status = { state: 'success', title, summary, text }
}

module.exports = { getStatusUtil }
