const fs = require('fs')
const { resolve } = require('path')

const svgo = require('svgo')

const pkg = require('./package.json')

const svgoinit = new svgo({
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
})

module.exports = {
  name: '@netlify/plugin-svgoptimizer',
  init({ pluginConfig }) {
    const srcDirectory = pluginConfig.src.directory

    if (!srcDirectory) return console.log(`No src found in ${pkg.name} plugin config`)
    const directoryPath = resolve(srcDirectory)

    //scanning the directory and then reading each file
    fs.readdir(directoryPath, (err, files) => {
      if (err) console.log(`Unable to scan directory: ${err}`)

      files.forEach(function(file) {
        const filePath = resolve(directoryPath, file)
        fs.readFile(filePath, 'utf8', function(err, data) {
          if (err) console.log(err)

          svgoinit.optimize(data, { path: filePath }).then(result => {
            //take the file and rewrite it with the new optimized SVG
            fs.writeFile(filePath, result.data, err => {
              if (err) throw err
              console.log('SVG optimized correctly!')
            })
          })
        })
      })
    })
  },
}
