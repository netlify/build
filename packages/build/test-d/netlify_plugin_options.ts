import type { NetlifyPluginConstants, NetlifyPluginOptions, OnPreBuild } from '@netlify/build'
import { expectType } from 'tsd'
import type { JSONValue } from '../lib/types/utils/json_value.js'

export const testConstants: OnPreBuild = function ({ constants }: { constants: NetlifyPluginConstants }) {
  expectType<string | undefined>(constants.CONFIG_PATH)
  expectType<string>(constants.PUBLISH_DIR)
  expectType<string | undefined>(constants.FUNCTIONS_SRC)
  expectType<string | undefined>(constants.INTERNAL_EDGE_FUNCTIONS_SRC)
  expectType<string | undefined>(constants.INTERNAL_FUNCTIONS_SRC)
  expectType<string>(constants.FUNCTIONS_DIST)
  expectType<string | undefined>(constants.EDGE_FUNCTIONS_SRC)
  expectType<string>(constants.EDGE_FUNCTIONS_DIST)
  expectType<boolean>(constants.IS_LOCAL)
  expectType<string>(constants.NETLIFY_BUILD_VERSION)
  expectType<string>(constants.SITE_ID)
}

export const testPackageJson: OnPreBuild = function ({ packageJson }: NetlifyPluginOptions) {
  expectType<JSONValue | undefined>(packageJson.version)
}
