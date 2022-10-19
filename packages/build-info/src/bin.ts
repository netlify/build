#!/usr/bin/env node
import { relative } from 'path'
import { exit, argv } from 'process'

import yargs, { Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { getContext } from './context.js'
import { getBuildInfo } from './main.js'
import { getWorkspaceInfo } from './workspaces.js'

yargs(hideBin(argv))
  .command(
    'print-workspaces [rootDir]',
    'This command is used inside buildbot to retrieve a space separated list of relative package paths',
    () => {
      // no build options
    },
    async ({ projectDir }: Arguments<{ projectDir?: string }>) => {
      const context = await getContext({ projectDir })
      const { packages } = await getWorkspaceInfo(context)
      console.log(packages.map((p) => relative(context.projectDir, p)).join(' '))
    },
  )
  .command(
    '* [projectDir]',
    '',
    (builder) =>
      builder.options({
        rootDir: {
          string: true,
          describe: `The root directory of the project if different from projectDir`,
        },
      }),
    async ({ rootDir, projectDir }: Arguments<{ projectDir?: string; rootDir?: string }>) => {
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
