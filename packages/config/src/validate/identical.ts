import { throwUserError } from '../error.js'

const ORIGIN_NAMES: Partial<Record<string, string>> = { config: 'netlify.toml', ui: 'the app' }

/**
 * A plugin may only be configured once per origin (`netlify.toml` or the UI). Contexts may
 * configure it again, but they aren't merged yet at this point, so this doesn't look at them.
 */
export const validateIdenticalPlugins = function ({
  plugins = [],
}: {
  plugins?: Record<string, unknown>[] | undefined
}) {
  plugins.forEach(({ package: packageName, origin }, index) => {
    const isDuplicate = plugins
      .slice(index + 1)
      .some((other) => other['package'] === packageName && other['origin'] === origin)
    if (isDuplicate) {
      // Other or missing origins print "undefined", as before.
      throwUserError(
        `Plugin "${String(packageName)}" must not be specified twice in ${String(typeof origin === 'string' ? ORIGIN_NAMES[origin] : undefined)}`,
      )
    }
  })
}
