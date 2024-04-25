// We purposely order the following array to ensure the most relevant framework
// is always first, if several frameworks are detected at once.

// Therefore, we cannot use `fs.readdir()`.
export const FRAMEWORK_NAMES = [
  // Static site generators
  'astro',
  'docusaurus',
  'docusaurus-v2',
  'eleventy',
  'gatsby',
  'gridsome',
  'hexo',
  'hugo',
  'hydrogen',
  'jekyll',
  'middleman',
  'next-nx',
  'next',
  'blitz',
  'nuxt',
  'nuxt3',
  'phenomic',
  'qwik',
  'react-static',
  'redwoodjs',
  'remix',
  'solid-js',
  'solid-start',
  'stencil',
  'vuepress',
  'assemble',
  'docpad',
  'harp',
  'metalsmith',
  'roots',
  'wintersmith',
  'cecil',
  'zola',

  // Front-end frameworks
  'angular',
  'create-react-app',
  'ember',
  'expo',
  'quasar',
  'quasar-v0.17',
  'sapper',
  'svelte',
  'svelte-kit',
  'vue',

  // Build tools
  'brunch',
  'parcel',
  'grunt',
  'gulp',
  'vite',
  'wmr',
]
