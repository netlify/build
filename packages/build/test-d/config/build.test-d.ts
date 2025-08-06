import type { NetlifyConfig } from '@netlify/build'
import { expectTypeOf, test } from 'vitest'

test('netlify config build types', () => {
  type Build = NetlifyConfig['build']
  expectTypeOf<Build['command']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<Build['publish']>().toEqualTypeOf<string>()
  expectTypeOf<Build['base']>().toEqualTypeOf<string>()
  expectTypeOf<Build['services']['testVar']>().toEqualTypeOf<unknown>()
  expectTypeOf<Build['ignore']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<Build['edge_handlers']>().toEqualTypeOf<string | undefined>()
  expectTypeOf<Build['environment']['TEST_VAR']>().toEqualTypeOf<string | undefined>()
})

test('netlify config build processing types', () => {
  type Processing = NetlifyConfig['build']['processing']
  expectTypeOf<Processing['skip_processing']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Processing['css']['bundle']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Processing['css']['minify']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Processing['js']['bundle']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Processing['js']['minify']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Processing['html']['pretty_url']>().toEqualTypeOf<boolean | undefined>()
  expectTypeOf<Processing['images']['compress']>().toEqualTypeOf<boolean | undefined>()
})
