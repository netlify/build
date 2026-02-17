import { describe, expect, test } from 'vitest'

// eslint-disable-next-line n/no-missing-import
import { rewriteSourceImportAssertions } from './import_attributes'

describe('rewriteSourceImportAssertions', () => {
  test('handles static import assertions', () => {
    const source = `import data1 from './data.json' assert { type: 'json' };
import * as data2 from './data.json' assert { type: 'json' };
import { foo } from './data.json' assert { type: 'json' };
import data3 from './data.json' with { type: 'json' };
import data4 from './data.json';
import data5 from './data.json' assert { type: 'json' };
import data6 from './data.json' assert { type: 'json' };

import a from './a.json' assert { type: 'json' };
import b from './b.css' assert { type: 'css' };
import c from './c.js';

import d from './a.json' with { type: 'json' };
import e from './b.css' with { type: 'css' };
import f from './c.js';
`

    const expectedResult = `import data1 from './data.json' with { type: 'json' };
import * as data2 from './data.json' with { type: 'json' };
import { foo } from './data.json' with { type: 'json' };
import data3 from './data.json' with { type: 'json' };
import data4 from './data.json';
import data5 from './data.json' with { type: 'json' };
import data6 from './data.json' with { type: 'json' };

import a from './a.json' with { type: 'json' };
import b from './b.css' with { type: 'css' };
import c from './c.js';

import d from './a.json' with { type: 'json' };
import e from './b.css' with { type: 'css' };
import f from './c.js';
`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(expectedResult)
  })

  test('ignores unrelated values', () => {
    const source = `
    import assert from './assert.json' with { type: 'json' };
    console.assert(true, 'should be true');
`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(source)
  })

  test('ignores handles static export assertions', () => {
    const source = `export { default } from './data.json' assert { type: 'json' };`
    const expectedResult = `export { default } from './data.json' with { type: 'json' };`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(expectedResult)
  })
})
