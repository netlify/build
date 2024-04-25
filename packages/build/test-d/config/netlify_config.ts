import type { OnPreBuild, NetlifyConfig } from '@netlify/build'
import { expectAssignable, expectType } from 'tsd'
import type { JSONValue } from '../../lib/types/utils/json_value.js'

export const testNetlifyConfigPlugins: OnPreBuild = function ({
  netlifyConfig: {
    plugins: [plugin],
  },
}: {
  netlifyConfig: NetlifyConfig
}) {
  expectType<string>(plugin.package)
  expectType<JSONValue | undefined>(plugin.inputs.testVar)
}

export const testNetlifyConfigEdgeHandlers: OnPreBuild = function ({
  netlifyConfig: {
    edge_functions: [edgeFunction],
  },
}: {
  netlifyConfig: NetlifyConfig
}) {
  expectAssignable<string | undefined>(edgeFunction.path)
  expectType<string>(edgeFunction.function)
}

export const testNetlifyConfigHeaders: OnPreBuild = function ({
  netlifyConfig: {
    headers: [header],
  },
}: {
  netlifyConfig: NetlifyConfig
}) {
  expectType<string>(header.for)
  expectType<string | string[] | undefined>(header.values.testVar)
}

export const testNetlifyConfigRedirects: OnPreBuild = function ({
  netlifyConfig: {
    redirects: [redirect],
  },
}: {
  netlifyConfig: NetlifyConfig
}) {
  expectType<string>(redirect.from)
  expectType<string | undefined>(redirect.to)
  expectType<number | undefined>(redirect.status)
  expectType<boolean | undefined>(redirect.force)
  expectType<string | undefined>(redirect.signed)
  expectType<string | undefined>(redirect.query && redirect.query.testVar)
  expectType<string | undefined>(redirect.headers && redirect.headers.testVar)
  if (redirect.conditions !== undefined) {
    expectType<readonly string[] | undefined>(redirect.conditions.Language)
    expectType<readonly string[] | undefined>(redirect.conditions.Cookie)
    expectType<readonly string[] | undefined>(redirect.conditions.Country)
    expectType<readonly string[] | undefined>(redirect.conditions.Role)
  }
}
