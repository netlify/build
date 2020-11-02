'use strict'

const { env } = require('process')

const filterObj = require('filter-obj')

// Retrieve enviroment variables used in error monitoring
const getEnvMetadata = function (childEnv = env) {
  return filterObj(childEnv, isEnvMetadata)
}

const isEnvMetadata = function (name) {
  return ENVIRONMENT_VARIABLES.has(name)
}

// This is sorted by most useful in debugging to least
const ENVIRONMENT_VARIABLES = new Set([
  // URL and IDs
  'BUILD_ID',
  'DEPLOY_ID',
  'SITE_NAME',
  'SITE_ID',
  'REPOSITORY_URL',
  'URL',
  'DEPLOY_URL',
  'DEPLOY_PRIME_URL',

  // Git
  'HEAD',
  'COMMIT_REF',
  'CACHED_COMMIT_REF',
  'BRANCH',
  'CONTEXT',
  'PULL_REQUEST',
  'REVIEW_ID',

  // Node
  'NODE_VERSION',
  'AWS_LAMBDA_JS_RUNTIME',
  'NPM_VERSION',
  'YARN_VERSION',
  'NPM_FLAGS',
  'YARN_FLAGS',
  'NVM_FLAGS',
  'NODE_ENV',

  // Go
  'GO_VERSION',
  'GO_IMPORT_PATH',
  'GOCACHE',
  'GOPATH',
  'GOROOT',

  // Ruby
  'RUBY_VERSION',
  'GEM_HOME',
  'GEM_PATH',
  'GIMME_GCO_ENABLED',
  'GIMME_ENV_PREFIX',
  'GIMME_GO_PREFIX',
  'GIMME_NO_ENV_ALIAS',
  'GIMME_TYPE',
  'IRBRC',
  'MY_RUBY_HOME',

  // Hugo
  'HUGO_VERSION',

  // Java
  'JAVA_VERSION',

  // PHP
  'PHP_VERSION',

  // Python
  'PIPENV_DEFAULT_PYTHON_VERSION',
  'PIPENV_RUNTIME',
  'PIPENV_VENV_IN_PROJECT',

  // Git LFS
  'GIT_LFS_ENABLED',
  'GIT_LFS_FETCH_INCLUDE',
])

module.exports = { getEnvMetadata }
