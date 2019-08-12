/**
 * Generates sitemap
 */
const fs = require('fs')
const path = require('path')
const sm = require('sitemap')
const globby = require('globby')

async function makeSitemap(opts = {}) {
  const { distPath, fileName, homepage } = opts
  const htmlFiles = `${distPath}/**/**.html`
  const paths = await globby([ htmlFiles ])
  const urls = paths.map((file) => {
    const regex = new RegExp(`^${distPath}`)
    const urlPath = file.replace(regex, '')
    return {
      url: urlPath,
      changefreq: 'weekly',
      priority: 0.8,
      lastmodrealtime: true,
      lastmodfile: file
    }
  })
  console.log('homepage', homepage)
  const options = {
    hostname: `${homepage.replace(/\/$/, '')}/`,
    cacheTime: 600000, // 600 sec cache period
    urls
  }
  // Creates a sitemap object given the input configuration with URLs
  const sitemap = sm.createSitemap(options)
  // Generates XML with a callback function
  sitemap.toXML((error) => {
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

function netlifySitemapPlugin(conf = {}) {
  console.log(conf)
  return {
    // Hook into lifecycle
    postbuild: async () => {
      const siteUrl = conf.baseUrl || process.env.SITE
      if (!siteUrl) {
        throw new Error('Sitemap plugin missing homepage value')
      }
      if (!conf.distPath) {
        throw new Error('Sitemap plugin missing build directory')
      }
      console.log('Creating sitemap from files...')
      await makeSitemap({
        homepage: siteUrl,
        distPath: conf.distPath
      })
    }
  }
}

module.exports = netlifySitemapPlugin
