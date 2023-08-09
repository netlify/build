module.exports = {
  onPreDev: (...args) => {
    console.log('>> onPreDev');
  },
  onPreBuild: async ({ utils }) => {
    console.log(`>> onPreBuild`);
  },
  onPostBuild: async ({ utils }) => {
    console.log(`>> onPostBuild`);
  },
};
