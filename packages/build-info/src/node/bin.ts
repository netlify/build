import { argv, exit } from 'process'

import { DVCUser } from '@devcycle/nodejs-server-sdk'
import yargs, { Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { report } from '../metrics.js'

import { getFeatureFlags } from './feature-flags.js'
import { getBuildInfo } from './get-build-info.js'
import { initializeMetrics } from './metrics.js'

type Args = Arguments<{ projectDir?: string; rootDir?: string; devCycleUser: DVCUser }>

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
        devCycleUser: {
          string: true,
          default: '{}',
          describe: 'DevCycle user that is used for the feature flag client',
          coerce: (value) => {
            try {
              return JSON.parse(value)
            } catch {
              return {}
            }
          },
        },
      }),
    async ({ projectDir, rootDir, devCycleUser }: Args) => {
      // start bugsnag reporting
      await initializeMetrics()
      const featureFlags = await getFeatureFlags(devCycleUser)

      try {
        console.log(
          JSON.stringify(
            await getBuildInfo({ projectDir, rootDir, featureFlags }),
            // hide null values from the string output as we use null to identify it has already run but did not detect anything
            // undefined marks that it was never run
            (_, value) => (value !== null ? value : undefined),
            2,
          ),
        )
      } catch (error) {
        report(error)
        exit(1)
      }
      exit(0)
    },
  )
  .strict()
  .parse()
