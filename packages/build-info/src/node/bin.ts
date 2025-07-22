import { argv, exit } from 'process'

import yargs, { type Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { report } from '../metrics.js'

import { getBuildInfo } from './get-build-info.js'
import { initializeMetrics } from './metrics.js'

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
      // start bugsnag reporting
      const bugsnagClient = await initializeMetrics()
      try {
        console.log(
          JSON.stringify(
            await getBuildInfo({ projectDir, rootDir, featureFlags, bugsnagClient }),
            // hide null values from the string output as we use null to identify it has already run but did not detect anything
            // undefined marks that it was never run
            (_, value) => (value !== null ? value : undefined),
            2,
          ),
        )
      } catch (error) {
        report(error, { client: bugsnagClient })
        exit(1)
      }
    },
  )
  .strict()
  .parse()
