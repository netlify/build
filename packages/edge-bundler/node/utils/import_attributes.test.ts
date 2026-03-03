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

import * as utils from './utils' assert { type: 'json' };
import a from './a.json' assert { type: 'json' };
import b from './b.css' assert { type: 'css' };
import c from './c.js';

import d from './a.json' with { type: 'json' };
import e from './b.css' with { type: 'css' };
import f from './c.js';

import * as abc from './data.json' assert { type: 'json' }; import { def } from './data.json' assert { type: 'json' };
`

    const expectedResult = `import data1 from './data.json' with { type: 'json' };
import * as data2 from './data.json' with { type: 'json' };
import { foo } from './data.json' with { type: 'json' };
import data3 from './data.json' with { type: 'json' };
import data4 from './data.json';
import data5 from './data.json' with { type: 'json' };
import data6 from './data.json' with { type: 'json' };

import * as utils from './utils' with { type: 'json' };
import a from './a.json' with { type: 'json' };
import b from './b.css' with { type: 'css' };
import c from './c.js';

import d from './a.json' with { type: 'json' };
import e from './b.css' with { type: 'css' };
import f from './c.js';

import * as abc from './data.json' with { type: 'json' }; import { def } from './data.json' with { type: 'json' };
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
    const source = `
    export { default } from './data.json' assert { type: 'json' };
    export * from './x.json' assert { type: 'json' };`
    const expectedResult = `
    export { default } from './data.json' with { type: 'json' };
    export * from './x.json' with { type: 'json' };`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(expectedResult)
  })

  test('handles TS/TSX syntax', () => {
    const source = `import React from "https://esm.sh/react";
import { renderToReadableStream } from "https://esm.sh/react-dom/server";
import type { Config, Context } from "@netlify/edge-functions";

export default async function handler(req: Request, context: Context): Response {
  // const data1 = (await import('./x.json', { assert: { type: 'json' } })) as Config
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

    const expectedResult = `import React from "https://esm.sh/react";
import { renderToReadableStream } from "https://esm.sh/react-dom/server";
import type { Config, Context } from "@netlify/edge-functions";

export default async function handler(req: Request, context: Context): Response {
  // const data1 = (await import('./x.json', { assert: { type: 'json' } })) as Config
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

    expect(result).toEqual(expectedResult)
  })

  test('handles TSAsExpression despite no support in acorn-walk', () => {
    const source = `
import data3 from './data.json' assert { type: 'json' };
const params = inputs as Params;
import data2 from './data.json' assert { type: 'json' };
`
    const expectedResult = `
import data3 from './data.json' with { type: 'json' };
const params = inputs as Params;
import data2 from './data.json' with { type: 'json' };
`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(expectedResult)
  })

  test('handles JSXElement despite no support in acorn-walk', () => {
    const source = `<><Component prop={() => import('./foo.json', { assert: { type: 'json' } })} /></>`
    const expectedResult = `<><Component prop={() => import('./foo.json', { with: { type: 'json' } })} /></>`

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const result = rewriteSourceImportAssertions(source)

    expect(result).toEqual(expectedResult)
  })

  test('handles JSX/TSX syntax', () => {
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

  test(`Complex case - preserves formatting`, () => {
    const source = `
import { createRequire } from 'node:module';
import data from './data.json' assert { type: 'json' };
import systemOfADown from './system;of;a;down.json' assert { type: 'json' };
import { default as config } from './config.json'assert{type: 'json'};
import { thing } from "./data.json"assert{type: 'json'};
const require = createRequire(import.meta.url);
const foo = require('./foo.ts');

const data2 = await import('./data2.json', {
	assert: { type: 'json' },
});

await import('foo-bis');

// This is a comment
import data3 from './data.json' assert {
  type: 'json'
};

// Another import
import css from './styles.css' assert {
  type: 'css'
};`

    const expectedResult = `
import { createRequire } from 'node:module';
import data from './data.json' with { type: 'json' };
import systemOfADown from './system;of;a;down.json' with { type: 'json' };
import { default as config } from './config.json'with{type: 'json'};
import { thing } from "./data.json"with{type: 'json'};
const require = createRequire(import.meta.url);
const foo = require('./foo.ts');

const data2 = await import('./data2.json', {
	with: { type: 'json' },
});

await import('foo-bis');

// This is a comment
import data3 from './data.json' with {
  type: 'json'
};

// Another import
import css from './styles.css' with {
  type: 'css'
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
