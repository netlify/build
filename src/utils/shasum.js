const hashFile = require('./hashFile')

async function shasum(file, algorithm) {
  const hashAlgorithm = algorithm || 'sha1'
  const hash = await hashFile(file, hashAlgorithm)
  return hash
}

module.exports = shasum
