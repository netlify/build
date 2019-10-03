const fs = require('fs')
const { promisify } = require('util')

const npmRunPath = require('npm-run-path')
const parseCommand = require('parse-npm-script')
const resolveConfig = require('@netlify/config')

const readFileAsync = promisify(fs.readFile)

/*

1. Check build command

2. Check dependency files ()

3. Check ENV languages

 */

/**
 * Gather heuristics on the project based on the src code
 * @param  {object} conf [description]
 * @param  {string} conf.pkgPath - path to package.json file
 * @param  {string} conf.configPath - path to netlify config file
 * @return {object} - heuristic info
 */
module.exports = async function getHeuristics({ pkgPath, configPath }) {
  // get project info
  const pkg = await parseJson(pkgPath)

  // get netlify config
  const config = await resolveConfig(configPath)

  // get build chain info via build command
  let buildInfo = {}
  if (config.build && config.build.command) {
    // console.log('command', config.build.command)
    let subCommands = config.build.command.split(/ && /)

    let allThings = subCommands.reduce((acc, cur, i) => {
      if (cur.match(/^yarn|npm/)) {
        acc[i] = parseCommand(pkg, cur)
      } else {
        acc[i] = Promise.resolve(cur)
      }
      return acc
    }, [])

    const vals = await Promise.all(allThings)

    buildInfo = vals.reduce(
      (acc, c) => {
        if (typeof c === 'string') {
          const prefix = acc['command'] ? ' && ' : ''
          acc['command'] = `${acc['command']}${prefix}${c}`
          acc['steps'] = acc['steps'].concat({
            name: null,
            raw: c,
            parsed: c
          })
          acc['raw'] = acc['raw'].concat(c)
          acc['combined'] = acc['raw'].join(' && ')
        } else {
          acc['command'] = `${acc['command']} && ${c.command}`
          acc['steps'] = acc['steps'].concat(c.steps)
          acc['raw'] = acc['raw'].concat(c.raw)
          acc['combined'] = acc['raw'].join(' && ')
        }
        return acc
      },
      {
        command: '',
        steps: [],
        raw: [],
        combined: ''
      }
    )
    // console.log('vals', vals)
    // console.log('combined', buildInfo)
  }

  let typeofBuild
  let unknownTypeOfBuild = true
  if (unknownTypeOfBuild) {
    // Run detectors
    typeofBuild = 'gatsby-v.1.0.1'
  }

  return {
    // system path info
    PATH: process.env.PATH,
    // system path info with local binaries
    PATH_WITH_LOCALS: npmRunPath(),
    // Resolved netlify configuration
    config: config,
    // Resolved buildcommand info
    build: buildInfo,
    // Best guess of project type
    projectType: typeofBuild
  }
}

async function parseJson(packagePath, script) {
  const pkgString = await readFileAsync(packagePath, 'utf-8')
  const pkg = JSON.parse(pkgString)
  return pkg
}
