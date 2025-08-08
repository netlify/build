import type { OnPreBuild } from '@netlify/build'
import { test, expectTypeOf } from 'vitest'

test('netlifyConfig.build types', () => {
  const handler: OnPreBuild = ({ netlifyConfig: { build } }) => {
    expectTypeOf(build.command).toEqualTypeOf<string | undefined>()
    expectTypeOf(build.publish).toEqualTypeOf<string>()
    expectTypeOf(build.base).toEqualTypeOf<string>()
    expectTypeOf(build.services.testVar).toEqualTypeOf<unknown>()
    expectTypeOf(build.ignore).toEqualTypeOf<string | undefined>()
    expectTypeOf(build.edge_handlers).toEqualTypeOf<string | undefined>()
    expectTypeOf(build.environment.TEST_VAR).toEqualTypeOf<string | undefined>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})

test('netlifyConfig.build.processing types', () => {
  const handler: OnPreBuild = ({
    netlifyConfig: {
      build: { processing },
    },
  }) => {
    expectTypeOf(processing.skip_processing).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(processing.css.bundle).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(processing.css.minify).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(processing.js.bundle).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(processing.js.minify).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(processing.html.pretty_url).toEqualTypeOf<boolean | undefined>()
    expectTypeOf(processing.images.compress).toEqualTypeOf<boolean | undefined>()
  }
  expectTypeOf(handler).toEqualTypeOf<OnPreBuild>()
})
