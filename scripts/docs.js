const path = require('path')
const fs = require('fs')

const markdownMagic = require('markdown-magic')
const dox = require('dox')

const ROOT_DIR = path.join(__dirname, '..')
const CONSTANTS_PATH = path.join(ROOT_DIR, 'packages/build/src/core', 'constants.js')
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
  },
}

/* Utils functions */
function parseJsDoc(contents) {
  return dox.parseComments(contents, { raw: true, skipSingleStar: true })
}

const markdownFiles = [
  path.join(ROOT_DIR, 'README.md'),
  path.join(ROOT_DIR, 'CONTRIBUTING.md'),
  path.join(ROOT_DIR, 'docs/**/**.md'),
  path.join(ROOT_DIR, 'packages/**/**.md'),
  `!${path.join(ROOT_DIR, 'packages/**/node_modules/**/**.md')}`,
  '!node_modules',
]
markdownMagic(markdownFiles, config, () => {
  console.log('Doc generation complete')
})
