module.exports = {
  onPreBuild: async ({ utils }) => {
    await utils.cache.restore('dist');
  },
  onPostBuild: async ({ utils }) => {
    await utils.cache.save('dist');
  },
};
