const fs = require('fs')
const path = require('path')
const pkg = require('./package.json')
const svgo = require('svgo')

const svgoinit = new svgo({
  plugins: [
    {
      cleanupAttrs: true
    },
    {
      removeDoctype: true
    },
    {
      removeXMLProcInst: true
    },
    {
      removeComments: true
    },
    {
      removeMetadata: true
    },
    {
      removeTitle: true
    },
    {
      removeDesc: true
    },
    {
      removeUselessDefs: true
    },
    {
      removeEditorsNSData: true
    },
    {
      removeEmptyAttrs: true
    },
    {
      removeHiddenElems: true
    },
    {
      removeEmptyText: true
    },
    {
      removeEmptyContainers: true
    },
    {
      removeViewBox: false
    },
    {
      cleanupEnableBackground: true
    },
    {
      convertStyleToAttrs: true
    },
    {
      convertColors: true
    },
    {
      convertPathData: true
    },
    {
      convertTransform: true
    },
    {
      removeUnknownsAndDefaults: true
    },
    {
      removeNonInheritableGroupAttrs: true
    },
    {
      removeUselessStrokeAndFill: true
    },
    {
      removeUnusedNS: true
    },
    {
      cleanupIDs: true
    },
    {
      cleanupNumericValues: true
    },
    {
      moveElemsAttrsToGroup: true
    },
    {
      moveGroupAttrsToElems: true
    },
    {
      collapseGroups: true
    },
    {
      removeRasterImages: false
    },
    {
      mergePaths: false
    },
    {
      convertShapeToPath: true
    },
    {
      sortAttrs: true
    },
    {
      removeDimensions: true
    }
  ]
})

function netlifyPlugin(config) {
  return {
    init: config => {
      const srcDirectory = config.pluginConfig.src.directory
      if (!srcDirectory) return console.log(`No src found in ${pkg.name} plugin config`)
      const directoryPath = path.join(config.constants.BASE_DIR, srcDirectory)

      //scanning the directory and then reading each file
      fs.readdir(directoryPath, (err, files) => {
        if (err) console.log(`Unable to scan directory: ${err}`)

        files.forEach(function(file) {
          const filePath = path.join(directoryPath, file)
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
    }
  }
}

module.exports = netlifyPlugin
