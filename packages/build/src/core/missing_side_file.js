'use strict'

const { relative } = require('path')

const pathExists = require('path-exists')

const { logMissingSideFile } = require('../log/messages/core')

// Some files like `_headers` and `_redirects` must be copied to the publish
// directory to be used in production. When those are present in the repository
// but not in the publish directory, this most likely indicates that the build
// command accidentally forgot to copy those. We then print a warning message.
const warnOnMissingSideFiles = async function ({
  buildDir,
  netlifyConfig: {
    build: { publish },
  },
  logs,
}) {
  await Promise.all(SIDE_FILES.map((sideFile) => warnOnMissingSideFile({ logs, sideFile, buildDir, publish })))
}

const SIDE_FILES = ['_headers', '_redirects']

const warnOnMissingSideFile = async function ({ logs, sideFile, buildDir, publish }) {
  if (!(await pathExists(`${buildDir}/${sideFile}`)) || (await pathExists(`${publish}/${sideFile}`))) {
    return
  }

  logMissingSideFile(logs, sideFile, relative(buildDir, publish))
}

module.exports = { warnOnMissingSideFiles }
