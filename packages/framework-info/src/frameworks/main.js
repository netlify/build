/* eslint-disable node/global-require,import/max-dependencies */
// We purposely order the following array to ensure the most relevant framework
// is always first, if several frameworks are detected at once
const FRAMEWORKS = [
  // Static site generators
  require('./docusaurus.json'),
  require('./docusaurus-v2.json'),
  require('./eleventy.json'),
  require('./gatsby.json'),
  require('./gridsome.json'),
  require('./hexo.json'),
  require('./hugo.json'),
  require('./jekyll.json'),
  require('./middleman.json'),
  require('./next.json'),
  require('./blitz.json'),
  require('./nuxt.json'),
  require('./phenomic.json'),
  require('./react-static.json'),
  require('./redwoodjs.json'),
  require('./stencil.json'),
  require('./vuepress.json'),
  require('./assemble.json'),
  require('./docpad.json'),
  require('./harp.json'),
  require('./metalsmith.json'),
  require('./roots.json'),
  require('./wintersmith.json'),

  // Front-end frameworks
  require('./angular.json'),
  require('./create-react-app.json'),
  require('./ember.json'),
  require('./expo.json'),
  require('./quasar.json'),
  require('./quasar-v0.17.json'),
  require('./sapper.json'),
  require('./svelte.json'),
  require('./vue.json'),

  // Build tools
  require('./brunch.json'),
  require('./parcel.json'),
  require('./grunt.json'),
  require('./gulp.json'),
  require('./vite.json'),
]

/* eslint-enable node/global-require,import/max-dependencies */

module.exports = { FRAMEWORKS }
