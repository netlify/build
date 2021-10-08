import { NetlifyConfig } from './config/netlify_config'
import { NetlifyPluginUtils } from './options/netlify_plugin_utils'

export interface NetlifyPluginOptions {
  constants: {
    /**
     * path to the Netlify configuration file. `undefined` if none was used.
     */
    CONFIG_PATH: string | undefined
    /**
     * directory that contains the deploy-ready HTML files and assets generated by the build. Its value is always defined, but the target might not have been created yet.
     */
    PUBLISH_DIR: string
    /**
     * the directory where function source code lives. `undefined` if no `netlify/functions` directory exists in the base directory and if not specified by the user.
     */
    FUNCTIONS_SRC: string | undefined
    /**
     * the directory where built serverless functions are placed before deployment. Its value is always defined, but the target might not have been created yet.
     */
    FUNCTIONS_DIST: string
    /**
     * the directory where Edge Handlers source code lives. `undefined` if no `netlify/edge-handlers` directory exists in the base directory and if not specified in `netlify.toml`.
     */
    EDGE_HANDLERS_SRC: string | undefined
    /**
     * boolean indicating whether the build was [run locally](https://docs.netlify.com/cli/get-started/#run-builds-locally) or on Netlify
     */
    IS_LOCAL: boolean
    /**
     * version of Netlify Build as a `major.minor.patch` string
     */
    NETLIFY_BUILD_VERSION: string
    /**
     * the Netlify site ID
     */
    SITE_ID: string
  }
  /**
   * If your plugin requires additional values from the user, you can specify these requirements in an `inputs` array in the plugin’s [`manifest.yml` file](https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#anatomy-of-a-plugin).
   */
  inputs: Partial<Record<string, string>>
  /**
   * @see https://docs.netlify.com/configure-builds/build-plugins/create-plugins/#netlifyconfig
   */
  netlifyConfig: NetlifyConfig
  /**
   * When an event handler executes, the contents of the `package.json` in a site's base directory get passed to a plugin.
   * The data fields are normalized to prevent plugin errors. If the site has no `package.json`, the argument is an empty object.
   */
  packageJson: Partial<Record<string, string>>
  utils: NetlifyPluginUtils
}
