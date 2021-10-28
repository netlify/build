import { expectAssignable, expectType } from 'tsd'

import { JSONValue } from '../../types/utils/json_value'
import { onPreBuild } from '../netlify_plugin'

const testNetlifyConfigPlugins: onPreBuild = function ({
  netlifyConfig: {
    plugins: [plugin],
  },
}) {
  expectType<string>(plugin.package)
  expectType<JSONValue | undefined>(plugin.inputs.testVar)
}

const testNetlifyConfigEdgeHandlers: onPreBuild = function ({
  netlifyConfig: {
    edge_handlers: [edgeHandler],
  },
}) {
  expectAssignable<string | undefined>(edgeHandler.path)
  expectType<string>(edgeHandler.handler)
}

const testNetlifyConfigHeaders: onPreBuild = function ({
  netlifyConfig: {
    headers: [header],
  },
}) {
  expectType<string>(header.for)
  expectType<string | string[] | undefined>(header.values.testVar)
}

const testNetlifyConfigRedirects: onPreBuild = function ({
  netlifyConfig: {
    redirects: [redirect],
  },
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
