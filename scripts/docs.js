const path = require('path')
const fs = require('fs')
const { URL } = require('url')

const markdownMagic = require('markdown-magic')
const dox = require('dox')
const request = require('sync-request')

const ROOT_DIR = path.join(__dirname, '..')
const CONSTANTS_PATH = path.join(ROOT_DIR, 'packages/build/src/plugins/child', 'constants.js')
const LIFECYCLE_PATH = path.join(ROOT_DIR, 'packages/config/src/lifecycle.js')
const PLUGINS_DATABASE_URL = 'https://raw.githubusercontent.com/netlify/plugins/master/plugins.json'
const PLUGIN_NAME_REGEX = /(?:(?:^|-)netlify-plugin(?:-|$))|(?:(?:^|-)netlify(?:-|$))/
const nonLifecycleKeys = ['onError']

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
    COMMUNITY_PLUGINS() {
      const data = remoteRequest(PLUGINS_DATABASE_URL)
      const PLUGINS = JSON.parse(data)
      let md = ``
      md += `| Plugin | Author |\n`
      md += '|:---------------------------|:-----------:|\n'
      PLUGINS.sort(sortPlugins).forEach(data => {
        const userName = getUsername(data.repo)
        const profileURL = `https://github.com/${userName}`
        md += `| **[${formatPluginName(data.name)} - \`${data.name.toLowerCase()}\`](${data.repo})** <br/> `
        md += ` ${data.description} | `
        md += `[${userName}](${profileURL}) |\n`
      })
      return md.replace(/^\s+|\s+$/g, '')
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
      let md = '| Lifecycle hook | Description |\n'
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
            eventNameWithLink = `<a href="#lifecycle${eventName[1].toLowerCase()}">${eventName[1]}</a>`
          }
          // console.log('data', data)
          const invisibleSpace = ' ‏‏‎ '
          const doubleInvisibleSpace = ' ‏‏‎  ‏‏‎  ‏‏‎ '
          const spacing = eventName[1] === 'finally' ? invisibleSpace : doubleInvisibleSpace
          const arrow = eventName[1] === 'finally' ? '🎉' : '⇩'
          md += `| ${arrow}${spacing}**${eventNameWithLink}**${doubleInvisibleSpace} | ${desc} |\n`
        }
      })
      return md.replace(/^\s+|\s+$/g, '')
    },
    LIFECYCLE_DOCS() {
      const fileContents = fs.readFileSync(LIFECYCLE_PATH, 'utf-8')
      const docBlocs = parseJsDoc(fileContents)
      let updatedContent = ''

      docBlocs
        .filter(data => {
          const niceName = formatName(data.ctx.name)
          return !nonLifecycleKeys.includes(niceName)
        })
        .forEach(data => {
          const eventName = data.description.summary.match(/^`(.*)`/)
          updatedContent += `### ${formatName(eventName[1])}\n\n`
          updatedContent += `${data.description.full}\n\n`

          const pluginExample = renderPluginExample(eventName[1])
          const configExample = renderConfigExample(eventName[1])
          updatedContent += collapse(`Using ${eventName[1]}`, `${pluginExample}\n${configExample}`)

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

function sortPlugins(a, b) {
  const aName = a.name.toLowerCase()
  const bName = b.name.toLowerCase()
  return (
    aName.replace(PLUGIN_NAME_REGEX, '').localeCompare(bName.replace(PLUGIN_NAME_REGEX, '')) ||
    aName.localeCompare(bName)
  )
}

function formatPluginName(string) {
  return toTitleCase(
    string
      .toLowerCase()
      .replace(PLUGIN_NAME_REGEX, '')
      .replace(/-/g, ' ')
      .replace(/plugin$/g, '')
      .trim(),
  )
}

function toTitleCase(str) {
  return str.replace(/\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  })
}

function getUsername(repo) {
  if (!repo) {
    return null
  }

  const o = new URL(repo)
  let path = o.pathname

  if (path.length && path.charAt(0) === '/') {
    path = path.slice(1)
  }

  path = path.split('/')[0]
  return path
}

function formatName(name) {
  const prefix = 'lifecycle'
  if (nonLifecycleKeys.includes(name)) {
    return `${name}`
  }
  return `${prefix}.${name}`
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

  **1. Using with a Plugin**

  Below is an example plugin using the \`${name}\` hook

  \`\`\`js
  module.exports = function myPlugin(pluginConfig) {
    return {
      ${name}: () => {
        console.log("Do thing on ${name} step")
      }
    }
  }
  \`\`\`

  After creating the plugin, add into your Netlify config file under \`plugins\`

  \`\`\`yml
  plugins:
    - type: ./path/to/plugin
      config:
        foo: bar
  \`\`\`
  `
}

function renderConfigExample(name) {
  return `
  **2. Using with via \`build.lifecycle\`**

\`\`\`yml
build:
  lifecycle:
    ${name}:
      - echo "Do thing on ${name} step"
\`\`\`
  `
}

function remoteRequest(url) {
  let body
  try {
    const res = request('GET', url)
    body = res.getBody('utf8')
  } catch (e) {
    console.log(`WARNING: REMOTE URL ${url} NOT FOUND`) // eslint-disable-line
    console.log(e.message) // eslint-disable-line
  }
  return body
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
