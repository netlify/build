const path = require('path')
const chalk = require('chalk')
const Conf = require('conf') // for simple kv store
const fs = require('fs')
const matchRules = require('./matchRules')
// const test404plugin = true // toggle this off for production
const test404plugin = false // toggle this off for production

function netlify404nomore(conf) {
  let failMode = conf.failMode || 'error' // either 'warn' or 'error'
  let blankSlateMode = conf.blankSlate // boolean, turn off prev file checking. remember to turn back on when you're happy
  let store
  return {
    // kvstore in `${NETLIFY_CACHE_DIR}/${name}.json`
    // we choose to let the user createStore instead of doing it for them
    // bc they may want to set `defaults` and `schema` and `de/serialize`
    init({ constants: { CACHE_DIR } }) {
      store = new Conf({
        cwd: CACHE_DIR,
        configName: 'netlify-plugin-404-no-more'
      })
    },

    /* index html files preDeploy */
    preDeploy: async opts => {
      // console.log({ opts })
      const { BASE_DIR } = opts.constants // where we start from

      let BUILD_DIR = opts.config.build.publish // build folder from netlify config.. there ought to be a nicer way to get this if set elsewhere
      if (typeof BUILD_DIR === 'undefined') {
        throw new Error('must specify publish dir in netlify config [build] section')
      }
      const buildFolderPath = path.join(BASE_DIR, BUILD_DIR)
      const prevManifest = store.get(`manifest`) || []
      if (test404plugin) {
        // add missing paths for testing
        prevManifest.push(path.join(buildFolderPath, '/path/to/missing.html'))
        prevManifest.push(path.join(buildFolderPath, '/path/to/missing2.html'))
        prevManifest.push(path.join(buildFolderPath, '/path/missing3.html'))
      }

      /**
       *
       *
       * DO the big check
       *
       *
       *
       */
      if (!blankSlateMode && prevManifest.length) {
        // deal with redirects
        let prevManifestPostRedirects = []
        let invalidRedirectDestinations = []
        for (let prevPath of prevManifest) {
          const match = await matchRules(path.relative(buildFolderPath, prevPath), buildFolderPath)
          if (match) {
            // match is an object that looks like
            //  { from: '/path/to/*',
            //  to: '/blog/first',
            //  host: '',
            //  scheme: '',
            //  status: 301,
            //  force: false,
            //  negative: false,
            //  conditions: {},
            //  exceptions: {} }
            const toPath1 = path.join(buildFolderPath, match.to + '.html')
            const toPath2 = path.join(buildFolderPath, match.to + '/index.html')
            if (fs.existsSync(toPath1) || fs.existsSync(toPath2)) {
              // exists! no longer need to check for broken links
            } else {
              // the redirect itself is invalid!
              console.error(
                `Redirect from ${chalk.yellow(match.from)} to ${chalk.yellow(
                  match.to
                )} directs to a missing page... please check!`
              )
              invalidRedirectDestinations.push(match.to)
            }
          } else {
            prevManifestPostRedirects.push(prevPath)
          }
        }

        // checking previous manifests
        // console.log({ prevManifestPostRedirects })
        let missingFiles = []
        prevManifestPostRedirects.forEach(filePath => {
          if (!fs.existsSync(filePath)) {
            missingFiles.push(filePath)
          }
        })
        if (missingFiles.length || invalidRedirectDestinations.length) {
          // fail build if anything not found
          missingFiles.forEach(mf => {
            console.error(
              `${chalk.red('Netlify Build 404 Plugin:')}: can't find ${chalk.cyan(mf)} which existed in previous build`
            )
          })
          invalidRedirectDestinations.forEach(ird => {
            console.error(
              `${chalk.red('Netlify Build 404 Plugin:')}: can't find ${chalk.cyan(ird)}, which redirects rely on`
            )
          })
          if (failMode === 'error') {
            const msgs = []
            if (missingFiles.length) msgs.push(`${chalk.red.bold(missingFiles.length)} files were missing`)
            if (invalidRedirectDestinations.length)
              msgs.push(`${chalk.red.bold(invalidRedirectDestinations.length)} redirect destinations were missing`)
            msgs.push(`${chalk.cyan('failMode')} is ${chalk.red('error')}`)
            throw new Error(`${msgs.join(' and ')}, terminating build.`)
          }
        }
      }

      let newManifest = []
      newManifest = walkSync(buildFolderPath).filter(x => x.endsWith('.html'))
      // honestly we can log out the new and deleted pages as well if we wish
      var items = [...prevManifest, ...newManifest]
      var uniqueItems = Array.from(new Set(items))
      store.set(`manifest`, uniqueItems)
      console.log('html manifest saved for next run')
    }
  }
}

module.exports = netlify404nomore

// recursive crawl to get a list of filepaths
// https://gist.github.com/kethinov/6658166
var walkSync = function(dir, filelist) {
  var files = fs.readdirSync(dir)
  filelist = filelist || []
  files.forEach(function(file) {
    const dirfile = path.join(dir, file)
    if (fs.statSync(dirfile).isDirectory()) {
      filelist = walkSync(dirfile + '/', filelist)
    } else {
      filelist.push(dirfile)
    }
  })
  return filelist
}
