const isPlainObj = require('is-plain-obj')

// Backward compatibility for `build.lifecycle.*` which was removed.
// It joins all commands together with `&&` and set to `build.command`.
// TODO: remove after the Beta release since it's legacy
const normalizeLifecycle = function({ lifecycle, ...build }) {
  if (!isPlainObj(lifecycle)) {
    return build
  }

  const command = getLifecycleCommand(lifecycle)
  return { ...build, command }
}

const getLifecycleCommand = function(lifecycle) {
  return Object.entries(lifecycle)
    .sort(compareEvent)
    .map(getCommand)
    .join(' && ')
}

const compareEvent = function([eventA], [eventB]) {
  return EVENTS.indexOf(eventA) < EVENTS.indexOf(eventB) ? -1 : 1
}

const getCommand = function([, command]) {
  return command
}

// Ordered list of events, including their backward compatible forms
const EVENTS = [
  'onInit',
  'oninit',
  'init',

  'onPreBuild',
  'onprebuild',
  'preBuild',
  'prebuild',
  'preGetCache',
  'pregetcache',
  'onPreGetCache',
  'onpregetcache',
  'getCache',
  'getcache',
  'onGetCache',
  'ongetcache',
  'postGetCache',
  'postgetcache',
  'onPostGetCache',
  'onpostgetcache',
  'preInstall',
  'preinstall',
  'onPreInstall',
  'onpreinstall',
  'install',
  'onInstall',
  'oninstall',
  'postInstall',
  'postinstall',
  'onPostInstall',
  'onpostinstall',

  'onBuild',
  'onbuild',
  'build',

  'onPostBuild',
  'onpostbuild',
  'postBuild',
  'postbuild',
  'preFunctionsBuild',
  'prefunctionsbuild',
  'onPreFunctionsBuild',
  'onprefunctionsbuild',
  'functionsBuild',
  'functionsbuild',
  'onFunctionsBuild',
  'onfunctionsbuild',
  'postFunctionsBuild',
  'postfunctionsbuild',
  'onPostFunctionsBuild',
  'onpostfunctionsbuild',
  'preFunctionsPackage',
  'prefunctionspackage',
  'onPreFunctionsPackage',
  'onprefunctionspackage',
  'functionsPackage',
  'functionspackage',
  'onFunctionsPackage',
  'onfunctionspackage',
  'postFunctionsPackage',
  'postfunctionspackage',
  'onPostFunctionsPackage',
  'onpostfunctionspackage',
  'prePackage',
  'prepackage',
  'package',
  'postPackage',
  'postpackage',
  'preDeploy',
  'predeploy',
  'onPreDeploy',
  'onpredeploy',
  'preSaveCache',
  'presavecache',
  'onPreSaveCache',
  'onpresavecache',
  'saveCache',
  'savecache',
  'onSaveCache',
  'onsavecache',
  'postSaveCache',
  'postsavecache',
  'onPostSaveCache',
  'onpostsavecache',

  'onSuccess',
  'onsuccess',
  'success',

  'onError',
  'onerror',
  'error',

  'onEnd',
  'onend',
  'end',
  'finally',
]

module.exports = { normalizeLifecycle, getLifecycleCommand }
