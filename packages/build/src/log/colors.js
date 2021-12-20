import { inspect } from 'util'

import supportsColor from 'supports-color'

// Plugin child processes use `stdio: 'pipe'` so they are always
// non-interactive even if the parent is an interactive TTY. This means they
// would normally lose colors. If the parent has colors, we pass an environment
// variable to the child process to force colors.
export const getParentColorEnv = function () {
  if (!hasColors()) {
    return {}
  }

  return { FORCE_COLOR: '1' }
}

// Child processes and the buildbot relies on `FORCE_COLOR=1` to set colors.
// However `utils.inspect()` (used by `console.log()`) uses
// `process.stdout.hasColors` which is always `undefined` when the TTY is
// non-interactive. So we need to set `util.inspect.defaultOptions.colors`
// manually both in plugin processes.
export const setInspectColors = function () {
  if (!hasColors()) {
    return
  }

  // `inspect.defaultOptions` requires direct mutation
  // eslint-disable-next-line fp/no-mutation
  inspect.defaultOptions.colors = true
}

const hasColors = function () {
  return supportsColor.stdout !== false
}
