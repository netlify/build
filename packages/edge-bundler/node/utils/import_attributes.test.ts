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

  test('handles static export assertions', () => {
    const source = `export { default } from './data.json' assert { type: 'json' };`
    const expectedResult = `export { default } from './data.json' with { type: 'json' };`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(expectedResult)
  })

  test('handles typescript syntax', () => {
    const source = `import React from "https://esm.sh/react";
import { renderToReadableStream } from "https://esm.sh/react-dom/server";
import type { Config, Context } from "@netlify/edge-functions";

export default async function handler(req: Request, context: Context) {
  const stream = await renderToReadableStream(
    <html>
      <title>Hello</title>
      <body>
        <h1>Hello {context.geo.country?.name}</h1>
      </body>
    </html>
  );

  return new Response(stream, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
}

export const config: Config = {
  path: "/hello",
};`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(source)
  })

  test('Partially replace files in the case where unsupported syntax happens after all conversions have been made', () => {
    const source = `
import data3 from './data.json' assert { type: 'json' };
const params = inputs as Params; // this line will fail
`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toContain(`import data3 from './data.json' with { type: 'json' };`)
  })

  test('Fail loudly if the whole file cannot be converted to supported syntax', () => {
    const source = `
import data3 from './data.json' assert { type: 'json' };
const params = inputs as Params; // this line will fail
import data2 from './data.json' assert { type: 'json' };
`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    expect(() => rewriteSourceImportAssertions(source)).toThrowError()
  })

  test('Handles jsx/tsx syntax', () => {
    const source = `/** @jsx h */
import { h, ssr, tw } from "https://crux.land/nanossr@0.0.1";

import data5 from './data.json' assert { type: 'json' };
console.assert(true, 'should be true');

const Hello = (props) => (
  <div class={tw\`bg-white flex h-screen\`}>
    <h1 class={tw\`text-5xl text-gray-600 m-auto mt-20\`}>Hello {props.name}!</h1>
  </div>
);

export default function handler(req: Request) {
  return ssr(() => <Hello name={"hello nanossr from http import"} />);
}

export const config = {
  path: "/generated-with-http-import",
};`

    const expectedResult = `/** @jsx h */
import { h, ssr, tw } from "https://crux.land/nanossr@0.0.1";

import data5 from './data.json' with { type: 'json' };
console.assert(true, 'should be true');

const Hello = (props) => (
  <div class={tw\`bg-white flex h-screen\`}>
    <h1 class={tw\`text-5xl text-gray-600 m-auto mt-20\`}>Hello {props.name}!</h1>
  </div>
);

export default function handler(req: Request) {
  return ssr(() => <Hello name={"hello nanossr from http import"} />);
}

export const config = {
  path: "/generated-with-http-import",
};`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(expectedResult)
  })

  describe('dynamic imports', () => {
    test('ignores handles static export assertions', () => {
      const source = `
      export async function test(source) {
        const data1 = await import('./data.json', { assert: { type: 'json' } });
        const data2 = await import('./data.json', { assert: { type: 'json' } });
        const data3 = await import('./data.json');
        const data4 = await import('./data.json', { assert: { type: 'json' } });
      }`

      const expectedResult = `
      export async function test(source) {
        const data1 = await import('./data.json', { with: { type: 'json' } });
        const data2 = await import('./data.json', { with: { type: 'json' } });
        const data3 = await import('./data.json');
        const data4 = await import('./data.json', { with: { type: 'json' } });
      }`

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const result = rewriteSourceImportAssertions(source)

      expect(result).toEqual(expectedResult)
    })
  })
})
