import { inspect } from 'util'

import { omit } from '../../utils/omit.js'

// In uncaught exceptions, print error static properties
export const getErrorProps = function ({ errorProps, showErrorProps, colors }) {
  if (!showErrorProps) {
    return
  }

  const errorPropsA = omit(errorProps, CLEANED_ERROR_PROPS)

  if (Object.keys(errorPropsA).length === 0) {
    return
  }

  return inspect(errorPropsA, { colors, depth: INSPECT_MAX_DEPTH })
}

const INSPECT_MAX_DEPTH = 5

// Remove error static properties that should not be logged
const CLEANED_ERROR_PROPS = ['requireStack']
