/** @jsx h */

function h(type: any, props: any, ...children: any[]) {
  return { type, props: props || {}, children };
}

import staticAssertJson from './data.json' assert { type: 'json' }
const staticAssertJsonValue: string = staticAssertJson.value
void staticAssertJsonValue

const jsxElement = <div>{staticAssertJsonValue}</div>
void jsxElement
import dataAlreadyWith from './data.json' with { type: 'json' }

export * from './exported.json' assert { type: 'json' }
export { default as defaultAssertJson } from './default.json' assert { type: 'json' }
export { default as defaultWithJson } from './default.json' with { type: 'json' }

const dynamicAssertIdentifier = await import('./data.json', { assert: { type: 'json' } })
const dynamicWithIdentifier = await import('./data.json', { with: { type: 'json' } })

const dynamicAssertStringLiteral = await import('./data.json', { "assert": { type: "json" } })
const dynamicWithStringLiteral = await import('./data.json', { "with": { type: "json" } })

const importAssertAlready = await import('./data.json', { assert: { type: 'json' }, foo: 'bar' })
const importWithAlready = await import('./data.json', { with: { type: 'json' }, foo: 'bar' })

await import('./data.json', { assert: { type: 'json' } })
await import('./data.json', { with: { type: 'json' } })
const importNullOptions = async () => await import('./data.json', null as unknown as Record<string, never>)
void importNullOptions

const cacheOnlyImport = async () => await import('./data.json', { cache: 'force-cache' })
void cacheOnlyImport


export default async () => {
    const [
        assertIdentifier, 
        withIdentifier,
        assertStringLiteral,
        withStringLiteral,
        assertAlready,
        withAlready,
        nullOptions,
        cacheOnly,
        alreadyWith
    ] = await Promise.all([
        dynamicAssertIdentifier,
        dynamicWithIdentifier,
        dynamicAssertStringLiteral,
        dynamicWithStringLiteral,
        importAssertAlready,
        importWithAlready,
        importNullOptions(),
        cacheOnlyImport(),
        dataAlreadyWith
    ])

    const payload = {
        assertIdentifier: assertIdentifier.value,
        withIdentifier: withIdentifier.value,
        assertStringLiteral: assertStringLiteral.value,
        withStringLiteral: withStringLiteral.value,
        assertAlready: assertAlready.value,
        withAlready: withAlready.value,
        nullOptions: nullOptions.value,
        cacheOnly: cacheOnly.value,
        alreadyWith: alreadyWith.value,
    }

  return new Response(JSON.stringify(payload), {
    headers: {
      'content-type': 'application/json',
    },
  })
}

