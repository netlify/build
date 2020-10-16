[![Coverage Status](https://codecov.io/gh/netlify/build/branch/master/graph/badge.svg)](https://codecov.io/gh/netlify/build)
[![Build](https://github.com/netlify/build/workflows/Build/badge.svg)](https://github.com/netlify/build/actions)

# Git Utility

Utility for dealing with modified, created, deleted files since a git commit.

## Usage

```js
/* Export the Netlify Plugin */
module.exports = {
  onPreBuild: ({ utils }) => {
    const { git } = utils

    /* Do stuff if files modified */
    if (git.modifiedFiles.length !== 0) {
      console.log('Modified files:', git.modifiedFiles)
    }

    /* Do stuff only if html code edited */
    const htmlFiles = git.fileMatch('**/*.html')
    console.log('html files git info:', htmlFiles)

    if (htmlFiles.edited.length !== 0) {
      console.log('>> Run thing because HTML has changed\n')
    }
    //
    /* Do stuff only if markdown files edited */
    const markdownFiles = git.fileMatch('**/*.md')
    console.log('markdown files git info:', markdownFiles)

    if (markdownFiles.modified.length !== 0) {
      console.log('>> Run thing because Markdown files have been created/changed/deleted\n')
    }

    /* Do stuff only if css files edited */
    const cssFiles = git.fileMatch('**/*.css')
    if (cssFiles.deleted.length !== 0) {
      console.log('>> Run thing because css files have been deleted\n')
      console.log(cssFiles)
    }
  },
}
```

## API

The `git` util includes the following signature.

```js
module.exports = {
  onPreBuild: ({ utils }) => {
    console.log(utils.git)
    // {
    // fileMatch: [Function], <-- Lookup function. See below
    // modifiedFiles: [ Array of all modified files ],
    // createdFiles: [ Array of all created files ],
    // deletedFiles: [ Array of all deleted files ],
    // commits: [ Array of commits with details ],
    // linesOfCode: [AsyncFunction: linesOfCode] <-- how many lines of code have changed
    // }
    //
  },
}
```

`git.fileMatch()` is a glob matcher function to detect the git status of a pattern of files.

Example:

```js
const cssFiles = git.fileMatch('**/*.css')
console.log('cssFiles', cssFiles)
// {
// modified: [ 'just-changed.css', 'just-changed-two.css' ],
// created: [ 'just-added.css' ],
// deleted: [ 'just-deleted.css' ],
// edited: [ 'just-changed.css', 'just-changed-two.css', 'just-added.css', 'just-deleted.css' ]
// }
//
```

## Prior art

This was originally found in [danger.js](https://danger.systems/js/) and extracted into this utility
