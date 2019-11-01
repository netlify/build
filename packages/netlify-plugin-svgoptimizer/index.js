const fs = require('fs')
const { resolve } = require('path')

const merge = require('lodash.merge')
const svgo = require('svgo')

const pkg = require('./package.json')

module.exports = {
  name: '@netlify/plugin-svgoptimizer',
  init: async ({ pluginConfig }) => {
    const srcDirectory = pluginConfig.directory

    if (!srcDirectory) {
      return console.log(`No src found in ${pkg.name} plugin config. Please update SVGO plugin settings`)
    }
    const directoryPath = resolve(srcDirectory)
    const svgoSettings = pluginConfig.svgoSettings || {}

    await optimzeSvgFiles(directoryPath, svgoSettings)
  },
}

function optimzeSvgFiles(directoryPath, svgoSettings) {
  const settings = merge(defaultSVGOConfig, svgoSettings)
  const svgoinit = new svgo(settings)
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, (err, files) => {
      if (err) console.log(`Unable to scan directory: ${err}`)

      files.forEach(function(file) {
        const filePath = resolve(directoryPath, file)
        fs.readFile(filePath, 'utf8', function(err, data) {
          if (err) {
            console.log(err)
            return reject(err)
          }

          svgoinit.optimize(data, { path: filePath }).then(result => {
            //take the file and rewrite it with the new optimized SVG
            fs.writeFile(filePath, result.data, err => {
              if (err) {
                return reject(err)
              }
              console.log('SVG optimized correctly!')
            })
          })
        })
      })
      return resolve(true)
    })
  })
}

const defaultSVGOConfig = {
  plugins: [
    {
      cleanupAttrs: true,
    },
    {
      removeDoctype: true,
    },
    {
      removeXMLProcInst: true,
    },
    {
      removeComments: true,
    },
    {
      removeMetadata: true,
    },
    {
      removeTitle: true,
    },
    {
      removeDesc: true,
    },
    {
      removeUselessDefs: true,
    },
    {
      removeEditorsNSData: true,
    },
    {
      removeEmptyAttrs: true,
    },
    {
      removeHiddenElems: true,
    },
    {
      removeEmptyText: true,
    },
    {
      removeEmptyContainers: true,
    },
    {
      removeViewBox: false,
    },
    {
      cleanupEnableBackground: true,
    },
    {
      convertStyleToAttrs: true,
    },
    {
      convertColors: true,
    },
    {
      convertPathData: true,
    },
    {
      convertTransform: true,
    },
    {
      removeUnknownsAndDefaults: true,
    },
    {
      removeNonInheritableGroupAttrs: true,
    },
    {
      removeUselessStrokeAndFill: true,
    },
    {
      removeUnusedNS: true,
    },
    {
      cleanupIDs: true,
    },
    {
      cleanupNumericValues: true,
    },
    {
      moveElemsAttrsToGroup: true,
    },
    {
      moveGroupAttrsToElems: true,
    },
    {
      collapseGroups: true,
    },
    {
      removeRasterImages: false,
    },
    {
      mergePaths: false,
    },
    {
      convertShapeToPath: true,
    },
    {
      sortAttrs: true,
    },
    {
      removeDimensions: true,
    },
  ],
}
