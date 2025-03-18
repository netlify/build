import { test, expect } from 'vitest'

import { parseHeaders } from './helpers/main.js'

test.each([
  ['empty', '', /^\/\/?$/iu],
  ['single_slash', '/', /^\/\/?$/iu],
  ['whitespaces', '/ /', /^\/\/?$/iu],
  ['trim_end', '/a ', /^\/a\/?$/iu],
  ['trim_start', '/ a', /^\/ a\/?$/iu],
  ['several_characters', 'abc', /^\/abc\/?$/iu],
  ['placeholder', '/a/:b', /^\/a\/([^/]+)\/?$/iu],
  ['wildcard_single', '*', /^\/?(.*)\/?$/iu],
  ['wildcard_slash', '/*', /^\/?(.*)\/?$/iu],
  ['wildcard_append', '/*/a', /^\/?(.*)\/a\/?$/iu],
  ['wildcard_prepend', '/a/*', /^\/a\/?(.*)\/?$/iu],
  ['wildcard_surround', '/a/*/b', /^\/a\/?(.*)\/b\/?$/iu],
  ['wildcard_multiple', '/a/*/*', /^\/a\/?(.*)\/?(.*)\/?$/iu],
  ['wildcard_inside', '/a/b*c', /^\/a\/b(.*)c\/?$/iu],
  ['trailing_slash', '/a/', /^\/a\/?$/iu],
  ['regexp_escape', '/a.', /^\/a\.\/?$/iu],
  ['double_slash_single', '//', /^\/\/?$/iu],
  ['double_slash_multiple', '//a//b//', /^\/a\/b\/?$/iu],
])(`Add forRegExp when minimal is false | %s`, async (_, forPath, forRegExp) => {
  const { headers } = await parseHeaders({
    headersFiles: undefined,
    netlifyConfigPath: undefined,
    configHeaders: [{ for: forPath, values: { test: 'one' } }],
    minimal: false,
  })
  expect(headers).toStrictEqual([{ for: forPath.trim(), forRegExp, values: { test: 'one' } }])
})
