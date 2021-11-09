import { NetlifyPluginConstants, NetlifyPluginOptions, OnPreBuild } from '@netlify/build'
import { expectType } from 'tsd'

import { JSONValue } from '../types/utils/json_value'

const testConstants: OnPreBuild = function ({ constants }: { constants: NetlifyPluginConstants }) {
  expectType<string | undefined>(constants.CONFIG_PATH)
  expectType<string>(constants.PUBLISH_DIR)
  expectType<string | undefined>(constants.FUNCTIONS_SRC)
  expectType<string | undefined>(constants.INTERNAL_FUNCTIONS_SRC)
  expectType<string>(constants.FUNCTIONS_DIST)
  expectType<string | undefined>(constants.EDGE_HANDLERS_SRC)
  expectType<boolean>(constants.IS_LOCAL)
  expectType<string>(constants.NETLIFY_BUILD_VERSION)
  expectType<string>(constants.SITE_ID)
}

const testPackageJson: OnPreBuild = function ({ packageJson }: NetlifyPluginOptions) {
  expectType<JSONValue | undefined>(packageJson.version)
}
