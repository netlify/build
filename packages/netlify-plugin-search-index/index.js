const { tmpdir } = require('os')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const {
  env: { DEPLOY_ID },
} = require('process')

const makeDir = require('make-dir')
const pathExists = require('path-exists')
const readdirp = require('readdirp')
const cpy = require('cpy')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it') // eslint-disable-line
const htmlToText = require('html-to-text')

const isNetlifyCI = () => Boolean(process.env.DEPLOY_PRIME_URL)

function netlifyPluginSearchIndex(pluginConfig) {
  const searchIndexFolder = pluginConfig.searchIndexFolder || 'searchIndex'
  return {
    name: '@netlify/plugin-search-index',
    // scopes: ['listSites'],

    async postBuild(opts) {
      const { config } = opts
      const { build } = config
      const { BUILD_DIR } = opts.constants // where we start from

      if (typeof BUILD_DIR === 'undefined') {
        throw new Error('must specify publish dir in netlify config [build] section')
      }

      const buildFolderPath = path.resolve(BUILD_DIR)
      let newManifest = []
      newManifest = await readdirp
        .promise(buildFolderPath, { directoryFilter: ['node_modules'] })
        .then(x => x.map(y => y.fullPath))
      newManifest = newManifest.filter(x => x.endsWith('.html'))
      let searchIndex = {}
      let customOpts = {
        // TODO: expose this
        // https://www.npmjs.com/package/html-to-text#options
        wordwrap: 130,
      }
      const readfile = promisify(fs.readFile)
      await Promise.all(
        newManifest.map(htmlFilePath => {
          return readfile(htmlFilePath, 'utf8').then(htmlFileContent => {
            const text = htmlToText.fromString(htmlFileContent, customOpts)
            const indexPath = path.relative(buildFolderPath, htmlFilePath)
            searchIndex[`/${indexPath}`] = text
          })
        }),
      )
      let searchIndexPath = path.join(buildFolderPath, searchIndexFolder, 'searchIndex.json')
      if (await pathExists(searchIndexPath)) {
        console.warn(
          `searchIndex detected at ${searchIndexPath}, will overwrite for this build but this may indicate an accidental conflict`,
        )
      }
      await makeDir(searchIndexPath)
      let stringifiedIndex = JSON.stringify(searchIndex)
      fs.writeFileSync(searchIndexPath, stringifiedIndex)

      // copy out to an intermediate functions dir inside the build dir
      // i'm not 100% sure this is the best place to put it, we can move in future
      const functionsDir = 'searchIndexFunction'
      const buildDir = path.resolve(build.publish)
      const buildDirFunctions = path.resolve(buildDir, functionsDir)
      await pathExists(buildDirFunctions)
      const searchIndexFunctionPath = path.join(buildDirFunctions, 'searchIndex')
      await cpy(__dirname + '/functionTemplate', searchIndexFunctionPath)
      // now we have copied it out to intermediate dir
      // we may want to do some processing/templating
      fs.writeFileSync(path.join(searchIndexFunctionPath, 'searchIndex.json'), stringifiedIndex)
      // and then..
      const destDir = isNetlifyCI() ? `${tmpdir()}/zisi-${DEPLOY_ID}` : '.netlify/functions'
      await zipFunctions(buildDirFunctions, destDir)
      console.log('Files copied!')
      // done with generating functions
    },
  }
}
module.exports = netlifyPluginSearchIndex
