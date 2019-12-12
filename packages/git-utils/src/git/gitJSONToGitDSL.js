const os = require('os')
const parseDiff = require('parse-diff')
const includes = require('lodash.includes')
const isobject = require('lodash.isobject')
const keys = require('lodash.keys')
const memoize = require('lodash.memoize')
const jsonDiff = require('rfc6902')
const jsonpointer = require('jsonpointer')
const JSON5 = require('json5')
const fileMatcher = require('../fileMatcher')

module.exports.gitJSONToGitDSL = (gitJSONRep, config) => {
  const getFullDiff = config.getStructuredDiffForFile
    ? null
    : memoize((base, head) => {
        return config.getFullDiff(base, head)
      }, (base, head) => `${base}...${head}`)
  /**
   * Takes a filename, and pulls from the PR the two versions of a file
   * where we then pass that off to the rfc6902 JSON patch generator.
   *
   * @param filename The path of the file
   */
  const JSONPatchForFile = async (filename) => {
    // We already have access to the diff, so see if the file is in there
    // if it's not return an empty diff
    if (!gitJSONRep.modified_files.includes(filename)) {
      return null
    }
    // Grab the two files contents.
    const baseFile = await config.getFileContents(
      filename,
      config.repo,
      config.baseSHA
    )
    const headFile = await config.getFileContents(
      filename,
      config.repo,
      config.headSHA
    )
    // Parse JSON. `fileContents` returns empty string for files that are
    // missing in one of the refs, ie. when the file is created or deleted.
    const baseJSON = baseFile === '' ? {} : JSON5.parse(baseFile)
    const headJSON = headFile === '' ? {} : JSON5.parse(headFile)
    // Tiny bit of hand-waving here around the types. JSONPatchOperation is
    // a simpler version of all operations inside the rfc6902 d.ts.
    return {
      before: baseFile === '' ? null : baseJSON,
      after: headFile === '' ? null : headJSON,
      diff: jsonDiff.createPatch(baseJSON, headJSON)
    }
  }
  /**
   * Takes a path, generates a JSON patch for it, then parses that into something
   * that's much easier to use inside a 'DSL'' like the Dangerfile.
   *
   * @param filename path of the file
   */
  const JSONDiffForFile = async filename => {
    const patchObject = await JSONPatchForFile(filename)
    if (!patchObject) {
      return {}
    }
    // Thanks to @wtgtybhertgeghgtwtg for getting this started in #175
    // The idea is to loop through all the JSON patches, then pull out the before and after from those changes.
    const { diff, before, after } = patchObject
    return diff.reduce((accumulator, { path }) => {
      // We don't want to show the last root object, as these tend to just go directly
      // to a single value in the patch. This is fine, but not useful when showing a before/after
      const pathSteps = path.split('/')
      const backAStepPath =
        pathSteps.length <= 2
          ? path
          : pathSteps.slice(0, pathSteps.length - 1).join('/')
      const diff = {
        after: jsonpointer.get(after, backAStepPath) || null,
        before: jsonpointer.get(before, backAStepPath) || null
      }
      const emptyValueOfCounterpart = other => {
        if (Array.isArray(other)) {
          return []
        } else if (isobject(diff.after)) {
          return {}
        }
        return null
      }
      const beforeValue = diff.before || emptyValueOfCounterpart(diff.after)
      const afterValue = diff.after || emptyValueOfCounterpart(diff.before)
      // If they both are arrays, add some extra metadata about what was
      // added or removed. This makes it really easy to act on specific
      // changes to JSON DSLs
      if (Array.isArray(afterValue) && Array.isArray(beforeValue)) {
        const arrayBefore = beforeValue
        const arrayAfter = afterValue
        diff.added = arrayAfter.filter(o => !includes(arrayBefore, o))
        diff.removed = arrayBefore.filter(o => !includes(arrayAfter, o))
        // Do the same, but for keys inside an object if they both are objects.
      } else if (isobject(afterValue) && isobject(beforeValue)) {
        const beforeKeys = keys(beforeValue)
        const afterKeys = keys(afterValue)
        diff.added = afterKeys.filter(o => !includes(beforeKeys, o))
        diff.removed = beforeKeys.filter(o => !includes(afterKeys, o))
      }
      jsonpointer.set(accumulator, backAStepPath, diff)
      return accumulator
    }, Object.create(null))
  }
  const linesOfCode = async () => {
    const [
      createdFilesDiffs,
      modifiedFilesDiffs,
      deletedFilesDiffs
    ] = await Promise.all([
      Promise.all(gitJSONRep.created_files.map(path => diffForFile(path))),
      Promise.all(gitJSONRep.modified_files.map(path => diffForFile(path))),
      Promise.all(gitJSONRep.deleted_files.map(path => diffForFile(path)))
    ])
    let additions = createdFilesDiffs
      .map(diff =>
        !diff ? 0 : diff.added === '' ? 0 : diff.added.split('\n').length
      )
      .reduce((mem, value) => mem + value, 0)
    let deletions = deletedFilesDiffs
      .map(diff =>
        !diff ? 0 : diff.removed === '' ? 0 : diff.removed.split('\n').length
      )
      .reduce((mem, value) => mem + value, 0)
    const modifiedLines = modifiedFilesDiffs.map(diff => [
      !diff ? 0 : diff.added === '' ? 0 : diff.added.split('\n').length,
      !diff ? 0 : diff.removed === '' ? 0 : diff.removed.split('\n').length
    ])
    additions = modifiedLines.reduce((mem, value) => mem + value[0], additions)
    deletions = modifiedLines.reduce((mem, value) => mem + value[1], deletions)
    return additions + deletions
  }
  const byType = t => ({ type }) => type === t
  const getContent = ({ content }) => content
  /**
   * Gets the git-style diff for a single file.
   *
   * @param filename File path for the diff
   */
  const structuredDiffForFile = async filename => {
    let fileDiffs
    if (config.getStructuredDiffForFile) {
      fileDiffs = await config.getStructuredDiffForFile(
        config.baseSHA,
        config.headSHA,
        filename
      )
    } else {
      const diff = await getFullDiff(config.baseSHA, config.headSHA)
      fileDiffs = parseDiff(diff)
    }
    const structuredDiff = fileDiffs.find(
      diff => diff.from === filename || diff.to === filename
    )
    if (structuredDiff !== undefined && structuredDiff.chunks !== undefined) {
      return { chunks: structuredDiff.chunks }
    } else {
      return null
    }
  }
  /**
   * Gets the git-style diff for a single file.
   *
   * @param filename File path for the diff
   */
  const diffForFile = async filename => {
    const structuredDiff = await structuredDiffForFile(filename)
    if (!structuredDiff) {
      return null
    }
    const allLines = structuredDiff.chunks
      .map(c => c.changes)
      .reduce((a, b) => a.concat(b), [])
    return {
      before: await config.getFileContents(
        filename,
        config.repo,
        config.baseSHA
      ),
      after: await config.getFileContents(
        filename,
        config.repo,
        config.headSHA
      ),
      diff: allLines.map(getContent).join(os.EOL),
      added: allLines
        .filter(byType('add'))
        .map(getContent)
        .join(os.EOL),
      removed: allLines
        .filter(byType('del'))
        .map(getContent)
        .join(os.EOL)
    }
  }
  return {
    fileMatch: fileMatcher({
      modified: gitJSONRep.modified_files,
      created: gitJSONRep.created_files,
      deleted: gitJSONRep.deleted_files,
      edited: gitJSONRep.modified_files.concat(gitJSONRep.created_files)
    }),
    modifiedFiles: gitJSONRep.modified_files,
    createdFiles: gitJSONRep.created_files,
    deletedFiles: gitJSONRep.deleted_files,
    commits: gitJSONRep.commits,
    /* TODO potential future utilities to expose
    // disable other utils
    diffForFile,
    structuredDiffForFile,
    JSONPatchForFile,
    JSONDiffForFile,
    */
    linesOfCode
  }
}
