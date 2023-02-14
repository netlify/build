import { argv, exit } from 'process'

import { listFrameworks } from '@netlify/framework-info'
import yargs, { Arguments } from 'yargs'
import { hideBin } from 'yargs/helpers'

import { PkgManagerFields } from '../package-managers/detect-package-manager.js'
import { Project } from '../project.js'
import { WorkspaceInfo } from '../workspaces/detect-workspace.js'

import { NodeFS } from './file-system.js'

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
          default: process.cwd(),
        },
      }),
    async ({ projectDir, rootDir }: Arguments<{ projectDir?: string; rootDir: string }>) => {
      try {
        const project = new Project(new NodeFS(), rootDir || process.cwd(), projectDir)
        project.setEnvironment(process.env)

        let frameworks: any[] = []
        try {
          // if the framework  detection is crashing we should not crash the build info and package-manager detection
          frameworks = await listFrameworks({ projectDir: project.baseDirectory })
        } catch {
          // TODO: build reporting to buildbot see: https://github.com/netlify/pillar-workflow/issues/1001
          // noop
        }

        const info: Info = {
          frameworks,
          buildSystems: await project.detectBuildSystem(),
        }

        // only if we find a root package.json we know this is a javascript workspace
        if (await project.getPackageJSON()) {
          info.packageManager = await project.detectPackageManager()
          const workspaceInfo = await project.detectWorkspaces()
          if (workspaceInfo) {
            info.jsWorkspaces = workspaceInfo
          }
        }

        console.log(JSON.stringify(info, null, 2))
      } catch (error) {
        console.error(error)
        exit(1)
      }
    },
  )
  .strict()
  .parse()
