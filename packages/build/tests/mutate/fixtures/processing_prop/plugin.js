'use strict'

module.exports = {
  /* eslint-disable no-param-reassign */
  onPreBuild({ netlifyConfig }) {
    netlifyConfig.build.processing.css = { bundle: true, minify: true }
    netlifyConfig.build.processing.css.bundle = true
    netlifyConfig.build.processing.css.minify = true
    netlifyConfig.build.processing.html = { pretty_urls: true }
    netlifyConfig.build.processing.html.pretty_urls = true
    netlifyConfig.build.processing.images = { compress: true }
    netlifyConfig.build.processing.images.compress = true
    netlifyConfig.build.processing.js = { bundle: true, minify: true }
    netlifyConfig.build.processing.js.bundle = true
    netlifyConfig.build.processing.js.minify = true
    netlifyConfig.build.processing.skip_processing = true
  },
  /* eslint-enable no-param-reassign */
  onBuild({
    netlifyConfig: {
      build: { processing },
    },
  }) {
    console.log(processing)
  },
}
