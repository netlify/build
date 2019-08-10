const Command = require('@netlify/cli-utils')
const { flags } = require('@oclif/command')
const build = require('@netlify/build')

function getConfigPath() {}

class BuildCommand extends Command {
  async run() {
    let { flags } = this.parse(BuildCommand)

    const pathToConfig = getConfigPath()
    await build(pathToConfig, flags).catch((e) => {
      console.log('error', e)
    })
  }
}

BuildCommand.description = `Run netlify build`

BuildCommand.flags = {
  dry: flags.boolean({
    description: 'Dry run build and dont execute commands'
  }),
}

module.exports = BuildCommand
