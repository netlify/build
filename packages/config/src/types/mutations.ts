/** A change to the configuration made at build time, for example by a build plugin. */
export interface ConfigMutation {
  /** Path to the property, e.g. `['build', 'command']`. Numbers are array indices. */
  keys: (string | number)[]
  value: unknown
  /** The build event during which the change was made, e.g. `'onPreBuild'`. */
  event: string
}
