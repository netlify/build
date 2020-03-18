const nock = require('nock')

module.exports = {
  name: 'netlify-plugin-test',
  async onInit({ api: { scheme, host, pathPrefix, listSites } }) {
    const scope = nock(`${scheme}://${host}`)
    scope.get(`${pathPrefix}/sites`).reply(200, [{ id: 'test' }])

    const sites = await listSites('https://example.com')
    console.log(sites)

    scope.done()
    nock.restore()
  },
}
