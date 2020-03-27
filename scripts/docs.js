const markdownMagic = require('markdown-magic')

const README = `${__dirname}/../README.md`

markdownMagic([README], {}, () => {
  console.log('Doc generation complete')
})
