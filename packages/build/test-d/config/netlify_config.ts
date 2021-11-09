import { OnPreBuild, NetlifyConfig } from '@netlify/build'
import { expectAssignable, expectType } from 'tsd'

import { JSONValue } from '../../types/utils/json_value'

const testNetlifyConfigPlugins: OnPreBuild = function ({
  netlifyConfig: {
    plugins: [plugin],
  },
}: {
  netlifyConfig: NetlifyConfig
}) {
  expectType<string>(plugin.package)
  expectType<JSONValue | undefined>(plugin.inputs.testVar)
}

const testNetlifyConfigEdgeHandlers: OnPreBuild = function ({
  netlifyConfig: {
    edge_handlers: [edgeHandler],
  },
}: {
  netlifyConfig: NetlifyConfig
}) {
  expectAssignable<string | undefined>(edgeHandler.path)
  expectType<string>(edgeHandler.handler)
}

const testNetlifyConfigHeaders: OnPreBuild = function ({
  netlifyConfig: {
    headers: [header],
  },
}: {
  netlifyConfig: NetlifyConfig
}) {
  expectType<string>(header.for)
  expectType<string | string[] | undefined>(header.values.testVar)
}

const testNetlifyConfigRedirects: OnPreBuild = function ({
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
  expectType<readonly string[] | undefined>(
    redirect.conditions && redirect.conditions.language && redirect.conditions.language,
  )
}
