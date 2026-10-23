import nock from 'nock'
import { expect, test } from 'vitest'

import { NetlifyAPI } from './index.js'

const cases = [
  { name: 'snake_case false', params: { configure_dns: false }, expected: { configure_dns: 'false' } },
  {
    name: 'snake_case false takes precedence over camelCase true',
    params: { configure_dns: false, configureDns: true },
    expected: { configure_dns: 'false' },
  },
  { name: 'camelCase false', params: { configureDns: false }, expected: { configure_dns: 'false' } },
  { name: 'snake_case true', params: { configure_dns: true }, expected: { configure_dns: 'true' } },
  { name: 'omitted parameter', params: {}, expected: {} },
]

for (const operation of ['createSite', 'createSiteInTeam'] as const) {
  for (const { name, params, expected } of cases) {
    test(`${operation}: ${name}`, async () => {
      let query: unknown
      const path = operation === 'createSite' ? '/api/v1/sites' : '/api/v1/example/sites'
      const scope = nock('https://api.netlify.com')
        .post(path, { name: 'example' })
        .query((value) => {
          query = value
          return true
        })
        .reply(201, { id: 'example' })
      const client = new NetlifyAPI()

      const result = await client[operation]({ account_slug: 'example', ...params, body: { name: 'example' } })

      expect(result).toEqual({ id: 'example' })
      expect(scope.isDone()).toBe(true)
      expect(query).toEqual(expected)
    })
  }
}
