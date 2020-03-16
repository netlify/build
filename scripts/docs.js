const path = require('path')
const fs = require('fs')

const markdownMagic = require('markdown-magic')
const dox = require('dox')

const ROOT_DIR = path.join(__dirname, '..')
const CONSTANTS_PATH = path.join(ROOT_DIR, 'packages/build/src/plugins/child', 'constants.js')
const LIFECYCLE_PATH = path.join(ROOT_DIR, 'packages/config/src/normalize/events.js')

const config = {
  transforms: {
    // https://github.com/moleculerjs/moleculer-addons/blob/master/readme-generator.js#L11
    PACKAGES() {
      const base = path.resolve('packages')
      const packages = fs
        .readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .map(pkg => [pkg, fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8')])
        .filter(([, json]) => {
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
    PLUGINS() {
      const base = path.resolve('packages')
      const packages = fs
        .readdirSync(path.resolve('packages'))
        .filter(pkg => !/^\./.test(pkg))
        .filter(pkg => pkg.match(/netlify-plugin/))
        .map(pkg => [pkg, fs.readFileSync(path.join(base, pkg, 'package.json'), 'utf8')])
        .filter(([, json]) => {
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
    CONSTANTS() {
      const fileContents = fs.readFileSync(CONSTANTS_PATH, 'utf8')
      const docBlocs = parseJsDoc(fileContents)
      const updatedContents = docBlocs
        .map(doc => {
          return `- \`${doc.ctx.name}\` ${doc.description.full}`
        })
        .join('\n')

      return updatedContents
    },
    LIFECYCLE_TABLE(content, opts) {
      const options = opts || {}
      const fileContents = fs.readFileSync(LIFECYCLE_PATH, 'utf-8')
      const docBlocs = parseJsDoc(fileContents)

      const events = docBlocs.filter(d => {
        return !d.description.summary.match(/^\*\*/)
      })
      let md = '| Event          | Description |\n'
      md += '|:------|:-------|\n'
      events.forEach(data => {
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
            eventNameWithLink = `<a href="#${eventName[1].toLowerCase()}">${eventName[1]}</a>`
          }
          // console.log('data', data)
          const invisibleSpace = ' ‏‏‎ '
          const doubleInvisibleSpace = ' ‏‏‎  ‏‏‎  ‏‏‎ '
          const spacing = eventName[1] === 'onEnd' ? invisibleSpace : doubleInvisibleSpace
          const arrow = eventName[1] === 'onEnd' ? '🎉' : '⇩'
          md += `| ${arrow}${spacing}**${eventNameWithLink}**${doubleInvisibleSpace} | ${desc} |\n`
        }
      })
      return md.replace(/^\s+|\s+$/g, '')
    },
    LIFECYCLE_DOCS() {
      const fileContents = fs.readFileSync(LIFECYCLE_PATH, 'utf-8')
      const docBlocs = parseJsDoc(fileContents)
      let updatedContent = ''

      docBlocs.forEach(data => {
        const eventName = data.description.summary.match(/^`(.*)`/)
        updatedContent += `### \`${eventName[1]}\`\n\n`
        const cleanDesc = data.description.full.replace(/^`(.*)` - /g, '')
        updatedContent += `${cleanDesc}\n\n`

        const pluginExample = renderPluginExample(eventName[1])
        const configExample = renderConfigExample(eventName[1])
        updatedContent += collapse(`Using <strong>${eventName[1]}</strong> in a plugin`, `${pluginExample}`)
        updatedContent += '\n'
        updatedContent += collapse(`Using <strong>${eventName[1]}</strong> via Netlify config`, `${configExample}`)

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
    },
  },
}

/* Utils functions */
function parseJsDoc(contents) {
  return dox.parseComments(contents, { raw: true, skipSingleStar: true })
}

function collapse(summary, content) {
  return `
<details>
  <summary>${summary}</summary>
  ${content}
</details>
`
}

function renderPluginExample(name) {
  return `
  <br/>

  Below is an example plugin using the \`${name}\` event handler

  \`\`\`js
  // File my-plugin.js
  module.exports = function myPlugin(conf) {
    return {
      ${name}: ({ inputs, netlifyConfig, constants, utils }) => {
        console.log('Run custom logic during ${name} event')
      }
    }
  }
  \`\`\`

  After creating the plugin, add into your [Netlify config](#netlify-configuration) file under the \`plugins\` section.

  Plugins can be referenced locally or installed via npm.

  \`netlify.yml\` example:

  \`\`\`yml
  plugins:
    - package: ./path/to/my-plugin.js
  \`\`\`
  `
}

function renderConfigExample(name) {
  return `
  <br/>

  Below is an example of how to use the \`${name}\` event in the Netlify config file.

  \`\`\`yml
  build:
    lifecycle:
      ${name}: echo "Do thing on ${name} event"
  \`\`\`
  `
}

const markdownFiles = [
  path.join(ROOT_DIR, 'README.md'),
  path.join(ROOT_DIR, 'CONTRIBUTING.md'),
  path.join(ROOT_DIR, 'docs/**/**.md'),
  path.join(ROOT_DIR, 'packages/**/**.md'),
  path.join(ROOT_DIR, 'examples/**/**.md'),
  `!${path.join(ROOT_DIR, 'examples/**/node_modules/**/**.md')}`,
  `!${path.join(ROOT_DIR, 'packages/**/node_modules/**/**.md')}`,
  '!node_modules',
]
markdownMagic(markdownFiles, config, () => {
  console.log('Doc generation complete')
})
