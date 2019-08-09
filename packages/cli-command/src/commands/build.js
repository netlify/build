const Command = require('@netlify/cli-utils')
const { flags } = require('@oclif/command')
// const build = require('@netlify/build')

class BuildCommand extends Command {
  async run() {
    let { flags } = this.parse(BuildCommand);
    const { api, site, config } = this.netlify;

    await build()
  }
}

BuildCommand.description = `Run netlify build`;

DeployCommand.flags = {
  dry: flags.boolean({
    description: 'Dry run build and dont execute commands'
  }),
}
module.exports = BuildCommand;
