/**
 * Likely secret prefixes used for enhanced secret scanning.
 * Note: string comparison is case-insensitive so we use all lowercase here.
 */

const AWS_PREFIXES = ['aws_', 'asia', 'akia', 'aida', 'ar0a', 'apka', 'abia', 'asca']
const SLACK_PREFIXES = ['xoxb-', 'xwfp-', 'xoxb-', 'xoxp-', 'xapp-']
const GCP_PREFIXES = ['aiza', 'ya29']
const NETLIFY_PREFIXES = ['nf_']
const GITHUB_PREFIXES = ['ghp_', 'gho_', 'ghu_', 'ghs_', 'ghr_', 'github_pat_']
const SHOPIFY_PREFIXES = ['shpss_', 'shpat_', 'shpca_', 'shppa_']
const SQUARE_PREFIXES = ['sq0atp-']
const OTHER_COMMON_PREFIXES = [
  'sk_',
  'pat_',
  'sk-',
  'db_',
  'api_',
  'secret_',
  'auth_',
  'access_',
  'twilio_',
  '-----begin',
  'ls0t',
]

export const LIKELY_SECRET_PREFIXES = [
  ...AWS_PREFIXES,
  ...SLACK_PREFIXES,
  ...GCP_PREFIXES,
  ...NETLIFY_PREFIXES,
  ...GITHUB_PREFIXES,
  ...SHOPIFY_PREFIXES,
  ...SQUARE_PREFIXES,
  ...OTHER_COMMON_PREFIXES,
]

/**
 * Known values that we do not want to trigger secret detection failures (e.g. common to framework build output)
 */
export const SAFE_LISTED_VALUES = ['SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED'] // Common to code using React PropTypes
