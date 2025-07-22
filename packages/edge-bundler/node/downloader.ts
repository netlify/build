import { createWriteStream, promises as fs } from 'fs'
import { Readable } from 'node:stream'
import path from 'path'
import { promisify } from 'util'

import StreamZip from 'node-stream-zip'
import pRetry from 'p-retry'
import semver from 'semver'

import { Logger } from './logger.js'
import { getBinaryExtension, getPlatformTarget } from './platform.js'

const downloadWithRetry = async (targetDirectory: string, versionRange: string, logger: Logger) =>
  await pRetry(async () => await download(targetDirectory, versionRange), {
    retries: 3,
    onFailedAttempt: (error) => {
      logger.system('Deno download with retry failed', error)
    },
  })

const download = async (targetDirectory: string, versionRange: string) => {
  const zipPath = path.join(targetDirectory, 'deno-cli-latest.zip')
  const data = await downloadVersion(versionRange)
  const binaryName = `deno${getBinaryExtension()}`
  const binaryPath = path.join(targetDirectory, binaryName)
  const file = createWriteStream(zipPath)

  try {
    await new Promise((resolve, reject) => {
      data.on('error', reject)
      file.on('finish', resolve)
      data.pipe(file)
    })

    await extractBinaryFromZip(zipPath, binaryPath, binaryName)

    return binaryPath
  } finally {
    // Try closing and deleting the zip file in any case, error or not
    await promisify(file.close.bind(file))()

    try {
      await fs.unlink(zipPath)
    } catch {
      // no-op
    }
  }
}

const downloadVersion = async (versionRange: string) => {
  const version = await getLatestVersionForRange(versionRange)
  const url = getReleaseURL(version)
  const res = await fetch(url)

  if (res.body === null || res.status < 200 || res.status > 299) {
    throw new Error(`Download failed with status code ${res.status}`)
  }

  return Readable.from(res.body)
}

const extractBinaryFromZip = async (zipPath: string, binaryPath: string, binaryName: string) => {
  const { async: StreamZipAsync } = StreamZip
  const zip = new StreamZipAsync({ file: zipPath })

  await zip.extract(binaryName, binaryPath)
  await zip.close()
  await fs.chmod(binaryPath, '755')
}

const getLatestVersion = async () => {
  try {
    const response = await fetch('https://dl.deno.land/release-latest.txt')
    const data = await response.text()

    // We want to extract <VERSION> from the format `v<VERSION>`.
    const version = data.match(/^v?(\d+\.\d+\.\d+)/)

    if (version === null) {
      return
    }

    return version[1]
  } catch {
    // This is a no-op. If we failed to retrieve the latest version, let's
    // return `undefined` and let the code upstream handle it.
  }
}

const getLatestVersionForRange = async (range: string) => {
  const minimumVersion = semver.minVersion(range)?.version

  // We should never get here, because it means that `DENO_VERSION_RANGE` is
  // a malformed semver range. If this does happen, let's throw an error so
  // that the tests catch it.
  if (minimumVersion === undefined) {
    throw new Error('Incorrect version range specified by Edge Bundler')
  }

  const latestVersion = await getLatestVersion()

  if (latestVersion === undefined || !semver.satisfies(latestVersion, range)) {
    return minimumVersion
  }

  return latestVersion
}

const getReleaseURL = (version: string) => {
  const target = getPlatformTarget()

  return `https://dl.deno.land/release/v${version}/deno-${target}.zip`
}

export { downloadWithRetry as download }
