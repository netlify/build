const findUp = require('find-up')

// Retrieve path to the configuration file.
// Lookup from `cwd` (default: current directory) to find any file named
// `netlify.toml`, `netlify.yml`, etc.
const getConfigPath = async function(cwd) {
  const configPath = await findUp(FILENAMES, { cwd })

  if (configPath === undefined) {
    throw new Error('No "netlify.*" configuration file was found')
  }

  return configPath
}

const FILENAMES = ['netlify.toml', 'netlify.yml', 'netlify.yaml', 'netlify.json', 'netlify.js']

module.exports = getConfigPath
