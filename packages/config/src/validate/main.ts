import { parseWithRules } from './rule.js'
import {
  type CaseCheckedConfig,
  CONFIG_FILE_SCHEMA,
  type ContextCheckedConfig,
  type MergeCheckedConfig,
  POST_NORMALIZE_SCHEMA,
  PRE_CASE_NORMALIZE_SCHEMA,
  PRE_CONTEXT_SCHEMA,
  PRE_MERGE_SCHEMA,
  PRE_NORMALIZE_SCHEMA,
  type RawConfig,
  type SourceCheckedConfig,
} from './validations.js'

/** Before properties are normalized to lower case. */
export const parsePreCaseNormalize = (config: RawConfig): CaseCheckedConfig =>
  parseWithRules(PRE_CASE_NORMALIZE_SCHEMA, config)

/** Before a source is merged with the others. */
export const parsePreMergeConfig = (config: RawConfig): SourceCheckedConfig => parseWithRules(PRE_MERGE_SCHEMA, config)

/**
 * Only on the user's `netlify.toml`, for properties other origins such as the Frameworks API may
 * set but users may not.
 */
export const validateConfigFile = (config: RawConfig) => {
  parseWithRules(CONFIG_FILE_SCHEMA, config)
}

/** Before contexts are merged. */
export const parsePreContextConfig = (config: RawConfig): ContextCheckedConfig =>
  parseWithRules(PRE_CONTEXT_SCHEMA, config)

/** Before normalization. */
export const parsePreNormalizeConfig = (config: RawConfig): MergeCheckedConfig =>
  parseWithRules(PRE_NORMALIZE_SCHEMA, config)

/** After normalization. */
export const validatePostNormalizeConfig = (config: RawConfig) => {
  parseWithRules(POST_NORMALIZE_SCHEMA, config)
}
