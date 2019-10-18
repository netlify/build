/* Generates a sitemap */
const fs = require('fs')
const path = require('path')

const sm = require('sitemap')
const globby = require('globby')

async function makeSitemap(opts = {}) {
  const { distPath, fileName, homepage } = opts
  const htmlFiles = `${distPath}/**/**.html`
  const paths = await globby([htmlFiles])
  const urls = paths.map(file => {
    const regex = new RegExp(`^${distPath}`)
    const urlPath = file.replace(regex, '')
    return {
      url: urlPath,
      changefreq: 'weekly',
      priority: 0.8,
      lastmodrealtime: true,
      lastmodfile: file,
    }
  })
  console.log('homepage', homepage)
  const options = {
    hostname: `${homepage.replace(/\/$/, '')}/`,
    cacheTime: 600000, // 600 sec cache period
    urls,
  }
  // Creates a sitemap object given the input configuration with URLs
  const sitemap = sm.createSitemap(options)
  // Generates XML with a callback function
  sitemap.toXML(error => {
    if (error) {
      throw error
    }
  })
  // Gives you a string containing the XML data
  const xml = sitemap.toString()
  // write sitemap to file
  const sitemapFileName = fileName || 'sitemap.xml'
  const sitemapFile = path.join(distPath, sitemapFileName)
  fs.writeFileSync(sitemapFile, xml, 'utf-8')
  console.log('Sitemap Built!', sitemapFile)
}

module.exports = {
  postBuild: async ({ constants, pluginConfig }) => {
    const baseUrl = pluginConfig.baseUrl || process.env.SITE
    const buildDir = pluginConfig.dir || constants.BUILD_DIR
    if (!baseUrl) {
      throw new Error('Sitemap plugin missing homepage value')
    }
    if (!buildDir) {
      throw new Error('Sitemap plugin missing build directory')
    }
    console.log('Creating sitemap from files...')
    await makeSitemap({ homepage: baseUrl, distPath: buildDir })
  },
}
