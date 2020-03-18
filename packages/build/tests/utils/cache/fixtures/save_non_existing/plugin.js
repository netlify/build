module.exports = {
  async onInit({ utils: { cache } }) {
    await cache.save('non_existing')
    console.log(await cache.has('non_existing'))
  },
}
