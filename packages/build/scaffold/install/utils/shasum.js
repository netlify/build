const fs = require('fs')
const crypto = require('crypto')

async function shasum(filePath, algorithm) {
  const hashAlgorithm = algorithm || 'sha1'
  const hash = await hashFile(filePath, hashAlgorithm)
  return hash
}

const hashFile = function(filename, algorithm) {
  return new Promise((resolve, reject) => {
    // Algorithm depends on availability of OpenSSL on platform
    // Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
    let shasum = crypto.createHash(algorithm)
    try {
      let s = fs.ReadStream(filename)
      s.on('data', data => {
        shasum.update(data)
      })
      // making digest
      s.on('end', () => {
        const hash = shasum.digest('hex')
        return resolve(hash)
      })
    } catch (error) {
      console.log(error)
      return reject(new Error('calc fail'))
    }
  })
}

module.exports = shasum
