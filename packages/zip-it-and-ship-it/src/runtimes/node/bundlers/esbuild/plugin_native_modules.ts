import path from 'path'

import type { Plugin } from 'esbuild'

import { isNativeModule } from '../../utils/detect_native_module.js'
import { PackageJson, readPackageJson } from '../../utils/package_json.js'
import type { NativeNodeModules } from '../types.js'

type NativeModuleCacheEntry = [boolean | undefined, PackageJson]
type NativeModuleCache = Record<string, Promise<NativeModuleCacheEntry>>

// Filters out relative or absolute file paths.
const packageFilter = /^([^./]*)$/

// Filters valid package names and extracts the base directory.
const packageName = /^([^@][^/]*|@[^/]*\/[^/]+)(?:\/|$)/

const findNativeModule = (packageJsonPath: string, cache: NativeModuleCache) => {
  if (cache[packageJsonPath] === undefined) {
    cache[packageJsonPath] = readPackageJson(packageJsonPath).then(
      (data) => [Boolean(isNativeModule(data)), data],
      () => [undefined, {}],
    )
  }

  return cache[packageJsonPath]
}

export const getNativeModulesPlugin = (externalizedModules: NativeNodeModules): Plugin => ({
  name: 'external-native-modules',
  setup(build) {
    const cache: NativeModuleCache = {}

    build.onResolve({ filter: packageFilter }, async (args) => {
      const pkg = packageName.exec(args.path)

      if (!pkg) return

      let directory = args.resolveDir

      while (true) {
        if (path.basename(directory) !== 'node_modules') {
          const modulePath = path.join(directory, 'node_modules', pkg[1])
          const packageJsonPath = path.join(modulePath, 'package.json')
          const [isNative, packageJsonData] = await findNativeModule(packageJsonPath, cache)

          if (isNative === true) {
            if (externalizedModules[args.path] === undefined) {
              externalizedModules[args.path] = {}
            }

            externalizedModules[args.path][modulePath] = packageJsonData.version

            return { path: args.path, external: true }
          }

          if (isNative === false) {
            return
          }
        }

        const parentDirectory = path.dirname(directory)

        if (parentDirectory === directory) {
          break
        }

        directory = parentDirectory
      }
    })
  },
})
