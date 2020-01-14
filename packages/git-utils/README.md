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
module.exports = {
  name: 'netlify-plugin-one',
  // On the "init" lifecycle event, run this logic
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
  }
}
```

## API

The `git` util includes the following signature.

```js
module.exports = {
  name: 'netlify-plugin-one',
  // On the "init" lifecycle event, run this logic
  onInit: ({ utils }) => {
    console.log(utils.git)
    /*
    {
      fileMatch: [Function], <-- Lookup function. See below
      modifiedFiles: [ Array of all modified files ],
      createdFiles: [ Array of all created files ],
      deletedFiles: [ Array of all deleted files ],
      commits: [ Array of commits with details ],
      linesOfCode: [AsyncFunction: linesOfCode] <-- how many lines of code have changed
    }
    */
  }
}
```

`git.fileMatch` is a glob matcher function to detect the git status of a pattern of files.

Example:

```js
const cssFiles = git.fileMatch('**/*.css')
console.log('cssFiles', cssFiles)
// { modified: true, created: false, deleted: true, edited: true, getKeyedPaths: [func] }
```

`git.fileMatch` returns an object that looks like this:

```
{
  modified: true, // true when a file contents have changed
  created: true,  // true when a file has been created
  deleted: true,  // true when a file has been deleted
  edited: true,   // true when a file has been `modified`, `created` and/or `deleted`
  getKeyedPaths: [Function] <-- Specific files that have changed lookup function. See below
}
```

- `modified` when a file contents have changed
- `created` when a file has been created
- `deleted` when a file has been deleted
- `edited` when a file has been `modified`, `created` or `deleted`

`getKeyedPaths` returns a list of file paths that have been `modified`, `created`, `deleted`, & `edited`

Example:

```js
const cssFiles = git.fileMatch('**/*.css')
const specificCssFiles = cssFiles.getKeyedPaths()
console.log('specificCssFiles', specificCssFiles)
/*
{
  modified: [ 'just-changed.css', 'just-changed-two.css' ],
  created: [ 'just-added.css' ],
  deleted: [ 'just-deleted.css' ],
  edited: [ 'just-changed.css', 'just-changed-two.css', 'just-added.css', 'just-deleted.css' ]
}
*/
```

## Prior art

This was originally found in [danger.js](https://danger.systems/js/) and extracted into this utility
