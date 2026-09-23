/** The files matching some globbing patterns, by how they changed. */
export interface NetlifyPluginGitFileMatch {
  modified: readonly string[]
  created: readonly string[]
  deleted: readonly string[]
  /** Modified or created files. */
  edited: readonly string[]
}

/**
 * Retrieve Git-related information such as the list of modified/created/deleted files
 * @see https://github.com/netlify/build/blob/master/packages/git-utils/README.md
 */
export interface NetlifyPluginGitUtil {
  fileMatch(...globPatterns: string[]): NetlifyPluginGitFileMatch
  /**
   * Array of all modified files.
   */
  modifiedFiles: readonly string[]
  /**
   * Array of all created files.
   */
  createdFiles: readonly string[]
  /**
   * Array of all deleted files.
   */
  deletedFiles: readonly string[]
  /**
   * Array of commits with details.
   */
  commits: readonly {
    sha: string
    parents: string
    author: {
      name: string
      email: string
      date: string
    }
    committer: {
      name: string
      email: string
      date: string
    }
    message: string
  }[]
  /**
   * How many lines of code have changed
   */
  linesOfCode: number
}
