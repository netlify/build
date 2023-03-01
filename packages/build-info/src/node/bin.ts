import { argv, exit } from 'process'

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
        console.log(
          JSON.stringify(
            await getBuildInfo(projectDir, rootDir),
            // hide null values from the string output as we use null to identify it has already run but did not detect anything
            // undefined marks that it was never run
            (_, value) => (value !== null ? value : undefined),
            2,
          ),
        )
      } catch (error) {
        console.error(error)
        exit(1)
      }
    },
  )
  .strict()
  .parse()
