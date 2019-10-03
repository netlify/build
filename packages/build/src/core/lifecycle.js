const addPrePostHooks = function(hook) {
  return [`pre${capitalize(hook)}`, hook, `post${capitalize(hook)}`]
}

const capitalize = function([firstChar, ...chars]) {
  return `${firstChar.toUpperCase()}${chars.join('')}`
}

const MAIN_LIFECYCLE = [
  /* Fetch previous build cache */
  'getCache',
  /* Install project dependancies */
  'install',
  /* Build the site & functions */
  'build',
  'buildSite',
  'buildFunctions',
  /* Package & optimize artifact */
  'package',
  /* Deploy built artifact */
  'deploy',
  /* Save cached assets */
  'saveCache',
  /* Outputs manifest of resources created */
  'manifest'
].flatMap(addPrePostHooks)

const LIFECYCLE = [
  /* Build initialization steps */
  'init',
  ...MAIN_LIFECYCLE,
  /* Build finished */
  'finally',
  'onError'
]

module.exports = { LIFECYCLE }
