import { OnPreBuild } from '@netlify/build'
import { expectType } from 'tsd'

const testNetlifyConfigBuild: OnPreBuild = function ({ netlifyConfig: { build } }) {
  expectType<string | undefined>(build.command)
  expectType<string>(build.publish)
  expectType<string>(build.base)
  expectType<unknown>(build.services.testVar)
  expectType<string | undefined>(build.ignore)
  expectType<string | undefined>(build.edge_handlers)
  expectType<string | undefined>(build.environment.TEST_VAR)
}

const testNetlifyConfigBuildProcessing: OnPreBuild = function ({
  netlifyConfig: {
    build: { processing },
  },
}) {
  expectType<boolean | undefined>(processing.skip_processing)
  expectType<boolean | undefined>(processing.css.bundle)
  expectType<boolean | undefined>(processing.css.minify)
  expectType<boolean | undefined>(processing.js.bundle)
  expectType<boolean | undefined>(processing.js.minify)
  expectType<boolean | undefined>(processing.html.pretty_url)
  expectType<boolean | undefined>(processing.images.compress)
}
