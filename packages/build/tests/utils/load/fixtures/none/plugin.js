module.exports = {
  name: 'netlify-plugin-test',
  // `cache` utils are present because the tests directory is inside
  // `@netlify/build` which include `@netlify/cache-utils` as a `dependencies`.
  // But normal plugins should not get any utils unless installed.
  // eslint-disable-next-line no-unused-vars
  onInit({ utils: { cache, ...utils } }) {
    console.log(utils)
  },
}
