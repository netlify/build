const { tmpdir } = require('os')
const path = require('path')
const fs = require('fs')
const { promisify } = require('util')
const {
  env: { DEPLOY_ID },
} = require('process')

const cpy = require('cpy')
const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
const htmlToText = require('html-to-text')

const isNetlifyCI = require('../build/src/utils/is-netlify-ci')  // eslint-disable-line node/no-unpublished-require

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
      newManifest = await walk(buildFolderPath)
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
      if (fs.existsSync(searchIndexPath)) {
        console.warn(
          `searchIndex detected at ${searchIndexPath}, will overwrite for this build but this may indicate an accidental conflict`,
        )
      }
      ensureDirectoryExistence(searchIndexPath)
      let stringifiedIndex = JSON.stringify(searchIndex)
      fs.writeFileSync(searchIndexPath, stringifiedIndex)

      // copy out to an intermediate functions dir inside the build dir
      // i'm not 100% sure this is the best place to put it, we can move in future
      const functionsDir = 'searchIndexFunction'
      const buildDir = path.resolve(build.publish)
      const buildDirFunctions = path.resolve(buildDir, functionsDir)
      ensureDirectoryExistence(buildDirFunctions)
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

const readdir = promisify(fs.readdir)
// recursive crawl to get a list of filepaths
// https://gist.github.com/kethinov/6658166
var walk = async function(dir, filelist) {
  var files = await readdir(dir)
  filelist = filelist || []
  await Promise.all(
    files.map(async function(file) {
      const dirfile = path.join(dir, file)
      if (fs.statSync(dirfile).isDirectory()) {
        filelist = await walk(dirfile + '/', filelist)
      } else {
        filelist.push(dirfile)
      }
    }),
  )
  return filelist
}

// https://stackoverflow.com/questions/13542667/create-directory-when-writing-to-file-in-node-js
function ensureDirectoryExistence(filePath) {
  var dirname = path.dirname(filePath)
  if (fs.existsSync(dirname)) {
    return true
  }
  ensureDirectoryExistence(dirname)
  fs.mkdirSync(dirname)
}
