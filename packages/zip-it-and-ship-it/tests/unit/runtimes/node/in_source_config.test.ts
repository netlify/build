import { describe, expect, test } from 'vitest'

import { parseSource } from '../../../../src/runtimes/node/in_source_config/index.js'
import { getLogger } from '../../../../src/utils/logger.js'

describe('`schedule` helper', () => {
  const options = { functionName: 'func1', featureFlags: {}, logger: getLogger() }

  test('CommonJS file with `schedule` helper', () => {
    const source = `const { schedule } = require("@netlify/functions")

    exports.handler = schedule("@daily", () => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: { schedule: '@daily' }, inputModuleFormat: 'cjs', runtimeAPIVersion: 1 })
  })

  test('CommonJS file with `schedule` helper renamed locally', () => {
    const source = `const { schedule: somethingElse } = require("@netlify/functions")

    exports.handler = somethingElse("@daily", () => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: { schedule: '@daily' }, inputModuleFormat: 'cjs', runtimeAPIVersion: 1 })
  })

  test('CommonJS file importing from a package other than "@netlify/functions"', () => {
    const source = `const { schedule } = require("@not-netlify/not-functions")

    exports.handler = schedule("@daily", () => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: {}, inputModuleFormat: 'cjs', runtimeAPIVersion: 1 })
  })

  test.todo('CommonJS file with `schedule` helper exported from a variable', () => {
    const source = `const { schedule } = require("@netlify/functions")

    const handler = schedule("@daily", () => {})

    exports.handler = handler`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: { schedule: '@daily' }, inputModuleFormat: 'cjs', runtimeAPIVersion: 1 })
  })

  test('ESM file with `schedule` helper', () => {
    const source = `import { schedule } from "@netlify/functions"

    export const handler = schedule("@daily", () => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: { schedule: '@daily' }, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
  })

  test('ESM file with `schedule` helper renamed locally', () => {
    const source = `import { schedule as somethingElse } from "@netlify/functions"

    export const handler = somethingElse("@daily", () => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: { schedule: '@daily' }, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
  })

  test('ESM file importing from a package other than "@netlify/functions"', () => {
    const source = `import { schedule } from "@not-netlify/not-functions"

    export const handler = schedule("@daily", () => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: {}, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
  })

  test('ESM file with `handler` exported from a variable', () => {
    const source = `import { schedule } from "@netlify/functions"

    const handler = schedule("@daily", () => {})

    export { handler }`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: { schedule: '@daily' }, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
  })
})

describe('`stream` helper', () => {
  const options = { functionName: 'func1', featureFlags: {}, logger: getLogger() }

  test('CommonJS file with the `stream` helper', () => {
    const source = `import { stream } from "@netlify/functions"

    exports.handler = stream(() => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: {}, inputModuleFormat: 'esm', invocationMode: 'stream', runtimeAPIVersion: 1 })
  })

  test('CommonJS file importing from a package other than "@netlify/functions"', () => {
    const source = `import { stream } from "@netlify/something-else"

    exports.handler = stream(() => {})`

    const isc = parseSource(source, options)

    expect(isc).toEqual({ config: {}, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
  })
})

describe('V2 API', () => {
  const options = {
    functionName: 'func1',
    logger: getLogger(),
  }

  describe('Detects the correct runtime API version', () => {
    test('ESM file with a default export and no `handler` export', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }`
      const isc = parseSource(source, { ...options })

      expect(isc).toEqual({
        config: {},
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('ESM file with a default export and a `handler` export', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }

      export const handler = function () { return { statusCode: 200, body: "Hello!" } }`

      const isc = parseSource(source, options)

      expect(isc).toEqual({ config: {}, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
    })

    test('ESM file with no default export and a `handler` export', () => {
      const source = `const handler = async () => ({ statusCode: 200, body: "Hello" })

      export { handler }`

      const isc = parseSource(source, options)

      expect(isc).toEqual({ config: {}, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
    })

    test('ESM file with default exporting a function', () => {
      const source = `
      const handler = async () => ({ statusCode: 200, body: "Hello" })
      export default handler;`

      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: {},
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('ESM file with default export of variable and separate handler export', () => {
      const source = `
      const foo = 'foo'
      export default foo;
      export const handler = () => ({ statusCode: 200, body: "Hello" })`

      const isc = parseSource(source, options)
      expect(isc).toEqual({ config: {}, inputModuleFormat: 'esm', runtimeAPIVersion: 1 })
    })

    test('ESM file with default export wrapped in a literal from an arrow function', () => {
      const source = `
      const handler = async () => ({ statusCode: 200, body: "Hello" })
      export const config = { schedule: "@daily" }
      export { handler as default };`

      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: { schedule: '@daily' },
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('ESM file with separate config export', () => {
      const source = `
      const handler = async () => ({ statusCode: 200, body: "Hello" })
      const config = { schedule: "@daily" }
      export { config };
      export default handler
      `
      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: { schedule: '@daily' },
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('ESM file with default export and named export', () => {
      const source = `
      const handler = async () => ({ statusCode: 200, body: "Hello" })
      const config = { schedule: "@daily" }
      export { handler as default, config };`

      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: { schedule: '@daily' },
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    // This is the Remix handler
    test('ESM file with handler generated by a function, exported in same expression as config', () => {
      const source = `
      var handler = createRequestHandler({
        build: server_build_exports,
        mode: "production"
      }), server_default = handler, config = {
        path: "/*"
      };
      export {
        config,
        server_default as default
      };
      `

      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: { path: ['/*'] },
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [
          {
            expression: '^(?:\\/(.*))\\/?$',
            methods: [],
            pattern: '/*',
          },
        ],
        runtimeAPIVersion: 2,
      })
    })

    // Another version of the Remix handler
    test('ESM file with handler generated by a function, exported in same expression as config, but handler is not called `handler`', () => {
      const source = `
      const server_default = createRequestHandler({ build: server_build_exports, mode: "production" })
      export { server_default as default };
      `

      const isc = parseSource(source, options)
      expect(isc.runtimeAPIVersion).toEqual(2)
    })

    // Example for the Astro handler
    test('ESM file with named `default` export renamed from a local binding', () => {
      const source = `
      const _exports = adapter.createExports(_manifest, _args)
      const _default = _exports['default']

      export { _default as default };
      `

      const isc = parseSource(source, options)
      expect(isc.runtimeAPIVersion).toEqual(2)
    })

    test('ESM file with default export wrapped in a literal from a function', () => {
      const source = `
      async function handler(){ return { statusCode: 200, body: "Hello" }}
      export { handler as default };`

      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: {},
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('ESM file with default export exporting a constant', () => {
      const source = `
      const foo = "bar"
      export { foo as default };`

      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: {},
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('TypeScript file with a default export and no `handler` export', () => {
      const source = `export default async (req: Request) => {
        return new Response("Hello!")
      }`

      const isc = parseSource(source, options)

      expect(isc).toEqual({
        config: {},
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('CommonJS file with a default export and a `handler` export', () => {
      const source = `exports.default = async () => {
        return new Response("Hello!")
      }

      exports.handler = async () => ({ statusCode: 200, body: "Hello!" })`

      const isc = parseSource(source, options)

      expect(isc).toEqual({ config: {}, inputModuleFormat: 'cjs', runtimeAPIVersion: 1 })
    })

    test('CommonJS file with a default export and no `handler` export', () => {
      const source = `exports.default = async () => {
        return new Response("Hello!")
      }`

      const isc = parseSource(source, options)

      expect(isc).toEqual({
        config: {},
        excludedRoutes: [],
        inputModuleFormat: 'cjs',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('ESM file with a default export consisting of a function call', () => {
      const source = `import * as build from "@remix-run/dev/server-build";
      import { createRequestHandler } from "@netlify/remix-edge-adapter";
      
      export default createRequestHandler({ build });`

      const isc = parseSource(source, options)

      expect(isc).toEqual({
        config: {},
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })

    test('Config export with string literal properties', () => {
      const source = `
      const handler = async () => ({ statusCode: 200, body: "Hello" })
      const config = { "path": "/products/:id", excludedPath: "/products/jacket" }
      export { config };
      export default handler
      `
      const isc = parseSource(source, options)
      expect(isc).toEqual({
        config: { path: ['/products/:id'], excludedPath: ['/products/jacket'] },
        excludedRoutes: [
          {
            literal: '/products/jacket',
            pattern: '/products/jacket',
          },
        ],
        inputModuleFormat: 'esm',
        routes: [
          {
            expression: '^\\/products(?:\\/([^\\/]+?))\\/?$',
            methods: [],
            pattern: '/products/:id',
            prefer_static: undefined,
          },
        ],
        runtimeAPIVersion: 2,
      })
    })
  })

  describe('`scheduled` property', () => {
    test('Using a cron expression string', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }

      export const config = {
        schedule: "@daily"
      }`

      const isc = parseSource(source, options)

      expect(isc).toEqual({
        config: { schedule: '@daily' },
        excludedRoutes: [],
        inputModuleFormat: 'esm',
        routes: [],
        runtimeAPIVersion: 2,
      })
    })
  })

  describe('`method` property', () => {
    test('Using an array', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }

      export const config = {
        method: ["GET", "POST"]
      }`

      const { config } = parseSource(source, options)

      expect(config?.method).toEqual(['GET', 'POST'])
    })

    test('Using single method', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }

      export const config = {
        method: "GET"
      }`

      const { config } = parseSource(source, options)

      expect(config?.method).toEqual(['GET'])
    })
  })

  describe('`path` property', () => {
    describe('Thows an error when invalid values are supplied', () => {
      test('Missing a leading slash', () => {
        expect.assertions(4)

        const source = `export default async () => {
          return new Response("Hello!")
        }

        export const config = {
          path: "missing-slash"
        }`

        try {
          parseSource(source, options)
        } catch (error) {
          const { customErrorInfo, message } = error

          expect(message).toBe(`Function func1 has a configuration error on 'path': Must start with a '/'`)
          expect(customErrorInfo.type).toBe('functionsBundling')
          expect(customErrorInfo.location.functionName).toBe('func1')
          expect(customErrorInfo.location.runtime).toBe('js')
        }
      })

      test('An invalid pattern', () => {
        expect.assertions(4)

        const source = `export default async () => {
          return new Response("Hello!")
        }

        export const config = {
          path: "/products("
        }`

        try {
          parseSource(source, options)
        } catch (error) {
          const { customErrorInfo, message } = error

          expect(message).toBe(`'/products(' is not a valid path according to the URLPattern specification`)
          expect(customErrorInfo.type).toBe('functionsBundling')
          expect(customErrorInfo.location.functionName).toBe('func1')
          expect(customErrorInfo.location.runtime).toBe('js')
        }
      })

      test('A non-string value', () => {
        expect.assertions(4)

        const source = `export default async () => {
          return new Response("Hello!")
        }

        export const config = {
          path: {
            url: "/products"
          }
        }`

        try {
          parseSource(source, options)
        } catch (error) {
          const { customErrorInfo, message } = error

          expect(message).toBe(
            `Function func1 has a configuration error on 'path': Must be a string or array of strings`,
          )
          expect(customErrorInfo.type).toBe('functionsBundling')
          expect(customErrorInfo.location.functionName).toBe('func1')
          expect(customErrorInfo.location.runtime).toBe('js')
        }
      })

      test('An invalid pattern in a group', () => {
        expect.assertions(4)

        try {
          const source = `export default async () => {
            return new Response("Hello!")
          }

          export const config = {
            path: ["/store", "/products("]
          }`

          parseSource(source, options)
        } catch (error) {
          const { customErrorInfo, message } = error

          expect(message).toBe(`'/products(' is not a valid path according to the URLPattern specification`)
          expect(customErrorInfo.type).toBe('functionsBundling')
          expect(customErrorInfo.location.functionName).toBe('func1')
          expect(customErrorInfo.location.runtime).toBe('js')
        }
      })

      test('A non-string value in a group', () => {
        expect.assertions(4)

        try {
          const source = `export default async () => {
            return new Response("Hello!")
          }

          export const config = {
            path: ["/store", 42]
          }`

          parseSource(source, options)
        } catch (error) {
          const { customErrorInfo, message } = error

          expect(message).toBe(
            `Function func1 has a configuration error on 'path': Must be a string or array of strings`,
          )
          expect(customErrorInfo.type).toBe('functionsBundling')
          expect(customErrorInfo.location.functionName).toBe('func1')
          expect(customErrorInfo.location.runtime).toBe('js')
        }
      })

      test('A `null` value in a group', () => {
        expect.assertions(4)

        try {
          const source = `export default async () => {
            return new Response("Hello!")
          }

          export const config = {
            path: ["/store", null]
          }`

          parseSource(source, options)
        } catch (error) {
          const { customErrorInfo, message } = error

          expect(message).toBe(
            `Function func1 has a configuration error on 'path': Must be a string or array of strings`,
          )
          expect(customErrorInfo.type).toBe('functionsBundling')
          expect(customErrorInfo.location.functionName).toBe('func1')
          expect(customErrorInfo.location.runtime).toBe('js')
        }
      })

      test('An `undefined` value in a group', () => {
        expect.assertions(4)

        try {
          const source = `export default async () => {
            return new Response("Hello!")
          }

          export const config = {
            path: ["/store", undefined]
          }`

          parseSource(source, options)
        } catch (error) {
          const { customErrorInfo, message } = error

          expect(message).toBe(
            `Function func1 has a configuration error on 'path': Must be a string or array of strings`,
          )
          expect(customErrorInfo.type).toBe('functionsBundling')
          expect(customErrorInfo.location.functionName).toBe('func1')
          expect(customErrorInfo.location.runtime).toBe('js')
        }
      })
    })

    describe('Using a literal pattern', () => {
      test('ESM', () => {
        const source = `export default async () => {
          return new Response("Hello!")
        }

        export const config = {
          path: "/products"
        }`

        const { routes } = parseSource(source, options)

        expect(routes).toEqual([{ pattern: '/products', literal: '/products', methods: [] }])
      })

      test('CJS', () => {
        const source = `exports.default = async () => {
          return new Response("Hello!")
        }

        exports.config = {
          path: "/products"
        }`

        const { routes } = parseSource(source, options)

        expect(routes).toEqual([{ pattern: '/products', literal: '/products', methods: [] }])
      })
    })

    test('Using a pattern with named group', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }

      export const config = {
        path: "/store/:category/products/:product-id"
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([
        {
          pattern: '/store/:category/products/:product-id',
          expression: '^\\/store(?:\\/([^\\/]+?))\\/products(?:\\/([^\\/]+?))-id\\/?$',
          methods: [],
        },
      ])
    })

    test('Using multiple paths', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }

      export const config = {
        path: [
          "/store/:category/products/:product-id",
          "/product/:product-id",
          "/super-awesome-campaign"
        ]
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([
        {
          pattern: '/store/:category/products/:product-id',
          expression: '^\\/store(?:\\/([^\\/]+?))\\/products(?:\\/([^\\/]+?))-id\\/?$',
          methods: [],
        },
        {
          pattern: '/product/:product-id',
          expression: '^\\/product(?:\\/([^\\/]+?))-id\\/?$',
          methods: [],
        },
        { pattern: '/super-awesome-campaign', literal: '/super-awesome-campaign', methods: [] },
      ])
    })

    test('De-duplicates paths', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }

      export const config = {
        path: ["/products", "/products"]
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([{ pattern: '/products', literal: '/products', methods: [] }])
    })
  })

  describe('`preferStatic` property', () => {
    test('Sets a `prefer_static` property on a single route', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }
  
      export const config = {
        path: "/products",
        preferStatic: true
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([{ pattern: '/products', literal: '/products', methods: [], prefer_static: true }])
    })

    test('Sets a `prefer_static` property on all routes', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }
  
      export const config = {
        path: ["/items", "/products"],
        preferStatic: true
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([
        { pattern: '/items', literal: '/items', methods: [], prefer_static: true },
        { pattern: '/products', literal: '/products', methods: [], prefer_static: true },
      ])
    })

    test('Does not set a `prefer_static` property if `preferStatic` is not a boolean', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }
  
      export const config = {
        path: "/products",
        preferStatic: "yep"
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([{ pattern: '/products', literal: '/products', methods: [] }])
    })

    test('Does not set a `prefer_static` property if `preferStatic` is not set', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }
  
      export const config = {
        path: "/products"
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([{ pattern: '/products', literal: '/products', methods: [] }])
    })

    test('Understands minfied true', () => {
      const source = `export default async () => {
        return new Response("Hello!")
      }
  
      export const config = {
        path: "/products",
        preferStatic: !0
      }`

      const { routes } = parseSource(source, options)

      expect(routes).toEqual([{ pattern: '/products', literal: '/products', methods: [], prefer_static: true }])
    })
  })

  test('Understands name and generator', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { name: "foo", generator: "bar@1.2.3" }`

    const isc = parseSource(source, options)
    expect(isc).toEqual({
      config: { generator: 'bar@1.2.3', name: 'foo' },
      excludedRoutes: [],
      inputModuleFormat: 'esm',
      runtimeAPIVersion: 2,
      routes: [],
    })
  })

  describe('Event subscriptions', () => {
    test('Extracts event subscriptions from an object default export with methods', () => {
      const source = `export default { deploySucceeded() {}, fetch() {} }`

      const isc = parseSource(source, options)

      expect(isc.eventSubscriptions).toEqual(['deploy_succeeded', 'fetch'])
      expect(isc.runtimeAPIVersion).toBe(2)
    })

    test('Extracts event subscriptions from a binding-resolved object default export', () => {
      const source = `const h = { deploySucceeded() {} }; export default h`

      const isc = parseSource(source, options)

      expect(isc.eventSubscriptions).toEqual(['deploy_succeeded'])
      expect(isc.runtimeAPIVersion).toBe(2)
    })

    test('Does not set eventSubscriptions for a function default export', () => {
      const source = `export default () => {}`

      const isc = parseSource(source, options)

      expect(isc.eventSubscriptions).toBeUndefined()
      expect(isc.runtimeAPIVersion).toBe(2)
    })

    test('Extracts a single event subscription', () => {
      const source = `export default { fetch() {} }`

      const isc = parseSource(source, options)

      expect(isc.eventSubscriptions).toEqual(['fetch'])
      expect(isc.runtimeAPIVersion).toBe(2)
    })

    test('Ignores unknown property names in the object', () => {
      const source = `export default { deploySucceeded() {}, someHelper() {} }`

      const isc = parseSource(source, options)

      expect(isc.eventSubscriptions).toEqual(['deploy_succeeded'])
      expect(isc.runtimeAPIVersion).toBe(2)
    })

    test('Extracts event subscriptions from a CJS default export', () => {
      const source = `exports.default = { deployFailed() {}, userLogin() {} }`

      const isc = parseSource(source, options)

      expect(isc.eventSubscriptions).toEqual(['deploy_failed', 'identity_login'])
      expect(isc.runtimeAPIVersion).toBe(2)
    })

    test('Extracts event subscriptions from export { x as default }', () => {
      const source = `
      const handlers = { userSignup() {}, userValidate() {} }
      export { handlers as default }`

      const isc = parseSource(source, options)

      expect(isc.eventSubscriptions).toEqual(['identity_signup', 'identity_validate'])
      expect(isc.runtimeAPIVersion).toBe(2)
    })
  })

  test('Understands timeout', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { timeout: 60 }`

    const isc = parseSource(source, options)
    expect(isc).toEqual({
      config: { timeout: 60 },
      excludedRoutes: [],
      inputModuleFormat: 'esm',
      routes: [],
      runtimeAPIVersion: 2,
    })
  })

  describe('Inline config in default export object', () => {
    test('Extracts config from the default export object', () => {
      const source = `export default {
        fetch() { return new Response("Hello") },
        config: { path: "/hello" }
      }`

      const isc = parseSource(source, options)

      expect(isc.runtimeAPIVersion).toBe(2)
      expect(isc.config).toEqual({ path: ['/hello'] })
      expect(isc.routes).toEqual([{ pattern: '/hello', literal: '/hello', methods: [], prefer_static: undefined }])
      expect(isc.eventSubscriptions).toEqual(['fetch'])
    })

    test('Extracts config from a binding-resolved default export object', () => {
      const source = `const handlers = {
        fetch() { return new Response("Hello") },
        config: { path: "/api" }
      }
      export default handlers`

      const isc = parseSource(source, options)

      expect(isc.runtimeAPIVersion).toBe(2)
      expect(isc.config).toEqual({ path: ['/api'] })
      expect(isc.routes).toHaveLength(1)
    })

    test('Named config export takes precedence over inline config', () => {
      const source = `export default {
        fetch() { return new Response("Hello") },
        config: { path: "/inline" }
      }
      export const config = { path: "/named" }`

      const isc = parseSource(source, options)

      expect(isc.config).toEqual({ path: ['/named'] })
    })

    test('An empty named config export overrides inline config', () => {
      const source = `export default {
        fetch() { return new Response("Hello") },
        config: { path: "/inline" }
      }
      export const config = {}`

      const isc = parseSource(source, options)

      expect(isc.config).toEqual({})
    })

    test('Ignores non-object config property', () => {
      const source = `export default {
        fetch() { return new Response("Hello") },
        config: "not-an-object"
      }`

      const isc = parseSource(source, options)

      expect(isc.config).toEqual({})
    })

    test('Extracts config when the default export uses `satisfies`', () => {
      const source = `import type { NetlifyFunction } from "@netlify/functions"
      export default {
        fetch() { return new Response("Hello") },
        config: { path: "/hello" }
      } satisfies NetlifyFunction`

      const isc = parseSource(source, options)

      expect(isc.config).toEqual({ path: ['/hello'] })
      expect(isc.routes).toHaveLength(1)
      expect(isc.eventSubscriptions).toEqual(['fetch'])
    })

    test('Extracts config when the default export uses `as`', () => {
      const source = `import type { NetlifyFunction } from "@netlify/functions"
      export default {
        fetch() { return new Response("Hello") },
        config: { path: "/hello" }
      } as NetlifyFunction`

      const isc = parseSource(source, options)

      expect(isc.config).toEqual({ path: ['/hello'] })
      expect(isc.routes).toHaveLength(1)
    })

    test('Extracts config from a binding whose value uses `satisfies`', () => {
      const source = `import type { NetlifyFunction } from "@netlify/functions"
      const handlers = {
        fetch() { return new Response("Hello") },
        config: { path: "/binding-sat" }
      } satisfies NetlifyFunction
      export default handlers`

      const isc = parseSource(source, options)

      expect(isc.config).toEqual({ path: ['/binding-sat'] })
      expect(isc.routes).toHaveLength(1)
    })
  })

  test('Understands region', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { region: "iad" }`

    const isc = parseSource(source, options)
    expect(isc).toEqual({
      config: { region: 'iad' },
      excludedRoutes: [],
      inputModuleFormat: 'esm',
      routes: [],
      runtimeAPIVersion: 2,
    })
  })

  test('Normalizes region casing to lower case', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { region: "IAD" }`

    const isc = parseSource(source, options)
    expect(isc.config.region).toBe('iad')
  })

  test('Rejects an invalid region', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { region: "not-a-real-region" }`

    expect(() => parseSource(source, options)).toThrow(/region/)
  })

  test('Understands memory as a bare number (interpreted as MB)', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: 2048 }`

    const isc = parseSource(source, options)
    expect(isc.config.memory).toBe(2048)
  })

  test('Understands memory as a human-friendly string with a `gb` unit', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: "2gb" }`

    const isc = parseSource(source, options)
    expect(isc.config.memory).toBe(2048)
  })

  test('Understands memory as a human-friendly string with an `mb` unit', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: "1024mb" }`

    const isc = parseSource(source, options)
    expect(isc.config.memory).toBe(1024)
  })

  test('Normalizes memory unit casing', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: "2GB" }`

    const isc = parseSource(source, options)
    expect(isc.config.memory).toBe(2048)
  })

  test('Rejects memory below the minimum (1024 MB)', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: 512 }`

    expect(() => parseSource(source, options)).toThrow(/memory/)
  })

  test('Rejects memory above the maximum (4096 MB)', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: "5gb" }`

    expect(() => parseSource(source, options)).toThrow(/memory/)
  })

  test('Rejects a malformed memory string', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: "lots" }`

    expect(() => parseSource(source, options)).toThrow(/memory/)
  })

  test('Rejects a fractional memory value', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: 2048.5 }`

    expect(() => parseSource(source, options)).toThrow(/memory/)
  })

  test('Rejects a fractional memory string that resolves to fractional MB', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: "1.7gb" }`

    expect(() => parseSource(source, options)).toThrow(/memory/)
  })

  test('Understands vcpu', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { vcpu: 1.5 }`

    const isc = parseSource(source, options)
    expect(isc.config.vcpu).toBe(1.5)
  })

  test('Accepts vcpu at the minimum (0.5)', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { vcpu: 0.5 }`

    const isc = parseSource(source, options)
    expect(isc.config.vcpu).toBe(0.5)
  })

  test('Accepts vcpu at the maximum (2)', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { vcpu: 2 }`

    const isc = parseSource(source, options)
    expect(isc.config.vcpu).toBe(2)
  })

  test('Rejects vcpu below the minimum (0.5)', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { vcpu: 0.4 }`

    expect(() => parseSource(source, options)).toThrow(/vcpu/)
  })

  test('Rejects vcpu above the maximum (2)', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { vcpu: 2.5 }`

    expect(() => parseSource(source, options)).toThrow(/vcpu/)
  })

  test('Rejects setting both memory and vcpu', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { memory: 2048, vcpu: 1.5 }`

    expect(() => parseSource(source, options)).toThrow(/memory.*vcpu|vcpu.*memory/)
  })

  test('Sets background invocation mode when `config.background` is true', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { path: "/hello", background: true }`

    const isc = parseSource(source, options)
    expect(isc.config.background).toBe(true)
    expect(isc.invocationMode).toBe('background')
    expect(isc.runtimeAPIVersion).toBe(2)
  })

  test('Does not set background invocation mode when `config.background` is false', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { path: "/hello", background: false }`

    const isc = parseSource(source, options)
    expect(isc.invocationMode).toBeUndefined()
  })

  test('Does not set background invocation mode when `config.background` is absent', () => {
    const source = `
    export default async () => new Response("Hello!")
    export const config = { path: "/hello" }`

    const isc = parseSource(source, options)
    expect(isc.invocationMode).toBeUndefined()
  })
})
