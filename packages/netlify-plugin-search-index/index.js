const path = require('path')
const fs = require('fs')
const { promisify } = require('util')

const htmlToText = require('html-to-text')

function netlifyPluginSearchIndex(pluginConfig) {
  return {
    name: '@netlify/plugin-search-index',
    // scopes: ['listSites'],
    init({ api }) {
      console.log('init')
    },
    async postBuild(opts) {
      // const { api } = opts
      const { CACHE_DIR, BUILD_DIR } = opts.constants // where we start from
      console.log('hihihihi')
      console.log({ BUILD_DIR })

      // let BUILD_DIR = opts.config.build.publish // build folder from netlify config.. there ought to be a nicer way to get this if set elsewhere
      if (typeof BUILD_DIR === 'undefined') {
        throw new Error('must specify publish dir in netlify config [build] section')
      }

      const buildFolderPath = path.resolve(BUILD_DIR)
      let newManifest = []
      newManifest = await walk(buildFolderPath)
      newManifest = newManifest.filter(x => x.endsWith('.html'))
      console.log({ newManifest })
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
      let searchIndexPath = path.join(CACHE_DIR, 'searchIndex.json')
      ensureDirectoryExistence(searchIndexPath)
      fs.writeFileSync(searchIndexPath, JSON.stringify(searchIndex))

      // console.log('Finally... get site count')
      // const sites = await api.listSites()
      // if (sites) {
      //   console.log(`Site count! ${sites.length}`)
      // }
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
