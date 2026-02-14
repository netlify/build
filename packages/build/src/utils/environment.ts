// This is not the final source of truth about which environment variable keys are reserved and
// which are not; the Netlify API will ultimately reject illegal environment variables when creating
// a deploy. We do local validation to let a user or plugin developer know as soon as is possible
// that an injected environment variable will later fail the build.
const RESERVED_ENV_VAR_KEYS = new Set([
  // AWS-specific env vars
  'AWS_REGION',
  'AWS_EXECUTION_ENV',
  'AWS_LAMBDA_FUNCTION_NAME',
  'AWS_LAMBDA_FUNCTION_MEMORY_SIZE',
  'AWS_LAMBDA_FUNCTION_VERSION',
  'AWS_LAMBDA_LOG_GROUP_NAME',
  'AWS_LAMBDA_LOG_STREAM_NAME',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_SESSION_TOKEN',
  'AWS_LAMBDA_RUNTIME_API',
  // Build metadata https://docs.netlify.com/configure-builds/environment-variables/#build-metadata
  'NETLIFY',
  'BUILD_ID',
  'CONTEXT',
  // Git metadata https://docs.netlify.com/configure-builds/environment-variables/#git-metadata
  'REPOSITORY_URL',
  'BRANCH',
  'HEAD',
  'COMMIT_REF',
  'CACHED_COMMIT_REF',
  'PULL_REQUEST',
  'REVIEW_ID',
  // Deploy URLs and metadata// https://docs.netlify.com/configure-builds/environment-variables/#deploy-urls-and-metadata
  'URL',
  'DEPLOY_URL',
  'DEPLOY_PRIME_URL',
  'DEPLOY_ID',
  'SITE_NAME',
  'SITE_ID',
  'NETLIFY_IMAGES_CDN_DOMAIN',
  'INCOMING_HOOK_TITLE',
  'INCOMING_HOOK_URL',
  'INCOMING_HOOK_BODY',
])

export const isReservedEnvironmentVariableKey = (key: string): boolean => RESERVED_ENV_VAR_KEYS.has(key)
