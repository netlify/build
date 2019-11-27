const nock = require('nock')

module.exports = {
  name: 'netlify-plugin-test',
  scopes: ['getSite', '*'],
  async init({ api, api: { scheme, host, pathPrefix } }) {
    const scope = nock(`${scheme}://${host}`)
    scope.get(`${pathPrefix}/sites`).reply(200, [{ id: 'test' }])

    const sites = await api.listSites('https://example.com')
    console.log(sites)

    scope.done()
    nock.restore()
  },
}
