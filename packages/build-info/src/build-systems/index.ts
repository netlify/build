import { Bazel } from './bazel.js'
import { Buck } from './buck.js'
import { Gradle } from './gradle.js'
import { Lage } from './lage.js'
import { Moon } from './moon.js'
import { Nix } from './nix.js'
import { Lerna, Nx } from './nrwl.js'
import { NPM, PNPM, Yarn } from './package-managers.js'
import { Pants } from './pants.js'
import { Rush } from './rush.js'
import { Turbo } from './turbo.js'

export const buildSystems = [
  Bazel,
  Buck,
  Gradle,
  Lage,
  Lerna,
  Moon,
  Nix,
  Nx,
  Pants,
  Rush,
  Turbo,

  // JavaScript Package managers that offer building from a workspace
  PNPM,
  NPM,
  Yarn,
] as const
