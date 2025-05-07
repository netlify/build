import type { OnPreBuild, NetlifyPluginUtils, ListedFunction, ListedFunctionFile } from '@netlify/build'
import { expectType } from 'tsd'

export const testUtilsFunctionsList: OnPreBuild = function ({
  utils: {
    functions: { list },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<ListedFunction[]>>(list())
}

export const testUtilsListAll: OnPreBuild = function ({
  utils: {
    functions: { listAll },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<ListedFunctionFile[]>>(listAll())
}

export const testUtilsFunctionsAdd: OnPreBuild = function ({
  utils: {
    functions: { add },
  },
}: {
  utils: NetlifyPluginUtils
}) {
  expectType<Promise<void>>(add('functionName'))
}
