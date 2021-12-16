import { normalize } from 'path'
import { env } from 'process'

import test from 'ava'
import chalk from 'chalk'
import cpy from 'cpy'
import execa from 'execa'
import isPlainObj from 'is-plain-obj'
import logProcessErrors from 'log-process-errors'

import { createRepoDir, removeDir } from './dir.js'
import { normalizeOutput } from './normalize.js'

export { startServer } from './server.js'

const testFile = test.meta.file
export const FIXTURES_DIR = normalize(`${testFile}/../fixtures`)

logProcessErrors({ testing: 'ava' })

// Run a CLI using a fixture directory, then snapshot the output.
// Options: see tests/README.md
export const runFixtureCommon = async function (
  t,
  fixtureName,
  {
    flags = {},
    env: envOption = {},
    normalize: normalizeOption = !isPrint(),
    snapshot = true,
    cwd,
    repositoryRoot = `${FIXTURES_DIR}/${fixtureName}`,
    copyRoot,
    mainFunc,
    binaryPath,
    useBinary = false,
  } = {},
) {
  const forceColor = isPrint() ? { FORCE_COLOR: '1' } : {}
  const commandEnv = { ...forceColor, ...envOption }
  const copyRootDir = await getCopyRootDir({ copyRoot })
  const mainFlags = getMainFlags({ fixtureName, copyRoot, copyRootDir, repositoryRoot, flags })
  const { returnValue, exitCode } = await runCommand({
    mainFunc,
    binaryPath,
    useBinary,
    mainFlags,
    commandEnv,
    cwd,
    fixtureName,
    copyRoot,
    copyRootDir,
  })

  doTestAction({ t, returnValue, normalizeOption, snapshot })

  return { returnValue, exitCode }
}

// Retrieve flags to the main entry point
const getMainFlags = function ({ fixtureName, copyRoot, copyRootDir, repositoryRoot, flags }) {
  const repositoryRootFlag = getRepositoryRootFlag({ fixtureName, copyRoot, copyRootDir, repositoryRoot })
  return { ...repositoryRootFlag, ...flags }
}

// The `repositoryRoot` flag can be overriden, but defaults to the fixture
// directory
const getRepositoryRootFlag = function ({ fixtureName, copyRoot: { cwd } = {}, copyRootDir, repositoryRoot }) {
  if (fixtureName === '') {
    return {}
  }

  if (copyRootDir === undefined) {
    return { repositoryRoot: normalize(repositoryRoot) }
  }

  if (cwd) {
    return { cwd: normalize(copyRootDir) }
  }

  return { repositoryRoot: normalize(copyRootDir) }
}

const getCopyRootDir = function ({ copyRoot, copyRoot: { git } = {} }) {
  if (copyRoot === undefined) {
    return
  }

  return createRepoDir({ git })
}

const runCommand = async function ({
  mainFunc,
  binaryPath,
  useBinary,
  mainFlags,
  commandEnv,
  cwd,
  fixtureName,
  copyRoot,
  copyRoot: { branch } = {},
  copyRootDir,
}) {
  if (copyRoot === undefined) {
    return execCommand({ mainFunc, binaryPath, useBinary, mainFlags, commandEnv, cwd })
  }

  try {
    await cpy('**', copyRootDir, { cwd: `${FIXTURES_DIR}/${fixtureName}`, parents: true })

    if (branch !== undefined) {
      await execa.command(`git checkout -b ${branch}`, { cwd: copyRootDir })
    }

    return await execCommand({ mainFunc, binaryPath, useBinary, mainFlags, commandEnv, cwd })
  } finally {
    await removeDir(copyRootDir)
  }
}

const execCommand = function ({ mainFunc, binaryPath, useBinary, mainFlags, commandEnv, cwd }) {
  if (useBinary) {
    return execCliCommand({ binaryPath, mainFlags, commandEnv, cwd })
  }

  return execMainFunc({ mainFunc, mainFlags, commandEnv })
}

const execCliCommand = async function ({ binaryPath, mainFlags, commandEnv, cwd }) {
  const cliFlags = getCliFlags(mainFlags)
  const { all, exitCode } = await execa(binaryPath, cliFlags, {
    all: true,
    reject: false,
    env: commandEnv,
    cwd,
  })
  return { returnValue: all, exitCode }
}

const getCliFlags = function (mainFlags, prefix = []) {
  return Object.entries(mainFlags).flatMap(([name, value]) => getCliFlag({ name, value, prefix }))
}

const getCliFlag = function ({ name, value, prefix }) {
  if (name === 'featureFlags') {
    return [`--${name}=${Object.entries(value).filter(isEnabledFeatureFlag).join(',')}`]
  }

  if (isPlainObj(value)) {
    return getCliFlags(value, [...prefix, name])
  }

  const key = [...prefix, name].join('.')

  if (value === false) {
    return [`--no-${key}`]
  }

  return [`--${key}=${value}`]
}

const isEnabledFeatureFlag = function ([, enabled]) {
  return enabled
}

const execMainFunc = async function ({ mainFunc, mainFlags, commandEnv }) {
  try {
    const returnValue = await mainFunc({ ...mainFlags, env: commandEnv })
    return { returnValue }
  } catch (error) {
    const returnValue = error.message
    return { returnValue }
  }
}

// The `PRINT` environment variable can be set to `1` to run the test in print
// mode. Print mode is a debugging mode which shows the test output but does
// not create nor compare its snapshot.
const doTestAction = function ({ t, returnValue, normalizeOption, snapshot }) {
  if (!snapshot) {
    return
  }

  const normalizedReturn = normalizeOutputString(returnValue, normalizeOption)

  if (isPrint()) {
    return printOutput(t, normalizedReturn)
  }

  if (shouldIgnoreSnapshot(normalizedReturn)) {
    t.pass()
    return
  }

  t.snapshot(normalizedReturn)
}

const normalizeOutputString = function (outputString, normalizeOption) {
  if (!normalizeOption) {
    return outputString
  }

  return normalizeOutput(outputString)
}

const printOutput = function (t, normalizedReturn) {
  console.log(`
${chalk.magentaBright.bold(`${LINE}
  ${t.title}
${LINE}`)}

${normalizedReturn}`)
  t.pass()
}

const LINE_LENGTH = 50
const LINE = '='.repeat(LINE_LENGTH)

const shouldIgnoreSnapshot = function (normalizedReturn) {
  return IGNORE_REGEXPS.some((regExp) => regExp.test(normalizedReturn))
}

const IGNORE_REGEXPS = [
  // Some tests send network requests, which can sometimes fail
  /getaddrinfo EAI_AGAIN/,
]

// When running tests with PRINT=1, print the results instead of snapshotting
const isPrint = function () {
  return env.PRINT === '1'
}
