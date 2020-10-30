'use strict'

const { inspect } = require('util')

const { omit } = require('../../utils/omit')
const { INFO_SYM } = require('../info')

// In uncaught exceptions, print error static properties
const getErrorProps = function ({ errorProps, showErrorProps, colors }) {
  const errorPropsA = omit(errorProps, CLEANED_ERROR_PROPS)

  if (!showErrorProps || Object.keys(errorPropsA).length === 0) {
    return
  }

  return inspect(errorPropsA, { colors, depth: INSPECT_MAX_DEPTH })
}

const INSPECT_MAX_DEPTH = 5

// Remove error static properties that should not be logged
const CLEANED_ERROR_PROPS = [INFO_SYM, 'requireStack']

module.exports = { getErrorProps }
