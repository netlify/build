import type { PluginInputs, StringKeys } from './config/inputs.js'
import type { NetlifyConfig } from './config/netlify_config.js'
import type { NetlifyPluginConstants } from './netlify_plugin_constants.js'
import type { NetlifyPluginUtils } from './options/netlify_plugin_utils.js'
import type { JSONValue } from './utils/json_value.js'

export interface NetlifyPluginOptions<TInputs extends PluginInputs<StringKeys<TInputs>> = PluginInputs> {
  /**
   * If your plugin requires additional values from the user, you can specify these requirements in an `inputs` array in the plugin’s [`manifest.yml` file](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#anatomy-of-a-plugin).
   */
  inputs: TInputs
  /**
   * @see https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#netlifyconfig
   */
  netlifyConfig: NetlifyConfig
  /**
   * When an event handler executes, the contents of the `package.json` in a site's base directory get passed to a plugin.
   * The data fields are normalized to prevent plugin errors. If the site has no `package.json`, the argument is an empty object.
   */
  packageJson: Partial<Record<string, JSONValue>>
  constants: NetlifyPluginConstants
  utils: NetlifyPluginUtils
}
