import { git } from './exec.js'

// Return the list of modified|created|deleted files according to git, between
// the `base` commit and the `HEAD`
export const getDiffFiles = function (base, head, cwd) {
  const stdout = git(['diff', '--name-status', '--no-renames', '-z', `${base}...${head}`], cwd)
  const fields = stdout.split('\0')
  const files: { type: string; filepath: string }[] = []
  for (let index = 0; index < fields.length - 1; index += 2) {
    files.push({ type: fields[index], filepath: fields[index + 1] })
  }

  const modifiedFiles = getFilesByType(files, 'M')
  const createdFiles = getFilesByType(files, 'A')
  const deletedFiles = getFilesByType(files, 'D')
  return { modifiedFiles, createdFiles, deletedFiles }
}

const getFilesByType = function (files, type) {
  return files.filter((file) => file.type === type).map(getFilepath)
}

const getFilepath = function ({ filepath }) {
  return filepath
}
