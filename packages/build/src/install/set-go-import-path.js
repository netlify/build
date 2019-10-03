const path = require('path')

const execa = require('execa')
const makeDir = require('make-dir')

const { removeFiles } = require('../utils/fs')

// https://github.com/netlify/build-image/blob/9e0f207a27642d0115b1ca97cd5e8cebbe492f63/run-build-functions.sh#L675
module.exports = async function setGoImportPath(cwd) {
  const { GO_IMPORT_PATH, GOPATH } = process.env
  if (GO_IMPORT_PATH) {
    const importPath = `${GOPATH}/src/${GO_IMPORT_PATH}"`
    const dirPath = path.dirname(importPath)

    await removeFiles([dirPath])

    await makeDir(dirPath)

    await execa('ln', ['-s', cwd, importPath])

    await execa('cd', [importPath])
  }
}

/*
set_go_import_path() {
  # Setup project GOPATH
  if [ -n "$GO_IMPORT_PATH" ]
  then
    local importPath="$GOPATH/src/$GO_IMPORT_PATH"
    local dirPath="$(dirname $importPath)"

    rm -rf $dirPath
    mkdir -p $dirPath
    ln -s $PWD $importPath

    cd $importPath
  fi
}
*/
