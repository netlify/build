const execa = require('execa')

const install = require('./utils/install')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L664
module.exports = async function installGrunt(cwd, buildCommand) {
  if (buildCommand.match(/grunt/)) {
    let hasGruntInstalled
    try {
      const { stdout } = await execa('which', ['grunt'])
      if (stdout) hasGruntInstalled = true
    } catch (error) {
      hasGruntInstalled = false
    }

    if (!hasGruntInstalled) {
      try {
        await install('grunt', cwd)
      } catch (err) {
        console.log('Error installing grunt')
        console.log(err)
        process.exit(1)
      }

      const resp = await execa('npm', ['bin'])
      process.env.PATH = `${resp.stdout}:${process.env.PATH}`
    }
  }
}

/*
install_missing_commands() {
  if [[ $BUILD_COMMAND_PARSER == *"grunt"* ]]
  then
    if ! [ $(which grunt) ]
    then
      npm install grunt-cli
      export PATH=$(npm bin):$PATH
    fi
  fi
}
*/
