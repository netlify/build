const { resolve } = require('path')

const findUp = require('find-up')
const locatePath = require('locate-path')

// Configuration location can be:
//  - a local path with the --config CLI flag
//  - a `netlify.*` file in the `repositoryRoot/{base}`
//  - a `netlify.*` file in the `repositoryRoot`
//  - a `netlify.*` file in the current directory or any parent
const getConfigPath = async function({ configFile, cwd, repositoryRoot, base }) {
  if (configFile !== undefined) {
    return resolve(cwd, configFile)
  }

  if (base !== undefined) {
    const basePath = resolve(repositoryRoot, base)
    const configPath = await searchConfigFile(basePath)
    if (configPath !== undefined) {
      return configPath
    }
  }

  const configPathA = await searchConfigFile(repositoryRoot)
  if (configPathA !== undefined) {
    return configPathA
  }

  const configPathB = await findUp(FILENAMES, { cwd })
  return configPathB
}

const searchConfigFile = async function(cwd) {
  const filenames = FILENAMES.map(filename => resolve(cwd, filename))
  const configPath = await locatePath(filenames)
  return configPath
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json']

module.exports = { getConfigPath }
