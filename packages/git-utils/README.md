<img src="../../static/logo.png" width="400"/><br>

[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

# Git Utility

Utility for dealing with modified, created, deleted files since a git commit.

## Install

```bash
npm install @netlify/git-utils
```

## Usage

```js
/* Export the Netlify Plugin */
module.exports = function netlifyPlugin() {
  return {
    name: 'netlify-plugin-one',
    onInit: ({ utils }) => {
      const { git } = utils

      /* Do stuff if files modified */
      if (git.modifiedFiles.length) {
        console.log('Modified files:', git.modifiedFiles)
      }

      /* Do stuff only if html code edited */
      const htmlFiles = git.fileMatch('**/*.html')
      console.log('html files git info:', htmlFiles)

      if (htmlFiles.edited) {
        console.log('>> Run thing because HTML has changed\n')
      }
      //
      /* Do stuff only if markdown files edited */
      const markdownFiles = git.fileMatch('**/*.md')
      console.log('markdown files git info:', markdownFiles)

      if (markdownFiles.modified) {
        console.log('>> Run thing because Markdown files have been created/changed/deleted\n')
      }

      /* Do stuff only if css files edited */
      const cssFiles = git.fileMatch('**/*.css')
      console.log('css files git info:', cssFiles)

      if (cssFiles.deleted) {
        console.log('>> Run thing because css files have been deleted\n')
        const whichFiles = cssFiles.getKeyedPaths()
        console.log(whichFiles)
      }
    },
    onPreBuild: () => {
      // Do my magic stuff
    },
  }
}
```

## Prior art

This was originally found in [danger.js](https://danger.systems/js/) and extracted into this utility
