import { Angular } from './angular.js'
import { Assemble } from './assemble.js'
import { Astro } from './astro.js'
import { Blitz } from './blitz.js'
import { Brunch } from './brunch.js'
import { Cecil } from './cecil.js'
import { DocPad } from './docpad.js'
import { Docusaurus } from './docusaurus.js'
import { Eleventy } from './eleventy.js'
import { Ember } from './ember.js'
import { Expo } from './expo.js'
import { Gatsby } from './gatsby.js'
import { Gridsome } from './gridsome.js'
import { Grunt } from './grunt.js'
import { Gulp } from './gulp.js'
import { Harp } from './harp.js'
import { Hexo } from './hexo.js'
import { Hugo } from './hugo.js'
import { Hydrogen } from './hydrogen.js'
import { Jekyll } from './jekyll.js'
import { Metalsmith } from './metalsmith.js'
import { Middleman } from './middleman.js'
import { Next } from './next.js'
import { Nuxt } from './nuxt.js'
import { Observable } from './observable.js'
import { Parcel } from './parcel.js'
import { Phenomic } from './phenomic.js'
import { Quasar } from './quasar.js'
import { Qwik } from './qwik.js'
import { ReactStatic } from './react-static.js'
import { CreateReactApp } from './react.js'
import { RedwoodJS } from './redwoodjs.js'
import { Remix } from './remix.js'
import { Roots } from './roots.js'
import { Sapper } from './sapper.js'
import { SolidStart } from './solid-start.js'
import { Solid } from './solid.js'
import { Stencil } from './stencil.js'
import { SvelteKit } from './svelte-kit.js'
import { Svelte } from './svelte.js'
import { Vinxi } from './vinxi.js'
import { Vite } from './vite.js'
import { Vue } from './vue.js'
import { VuePress } from './vuepress.js'
import { Wintersmith } from './wintersmith.js'
import { WMR } from './wmr.js'
import { Zola } from './zola.js'

export const frameworks = [
  // Static site generators
  Astro,
  Docusaurus,
  Eleventy,
  Gatsby,
  Gridsome,
  Hexo,
  Hugo,
  Hydrogen,
  Jekyll,
  Middleman,
  Next,
  Blitz,
  Nuxt,
  Phenomic,
  Qwik,
  ReactStatic,
  RedwoodJS,
  Remix,
  Solid,
  SolidStart,
  Stencil,
  VuePress,
  Assemble,
  DocPad,
  Harp,
  Metalsmith,
  Roots,
  Wintersmith,
  Cecil,
  Zola,
  Observable,

  // Front-end frameworks
  Angular,
  CreateReactApp,
  Ember,
  Expo,
  Quasar,
  Sapper,
  Svelte,
  SvelteKit,
  Vue,
  Vinxi,

  // Build tools
  Brunch,
  Parcel,
  Gulp,
  Grunt,
  Vite,
  WMR,
]

type Frameworks = typeof frameworks
// To get a list of the names it's required that ALL Frameworks have the id property as `readonly`
export type FrameworkName = InstanceType<Frameworks[number]>['id']
export type { FrameworkInfo, PollingStrategy } from './framework.js'
