import fs from 'fs'
import path from 'path'

import fetch from 'node-fetch'
import StreamZip from 'node-stream-zip'

import { getBinaryExtension, getPlatformTarget } from './platform.js'

const download = async (targetDirectory: string) => {
  const zipPath = path.join(targetDirectory, 'deno-cli-latest.zip')
  const data = await downloadLatestRelease()
  const binaryName = `deno${getBinaryExtension()}`
  const binaryPath = path.join(targetDirectory, binaryName)
  const file = fs.createWriteStream(zipPath)

  await new Promise((resolve, reject) => {
    data.pipe(file)
    data.on('error', reject)
    file.on('finish', resolve)
  })

  await extractBinaryFromZip(zipPath, binaryPath, binaryName)
  await fs.promises.unlink(zipPath)

  return binaryPath
}

const downloadLatestRelease = async () => {
  const url = getReleaseURL()
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

const getReleaseURL = () => {
  const target = getPlatformTarget()

  return `https://github.com/denoland/deno/releases/latest/download/deno-${target}.zip`
}

export { download }
