import { describe, test, expect } from 'vitest'
import dedent from 'dedent'
import { transformImportAssertionsToAttributes } from './import-assertions-to-attributes.js'

describe('transformImportAssertionsToAttributes', () => {
  const cases = [
    {
      name: 'rewrites static import assertions to `with` syntax',
      input: "import data from './data.json' assert { type: 'json' }",
      expected: "import data from './data.json' with { type: 'json' };",
    },
    {
      name: 'rewrites export named assertions',
      input: "export { data } from './data.json' assert { type: 'json' }",
      expected: "export { data } from './data.json' with { type: 'json' };",
    },
    {
      name: 'rewrites export all assertions',
      input: "export * from './data.json' assert { type: 'json' }",
      expected: "export * from './data.json' with { type: 'json' };",
    },
    {
      name: 'rewrites dynamic import assertions with identifier keys',
      input: "await import('./foo.json', { assert: { type: 'json' } })",
      expected: dedent`
        await import('./foo.json', {
          with: {
            type: 'json'
          }
        });
      `,
    },
    {
      name: 'rewrites dynamic import assertions with string literal keys',
      input: 'await import("./foo.json", { "assert": { type: "json" } })',
      expected: dedent`
        await import("./foo.json", {
          "with": {
            type: "json"
          }
        });
      `,
    },
    {
      name: 'leaves dynamic imports without options untouched',
      input: "await import('./foo.json');",
      expected: "await import('./foo.json');",
    },
    {
      name: 'skips dynamic imports when options are not an object expression',
      input: "await import('./foo.json', null);",
      expected: "await import('./foo.json', null);",
    },
    {
      name: 'leaves static imports without assertions untouched',
      input: "import data from './data.json';",
      expected: "import data from './data.json';",
    },
    {
      name: 'leaves static imports already using `with` syntax untouched',
      input: "import data from './data.json' with { type: 'json' };",
      expected: "import data from './data.json' with { type: 'json' };",
    },
    {
      name: 'rewrites multiple import assertions',
      input: "import data from './data.json' assert { type: 'json', foo: 'bar' }",
      expected: "import data from './data.json' with { type: 'json', foo: 'bar' };",
    },
    {
      name: 'leaves export named without assertions untouched',
      input: "export { data } from './data.json';",
      expected: "export { data } from './data.json';",
    },
    {
      name: 'leaves export all without assertions untouched',
      input: "export * from './data.json';",
      expected: "export * from './data.json';",
    },
    {
      name: 'handles dynamic imports with `with` already present',
      input: "await import('./foo.json', { with: { type: 'json' } });",
      expected: dedent`
        await import('./foo.json', {
          with: {
            type: 'json'
          }
        });
      `,
    },
    {
      name: 'preserves other properties alongside rewritten assert in dynamic imports',
      input: "await import('./foo.json', { assert: { type: 'json' }, cache: true })",
      expected: dedent`
        await import('./foo.json', {
          with: {
            type: 'json'
          },
          cache: true
        });
      `,
    },
    {
      name: 'skips spread elements in dynamic import options',
      input: "const opts = { type: 'json' }; await import('./foo.json', { ...opts });",
      expected: dedent`
        const opts = {
          type: 'json'
        };
        await import('./foo.json', {
          ...opts
        });
      `,
    },
    {
      name: 'handles TypeScript code with import assertions',
      input: "import data from './data.json' assert { type: 'json' };\nconst x: string = data.name;",
      expected: dedent`
        import data from './data.json' with { type: 'json' };
        const x: string = data.name;
      `,
    },
    {
      name: 'handles JSX code with import assertions',
      input: "import data from './data.json' assert { type: 'json' };\nconst el = <div>{data.name}</div>;",
      expected: dedent`
        import data from './data.json' with { type: 'json' };
        const el = <div>{data.name}</div>;
      `,
    },
    {
      name: 'handles multiple imports in the same file',
      input: dedent`
        import a from './a.json' assert { type: 'json' };
        import b from './b.json' assert { type: 'json' };
        import c from './c.js';
      `,
      expected: dedent`
        import a from './a.json' with { type: 'json' };
        import b from './b.json' with { type: 'json' };
        import c from './c.js';
      `,
    },
    {
      name: 'handles mixed static and dynamic imports',
      input: dedent`
        import data from './data.json' assert { type: 'json' };
        const other = await import('./other.json', { assert: { type: 'json' } });
      `,
      expected: dedent`
        import data from './data.json' with { type: 'json' };
        const other = await import('./other.json', {
          with: {
            type: 'json'
          }
        });
      `,
    },
    {
      name: 'does not modify non-assert properties in dynamic import options',
      input: "await import('./foo.json', { cache: 'force-cache' });",
      expected: dedent`
        await import('./foo.json', {
          cache: 'force-cache'
        });
      `,
    },
    {
      name: 'handles computed property keys in dynamic import options (skips them)',
      input: "const key = 'assert'; await import('./foo.json', { [key]: { type: 'json' } });",
      expected: dedent`
        const key = 'assert';
        await import('./foo.json', {
          [key]: {
            type: 'json'
          }
        });
      `,
    },
    {
      name: 'rewrites default export with assertions',
      input: "export { default } from './data.json' assert { type: 'json' };",
      expected: "export { default } from './data.json' with { type: 'json' };",
    },
  ] as const

  test.each(cases)('$name', ({ input, expected }) => {
    expect(transformImportAssertionsToAttributes(input)).toBe(expected)
  })
})
