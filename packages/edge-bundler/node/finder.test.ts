import { test, expect } from 'vitest'

import { removeDuplicatesByExtension } from './finder.js'

test('filters out any duplicate files based on the extension', () => {
  const functions = [
    'file1.js',
    'file1.ts',
    'file2.tsx',
    'file2.jsx',
    'file3.tsx',
    'file3.js',
    'file4.ts',
    'file5.ts',
    'file5.tsx',
  ]
  const expected = ['file1.js', 'file2.jsx', 'file3.js', 'file4.ts', 'file5.ts']

  expect(removeDuplicatesByExtension(functions)).toStrictEqual(expected)
})
