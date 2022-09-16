import fsPromises from 'fs'

async function copyToLib() {
  const fixtureDir = 'tests/fixtures'
  fsPromises.cp(`${fixtureDir}`, 'lib/tests', { recursive: true }, () => {})
  fsPromises.cp('package.json', 'lib/', () => {})
}

copyToLib()
