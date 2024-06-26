import { z } from 'zod'

import type { FeatureFlags } from '../../../feature_flags.js'
import { ObjectValues } from '../../../types/utils.js'

export const tsExtensions = new Set(['.ts', '.cts', '.mts'])

export const MODULE_FORMAT = {
  COMMONJS: 'cjs',
  ESM: 'esm',
} as const

export const moduleFormat = z.nativeEnum(MODULE_FORMAT)

export type ModuleFormat = z.infer<typeof moduleFormat>

export const MODULE_FILE_EXTENSION = {
  CJS: '.cjs',
  CTS: '.cts',
  JS: '.js',
  MJS: '.mjs',
  MTS: '.mts',
} as const

export type ModuleFileExtension = ObjectValues<typeof MODULE_FILE_EXTENSION>

export const getFileExtensionForFormat = (
  moduleFormat: ModuleFormat,
  featureFlags: FeatureFlags,
  runtimeAPIVersion: number,
): ModuleFileExtension => {
  if (moduleFormat === MODULE_FORMAT.ESM && (runtimeAPIVersion === 2 || featureFlags.zisi_pure_esm_mjs)) {
    return MODULE_FILE_EXTENSION.MJS
  }

  if (featureFlags.zisi_output_cjs_extension && moduleFormat === MODULE_FORMAT.COMMONJS) {
    return MODULE_FILE_EXTENSION.CJS
  }

  return MODULE_FILE_EXTENSION.JS
}
