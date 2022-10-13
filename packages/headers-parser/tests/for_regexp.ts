import test from 'ava'
import { each } from 'test-each'

import { validateSuccess } from './helpers/main.js'

each(
  [
    { title: 'empty', for: '', forRegExp: /^\/\/?$/iu },
    { title: 'single_slash', for: '/', forRegExp: /^\/\/?$/iu },
    { title: 'whitespaces', for: '/ /', forRegExp: /^\/\/?$/iu },
    { title: 'trim_end', for: '/a ', forRegExp: /^\/a\/?$/iu },
    { title: 'trim_start', for: '/ a', forRegExp: /^\/ a\/?$/iu },
    { title: 'several_characters', for: 'abc', forRegExp: /^\/abc\/?$/iu },
    { title: 'placeholder', for: '/a/:b', forRegExp: /^\/a\/([^/]+)\/?$/iu },
    { title: 'wildcard_single', for: '*', forRegExp: /^\/?(.*)\/?$/iu },
    { title: 'wildcard_slash', for: '/*', forRegExp: /^\/?(.*)\/?$/iu },
    { title: 'wildcard_append', for: '/*/a', forRegExp: /^\/?(.*)\/a\/?$/iu },
    { title: 'wildcard_prepend', for: '/a/*', forRegExp: /^\/a\/?(.*)\/?$/iu },
    { title: 'wildcard_surround', for: '/a/*/b', forRegExp: /^\/a\/?(.*)\/b\/?$/iu },
    { title: 'wildcard_multiple', for: '/a/*/*', forRegExp: /^\/a\/?(.*)\/?(.*)\/?$/iu },
    { title: 'wildcard_inside', for: '/a/b*c', forRegExp: /^\/a\/b(.*)c\/?$/iu },
    { title: 'trailing_slash', for: '/a/', forRegExp: /^\/a\/?$/iu },
    { title: 'regexp_escape', for: '/a.', forRegExp: /^\/a\.\/?$/iu },
    { title: 'double_slash_single', for: '//', forRegExp: /^\/\/?$/iu },
    { title: 'double_slash_multiple', for: '//a//b//', forRegExp: /^\/a\/b\/?$/iu },
  ],
  ({ title }, { for: forPath, forRegExp }) => {
    test(`Add forRegExp when minimal is false | ${title}`, async (t) => {
      await validateSuccess(t, {
        input: { configHeaders: [{ for: forPath, values: { test: 'one' } }], minimal: undefined },
        output: [{ for: forPath.trim(), forRegExp, values: { test: 'one' } }],
      })
    })
  },
)
