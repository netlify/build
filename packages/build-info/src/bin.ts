import { exit, argv } from 'process'

import yargs, { Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getBuildInfo } from './get-build-info.js'

yargs(hideBin(argv))
  .command(
    '* [projectDir]',
    'Print relevant build information from a project.',
    (builder) =>
      builder.options({
        rootDir: {
          string: true,
          describe: `The root directory of the project if different from projectDir`,
        },
      }),
    async ({ projectDir, rootDir }: Arguments<{ projectDir?: string; rootDir?: string }>) => {
      try {
        const buildInfo = await getBuildInfo({ projectDir, rootDir })
        console.log(JSON.stringify(buildInfo, null, 2))
      } catch (error) {
        console.error(error)
        exit(1)
      }
    },
  )
  .strict()
  .parse()
