'use strict'

const { warnContextPluginConfig, throwContextPluginsConfig } = require('../log/messages')
const { UI_ORIGIN } = require('../origin')

// The only reason to specify both `[[plugins]]` and
// `[[contexts.{context}.plugins]]` is to configure context-specific plugin
// inputs.
// The second cannot be used to enable a plugin for a specific context, because
// it would be overridden by `[[plugins]]`.
// We prevent against that mistake by printing a warning message when both are
// used. We only do this when `[[plugins]]` is due to plugin being UI-installed.
// We also fail the build when the following additional conditions apply:
//  - `package` is the only property in `[[contexts.{context}.plugins]]`, i.e.
//    there are no context-specific `inputs`
//  - The current build is not in `context`
const validateContextsPluginsConfig = function ({ normalizedContextProps, config, contexts, logs }) {
  Object.entries(normalizedContextProps).forEach(([givenContext, givenContextProps]) => {
    validateContextPluginsConfig({ givenContextProps, config, givenContext, contexts, logs })
  })
}

const validateContextPluginsConfig = function ({
  givenContextProps: { plugins: contextPlugins = [] },
  config,
  givenContext,
  contexts,
  logs,
}) {
  contextPlugins.forEach((pluginConfig) => {
    validateContextPluginConfig({ pluginConfig, config, givenContext, contexts, logs })
  })
}

const validateContextPluginConfig = function ({
  pluginConfig: { package: packageName, inputs = {} },
  config: { plugins = [] },
  givenContext,
  contexts,
  logs,
}) {
  if (!isContextFreePlugin(plugins, packageName)) {
    return
  }

  if (isPluginConfigError(contexts, givenContext, inputs)) {
    throwContextPluginsConfig(packageName, givenContext)
  }

  warnContextPluginConfig(logs, packageName, givenContext)
}

const isContextFreePlugin = function (plugins, packageName) {
  return plugins.some((plugin) => plugin.package === packageName && plugin.origin === UI_ORIGIN)
}

const isPluginConfigError = function (contexts, givenContext, inputs) {
  return contexts.every((context) => context !== givenContext) && Object.keys(inputs).length === 0
}

module.exports = { validateContextsPluginsConfig }
