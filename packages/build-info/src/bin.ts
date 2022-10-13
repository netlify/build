#!/usr/bin/env node
import { exit, argv } from 'process'

import { hideBin } from 'yargs/helpers'
import yargs from 'yargs/yargs'

import { getBuildInfo } from './main.js'

const { projectDir, rootDir } = yargs(hideBin(argv))
  .command('* [projectDir]')
  .options({
    rootDir: {
      string: true,
      describe: `The root directory of the project if different from projectDir`,
    },
  })
  .usage(
    `$0 [OPTIONS...] [PROJECT_DIRECTORY]

  Print relevant build information from a project.`,
  )
  .strict()
  .parse()

try {
  const buildInfo = await getBuildInfo({ projectDir, rootDir })
  console.log(JSON.stringify(buildInfo, null, 2))
} catch (error) {
  console.error(error)
  exit(1)
}
