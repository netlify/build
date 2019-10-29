const findUp = require('find-up')
const pLocate = require('p-locate')

// Retrieve path to the configuration file.
// Lookup from `cwd` (default: current directory) to find any file named
// `netlify.toml`, `netlify.yml`, etc.
const getConfigPath = async function(cwds) {
  const cwdsA = Array.isArray(cwds) ? cwds : [cwds]
  const cwd = await pLocate(cwdsA, async cwd => Boolean(await findUp(FILENAMES, { cwd })))
  const configPath = await findUp(FILENAMES, { cwd })

  if (configPath === undefined) {
    throw new Error(`No netlify configuration file was found
 Please add a "netlify.yml", "netlify.toml", or "netlify.json" file and try again
`)
  }

  return configPath
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json', 'netlify.js']

module.exports = getConfigPath
