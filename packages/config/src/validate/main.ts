import { parseWithRules } from './rule.js'
import {
  CONFIG_FILE_SCHEMA,
  POST_NORMALIZE_SCHEMA,
  PRE_CASE_NORMALIZE_SCHEMA,
  PRE_CONTEXT_SCHEMA,
  PRE_MERGE_SCHEMA,
  PRE_NORMALIZE_SCHEMA,
} from './validations.js'

/** Before properties are normalized to lower case. */
export const validatePreCaseNormalize = (config: object) => {
  parseWithRules(PRE_CASE_NORMALIZE_SCHEMA, config)
}

/** Before a source is merged with the others. */
export const validatePreMergeConfig = (config: object) => {
  parseWithRules(PRE_MERGE_SCHEMA, config)
}

/**
 * Only on the user's `netlify.toml`, for properties other origins such as the Frameworks API may
 * set but users may not.
 */
export const validateConfigFile = (config: object) => {
  parseWithRules(CONFIG_FILE_SCHEMA, config)
}

/** Before contexts are merged. */
export const validatePreContextConfig = (config: object) => {
  parseWithRules(PRE_CONTEXT_SCHEMA, config)
}

/** Before normalization. */
export const validatePreNormalizeConfig = (config: object) => {
  parseWithRules(PRE_NORMALIZE_SCHEMA, config)
}

/** After normalization. */
export const validatePostNormalizeConfig = (config: object) => {
  parseWithRules(POST_NORMALIZE_SCHEMA, config)
}
