#!/usr/bin/env node
const { exit } = require('process')

const yargs = require('yargs')

const { listFrameworks } = require('./main.js')

// CLI entry point
const runCli = async function() {
  const { projectDir, long, ignoredWatchCommand } = parseArgs()

  try {
    const frameworks = await listFrameworks({ projectDir, ignoredWatchCommand })
    const frameworksStr = serializeFrameworks(frameworks, long)
    console.log(frameworksStr)
  } catch (error) {
    console.error(error)
    exit(1)
  }
}

const parseArgs = function() {
  return yargs
    .command('* [projectDir]')
    .options(OPTIONS)
    .usage(USAGE)
    .strict()
    .parse()
}

const OPTIONS = {
  long: {
    boolean: true,
    default: false,
    describe: `Show more information about each framework.
The output will be a JSON array.`
  },
  ignoredWatchCommand: {
    string: true,
    describe: 'When detecting the watch command, ignore `package.json` `scripts` whose value includes this string.'
  }
}

const USAGE = `$0 [OPTIONS...] [PROJECT_DIRECTORY]

Prints all the frameworks used by a project.`

const serializeFrameworks = function(frameworks, long) {
  if (long) {
    return JSON.stringify(frameworks, null, 2)
  }

  if (frameworks.length === 0) {
    return NO_FRAMEWORKS
  }

  return frameworks.map(getName).join('\n')
}

const NO_FRAMEWORKS = 'unknown'

const getName = function({ name }) {
  return name
}

runCli()
