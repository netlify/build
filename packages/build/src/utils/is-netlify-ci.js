// Test if inside netlify build context
module.exports = function isNetlifyCI() {
  return Boolean(process.env.DEPLOY_PRIME_URL)
}
