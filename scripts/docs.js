const path = require('path')
const fs = require('fs')
const markdownMagic = require('markdown-magic')
const dox = require('dox')

const rootDir = path.join(__dirname, '..')
const nonLifecycleKeys = ['onError']
const CONSTANTS = {
  rootDir: rootDir,
  lifecycle: path.join(rootDir, 'packages/build/src/core/lifecycle.js')
}

function parseJsDoc(contents) {
  return dox.parseComments(contents, { raw: true, skipSingleStar: true })
}

const config = {
  transforms: {
    // https://github.com/moleculerjs/moleculer-addons/blob/master/readme-generator.js#L11
    PACKAGES(content, options) {
      const base = path.resolve('packages')
      const packages = fs.readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .map(pkg => ([pkg, fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8')]))
        .filter(([pkg, json]) => {
          const parsed = JSON.parse(json)
          return parsed.private !== true
        })
        .map(([pkg, json]) => {
          const { name, description } = JSON.parse(json)
          return `- [${name}](./packages/${pkg}) ${description} [npm link](https://www.npmjs.com/package/${name}).`
        })
        .join('\n')
      return packages
    },
    PLUGINS(content, options) {
      const base = path.resolve('packages')
      const packages = fs.readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .filter(pkg => pkg.match(/netlify-plugin/))
        .map(pkg => ([pkg, fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8')]))
        .filter(([pkg, json]) => {
          const parsed = JSON.parse(json)
          return parsed.private !== true
        })
        .map(([pkg, json]) => {
          const { name, description } = JSON.parse(json)
          return `- [${name}](https://github.com/netlify/build/tree/master/packages/${pkg}) ${description} [npm link](https://www.npmjs.com/package/${name}).`
        })
        .join('\n')
      return packages
    },
    LIFECYCLE_TABLE(content, opts) {
      const options = opts || {}
      const fileContents = fs.readFileSync(CONSTANTS.lifecycle, 'utf-8')
      const docBlocs = parseJsDoc(fileContents)

      const events = docBlocs.filter((d) => {
        return !d.description.summary.match(/^\*\*/)
      })
      let md = '| Lifecycle hook | Description |\n'
      md += '|:------|:-------|\n'
      events.forEach((data) => {
        const eventName = data.description.summary.match(/^`(.*)`/)
        let desc = data.description.summary.replace(eventName[0], '')
        /* remove prefixed “ - whatever" */
        desc = desc.replace(/^[\s|-]-?\s/, '')
        /* replace \n with <br> tags */
        desc = desc.replace(/\n/g, '<br/>')

        if (eventName[1]) {
          let eventNameWithLink
          if (options.noAnchors) {
            eventNameWithLink = eventName[1]
          } else {
            eventNameWithLink = `<a href="#lifecycle${eventName[1].toLowerCase()}">${eventName[1]}</a>`
          }
          // console.log('data', data)
          const invisibleSpace = ' ‏‏‎ '
          const doubleInvisibleSpace = ' ‏‏‎  ‏‏‎  ‏‏‎ '
          const spacing = (eventName[1] === 'finally') ? invisibleSpace : doubleInvisibleSpace
          const arrow = (eventName[1] === 'finally') ? '🎉' : '⇩'
          md += `| ${arrow}${spacing}**${eventNameWithLink}**${doubleInvisibleSpace} | ${desc} |\n`
        }
      })
      return md.replace(/^\s+|\s+$/g, '')
    },
    LIFECYCLE_DOCS(content, options) {
      const fileContents = fs.readFileSync(CONSTANTS.lifecycle, 'utf-8')
      const docBlocs = parseJsDoc(fileContents)
      let updatedContent = ''

      docBlocs.filter((data) => {
        const niceName = formatName(data.ctx.name)
        return !nonLifecycleKeys.includes(niceName)
      }).forEach((data) => {
        const eventName = data.description.summary.match(/^`(.*)`/)
        updatedContent += `### ${formatName(eventName[1])}\n\n`
        updatedContent += `${data.description.full}\n\n`

        updatedContent += renderPluginExample(eventName[1])
        updatedContent += renderLifeCycleExample(eventName[1])
        /* maybe fold
        <details>
          <summary>Plugin example</summary>

          ```js
          const la = 'foo'
          ```

        </details>
         */
        updatedContent += `\n`
      })
      return updatedContent.replace(/^\s+|\s+$/g, '')
    }
  }
}

function formatName(name) {
  const prefix = 'lifecycle'
  if (nonLifecycleKeys.includes(name)) {
    return `${name}`
  }
  return `${prefix}.${name}`
}

function renderPluginExample(name) {
  return `
<details>
  <summary>Using \`${name}\` in a plugin</summary>

  \`\`\`js
  module.exports = function myPlugin(pluginConfig) {
    return {
      ${name}: () => {
        console.log("Do thing on ${name} step")
      }
    }
  }
  \`\`\`

</details>
  `
}

function renderLifeCycleExample(name) {
  return `
<details>
  <summary>Using \`${name}\` in \`build.lifecycle\`</summary>

  \`\`\`yml
  build:
    lifecycle:
      ${name}:
        - echo "Do thing on ${name} step"
  \`\`\`

</details>
  `
}

const markdownFiles = [
  path.join(rootDir, 'README.md'),
  path.join(rootDir, 'docs/**/**.md'),
  path.join(rootDir, 'packages/**/**.md'),
  `!${path.join(rootDir, 'packages/**/node_modules/**/**.md')}`,
  '!node_modules'
]
markdownMagic(markdownFiles, config, () => {
  console.log('Doc generation complete')
})
