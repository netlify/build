import Ajv from 'ajv'
import type { ValidateFunction } from 'ajv/dist/core.js'
import ajvErrors from 'ajv-errors'
import betterAjvErrors from 'better-ajv-errors'

import { FeatureFlags } from '../../feature_flags.js'
import type { Manifest } from '../../manifest.js'

import ManifestValidationError from './error.js'
import edgeManifestSchema from './schema.js'

let manifestValidator: ValidateFunction<Manifest>

const initializeValidator = () => {
  if (manifestValidator === undefined) {
    // @ts-expect-error (error TS2351: This expression is not constructable)
    const ajv = new Ajv({ allErrors: true })
    // @ts-expect-error (error TS2349: This expression is not callable)
    ajvErrors(ajv)

    // regex pattern for manifest route pattern
    // checks if the pattern string starts with ^ and ends with $
    const normalizedPatternRegex = /^\^.*\$$/
    ajv.addFormat('regexPattern', {
      validate: (data: string) => normalizedPatternRegex.test(data),
    })

    manifestValidator = ajv.compile<Manifest>(edgeManifestSchema)
  }

  return manifestValidator
}

// throws on validation error
export const validateManifest = (manifestData: unknown, _featureFlags: FeatureFlags = {}): void => {
  const validate = initializeValidator()

  const valid = validate(manifestData)

  if (!valid) {
    let errorOutput

    if (validate.errors) {
      errorOutput = betterAjvErrors(edgeManifestSchema, manifestData, validate.errors, { indent: 2 })
    }

    throw new ManifestValidationError(errorOutput)
  }
}

export { ManifestValidationError }
