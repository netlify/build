import { type Extension } from '../../api/site_info.js'
import { type ExtensionWithDev } from '../../extensions.js'

export function mapToExtensionWithDev(extensions: Extension[]): ExtensionWithDev[] {
  return extensions.map((extension) => ({
    ...extension,
    buildPlugin: null,
    dev: null,
  }))
}
