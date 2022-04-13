import fs from 'fs'
import path from 'path'

import fetch from 'node-fetch'
import StreamZip from 'node-stream-zip'
import semver from 'semver'

import { getBinaryExtension, getPlatformTarget } from './platform.js'

const download = async (targetDirectory: string, versionRange: string) => {
  const zipPath = path.join(targetDirectory, 'deno-cli-latest.zip')
  const data = await downloadVersion(versionRange)
  const binaryName = `deno${getBinaryExtension()}`
  const binaryPath = path.join(targetDirectory, binaryName)
  const file = fs.createWriteStream(zipPath)

  await new Promise((resolve, reject) => {
    data.pipe(file)
    data.on('error', reject)
    file.on('finish', resolve)
  })

  await extractBinaryFromZip(zipPath, binaryPath, binaryName)

  try {
    await fs.promises.unlink(zipPath)
  } catch {
    // no-op
  }

  return binaryPath
}

const downloadVersion = async (versionRange: string) => {
  const version = await getLatestVersionForRange(versionRange)
  const url = getReleaseURL(version)
  const res = await fetch(url)

  if (res.body === null) {
    throw new Error('Could not download Deno')
  }

  return res.body
}

const extractBinaryFromZip = async (zipPath: string, binaryPath: string, binaryName: string) => {
  const { async: StreamZipAsync } = StreamZip
  const zip = new StreamZipAsync({ file: zipPath })

  await zip.extract(binaryName, binaryPath)
  await zip.close()
  await fs.promises.chmod(binaryPath, '755')
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

export { download }
