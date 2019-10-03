const hashFile = require('./hashFile')

async function shasum(filePath, algorithm) {
  const hashAlgorithm = algorithm || 'sha1'
  const hash = await hashFile(filePath, hashAlgorithm)
  return hash
}

module.exports = shasum
