export const onPreBuild = function ({ netlifyConfig }) {
  // eslint-disable-next-line no-param-reassign
  netlifyConfig.build.processing = {
    css: { bundle: true, minify: true },
    html: { pretty_urls: true },
    images: { compress: true },
    js: { bundle: true, minify: true },
    skip_processing: true,
  }
}

export const onBuild = function ({
  netlifyConfig: {
    build: { processing },
  },
}) {
  console.log(processing)
}
