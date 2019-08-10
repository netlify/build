const path = require('path')
const { zipFunction } = require('@netlify/zip-it-and-ship-it')
const { appendFile, exists, readFile, writeFile, ensureDir } = require('fs-extra')

function netlifyFunctionsPlugin(conf = {}) {
  return {
    postbuild: async ({ netlifyConfig }) => {
      console.log('Configuring Functions...')
      if (!conf.functions) {
        throw new Error('You must provide functions to the functions plugin')
      }

      const buildFolder = path.join(process.cwd(), 'build')
      const destFolder = path.join(buildFolder, 'functions')

      const data = Object.keys(conf.functions).reduce((acc, functionName) => {
        const functionData = conf.functions[functionName]
        const functionPath = path.resolve(functionData.handler)

        // Add rewrites rules
        const originalPath = `/.netlify/functions/${functionName}`
        acc.rewrites = acc.rewrites.concat({
          fromPath: originalPath,
          toPath: functionData.path
        })

        console.log(`Rewriting ${originalPath} to ${functionData.path}`)

        // configuration for functions
        acc.functions = acc.functions.concat({
          name: functionName,
          path: functionPath,
        })

        return acc
      }, {
        functions: [],
        rewrites: [],
        redirects: []
      })

      // Zip up functions
      const zips = data.functions.map((func) => {
        console.log(`Zipping "${func.name}" function...`)
        return packageFunction(func.path, destFolder)
      })
      await Promise.all(zips)

      // TODO wrap functions with method check

      // Write to redirects file
      await writeRedirectsFile(buildFolder, data.redirects, data.rewrites)

      console.log('Functions ready!')
    }
  }
}

async function packageFunction(functionPath, destFolder) {
  await ensureDir(destFolder)
  await zipFunction(functionPath, destFolder)
}

const HEADER_COMMENT = `## Created with netlify functions plugin`

async function writeRedirectsFile(buildDir, redirects, rewrites) {
  if (!redirects.length && !rewrites.length) {
    return null
  }

  const FILE_PATH = path.join(buildDir, `_redirects`)

  // Map redirect data to the format Netlify expects
  // https://www.netlify.com/docs/redirects/
  redirects = redirects.map(redirect => {
    const {
      fromPath,
      isPermanent,
      redirectInBrowser, // eslint-disable-line no-unused-vars
      force,
      toPath,
      statusCode,
      ...rest
    } = redirect

    let status = isPermanent ? `301` : `302`
    if (statusCode) {
      status = statusCode
    }

    if (force) {
      status = status.concat(`!`)
    }

    // The order of the first 3 parameters is significant.
    // The order for rest params (key-value pairs) is arbitrary.
    const pieces = [fromPath, toPath, status]

    for (let key in rest) {
      const value = rest[key]

      if (typeof value === `string` && value.indexOf(` `) >= 0) {
        console.warn(
          `Invalid redirect value "${value}" specified for key "${key}". ` +
            `Values should not contain spaces.`
        )
      } else {
        pieces.push(`${key}=${value}`)
      }
    }

    return pieces.join(`  `)
  })

  rewrites = rewrites.map(
    ({ fromPath, toPath }) => `${fromPath}  ${toPath}  200`
  )
  let appendToFile = false

  // Websites may also have statically defined redirects
  // In that case we should append to them (not overwrite)
  // Make sure we aren't just looking at previous build results though
  const fileExists = await exists(FILE_PATH)
  if (fileExists) {
    const fileContents = await readFile(FILE_PATH)
    if (fileContents.indexOf(HEADER_COMMENT) < 0) {
      appendToFile = true
    }
  }

  const data = `${HEADER_COMMENT}\n\n${[...redirects, ...rewrites].join(`\n`)}`

  return appendToFile
    ? appendFile(FILE_PATH, `\n\n${data}`)
    : writeFile(FILE_PATH, data)
}

module.exports = netlifyFunctionsPlugin
