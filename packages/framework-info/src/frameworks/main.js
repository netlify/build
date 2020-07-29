/* eslint-disable import/order */
// We purposely order the following array to ensure the most relevant framework
// is always first, if several frameworks are detected at once
const FRAMEWORKS = [
  // Static site generators
  require('./docusaurus.json'),
  require('./eleventy.json'),
  require('./gatsby.json'),
  require('./gridsome.json'),
  require('./hexo.json'),
  require('./hugo.json'),
  require('./jekyll.json'),
  require('./middleman.json'),
  require('./next.json'),
  require('./nuxt.json'),
  require('./phenomic.json'),
  require('./react-static.json'),
  require('./stencil.json'),
  require('./vuepress.json'),

  // Front-end frameworks
  require('./angular.json'),
  require('./create-react-app.json'),
  require('./ember.json'),
  require('./expo.json'),
  require('./quasar.json'),
  require('./sapper.json'),
  require('./svelte.json'),
  require('./vue.json'),

  // Build tools
  require('./brunch.json'),
  require('./parcel.json')
]

module.exports = { FRAMEWORKS }
