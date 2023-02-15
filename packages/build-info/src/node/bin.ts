import { argv, exit } from 'process'

import yargs, { Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { PkgManagerFields } from '../package-managers/detect-package-manager.js'
import { WorkspaceInfo } from '../workspaces/detect-workspace.js'

import { getBuildInfo } from './get-build-info.js'

export type Info = {
  jsWorkspaces?: WorkspaceInfo
  packageManager?: PkgManagerFields
  frameworks: unknown[]
  buildSystems?: {
    name: string
    version?: string | undefined
  }[]
}

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
        console.log(JSON.stringify(await getBuildInfo(projectDir, rootDir), null, 2))
      } catch (error) {
        console.error(error)
        exit(1)
      }
    },
  )
  .strict()
  .parse()
