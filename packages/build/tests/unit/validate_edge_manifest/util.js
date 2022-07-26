import { normalize } from 'path'
import { fileURLToPath } from 'url'

import test from 'ava'

const testFile = fileURLToPath(test.meta.file)

const parseMsg = (msg) => JSON.stringify(msg, null, 2)

export const FIXTURES_DIR = normalize(`${testFile}/../unit_fixtures`)

export const invalidPatternMsg = parseMsg([
  {
    instancePath: '/routes/2/pattern',
    schemaPath: '#/properties/routes/items/properties/pattern/errorMessage',
    keyword: 'errorMessage',
    params: {
      errors: [
        {
          instancePath: '/routes/2/pattern',
          schemaPath: '#/properties/routes/items/properties/pattern/format',
          keyword: 'format',
          params: {
            format: 'regexPattern',
          },
          message: 'must match format "regexPattern"',
          emUsed: true,
        },
      ],
    },
    message: 'must match format /^\\^.*\\$$/',
  },
])

export const missingPropErrMsg = parseMsg([
  {
    instancePath: '',
    schemaPath: '#/errorMessage',
    keyword: 'errorMessage',
    params: {
      errors: [
        {
          instancePath: '/bundles/0',
          schemaPath: '#/properties/bundles/items/required',
          keyword: 'required',
          params: {
            missingProperty: 'format',
          },
          message: "must have required property 'format'",
          emUsed: true,
        },
      ],
    },
    message: "Couldn't validate Edge Functions manifest.json",
  },
])

export const extraPropErrMsg = parseMsg([
  {
    instancePath: '',
    schemaPath: '#/errorMessage',
    keyword: 'errorMessage',
    params: {
      errors: [
        {
          instancePath: '/routes/0',
          schemaPath: '#/properties/routes/items/additionalProperties',
          keyword: 'additionalProperties',
          params: {
            additionalProperty: 'extra',
          },
          message: 'must NOT have additional properties',
          emUsed: true,
        },
      ],
    },
    message: "Couldn't validate Edge Functions manifest.json",
  },
])
