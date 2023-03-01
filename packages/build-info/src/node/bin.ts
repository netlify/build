import { argv, exit } from 'process'

import yargs, { Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getBuildInfo } from './get-build-info.js'

type Args = Arguments<{ projectDir?: string; rootDir?: string; featureFlags: Record<string, boolean> }>

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
        featureFlags: {
          string: true,
          describe: 'comma separated list of feature flags',
          coerce: (value = '') =>
            value
              .split(',')
              .map((flag) => flag.trim())
              .filter((flag) => flag.length)
              .reduce((prev, cur) => ({ ...prev, [cur]: true }), {}),
        },
      }),
    async ({ projectDir, rootDir, featureFlags }: Args) => {
      try {
        console.log(JSON.stringify(await getBuildInfo({ projectDir, rootDir, featureFlags }), null, 2))
      } catch (error) {
        console.error(error)
        exit(1)
      }
    },
  )
  .strict()
  .parse()
