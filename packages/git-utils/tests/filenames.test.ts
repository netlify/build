import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { env, platform } from 'node:process'

import { expect, test } from 'vitest'

import { getGitUtils } from '../src/main.js'

const filenames = ['café.txt', 'space name.txt']
if (platform !== 'win32') {
  filenames.push('tab\tname.txt', 'line\nbreak.txt', 'quote"name.txt', 'back\\slash.txt', 'trailing\n')
}

test.each(filenames)('preserves the filename %j across changes and fileMatch', (filename) => {
  const cwd = mkdtempSync(join(tmpdir(), 'git-utils-filenames-'))
  const gitEnv = {
    ...env,
    GIT_AUTHOR_NAME: 'Test',
    GIT_AUTHOR_EMAIL: 'test@example.com',
    GIT_COMMITTER_NAME: 'Test',
    GIT_COMMITTER_EMAIL: 'test@example.com',
  }
  const runGit = (...args: string[]) => execFileSync('git', args, { cwd, env: gitEnv }).toString().trim()

  try {
    runGit('init', '--quiet')
    runGit('config', 'core.quotePath', 'true')
    runGit('commit', '--quiet', '--allow-empty', '-m', 'base')
    const base = runGit('rev-parse', 'HEAD')
    writeFileSync(join(cwd, filename), 'first\n')
    runGit('add', '.')
    runGit('commit', '--quiet', '-m', 'create')
    const created = runGit('rev-parse', 'HEAD')
    writeFileSync(join(cwd, filename), 'second\n')
    runGit('commit', '--quiet', '-am', 'modify')
    const modified = runGit('rev-parse', 'HEAD')
    rmSync(join(cwd, filename))
    runGit('commit', '--quiet', '-am', 'delete')
    const deleted = runGit('rev-parse', 'HEAD')

    const additions = getGitUtils({ base, head: created, cwd })
    expect(additions.createdFiles).toEqual([filename])
    expect(additions.fileMatch(filename).created).toEqual([filename])
    const modifications = getGitUtils({ base: created, head: modified, cwd })
    expect(modifications.modifiedFiles).toEqual([filename])
    expect(modifications.fileMatch(filename).modified).toEqual([filename])
    const deletions = getGitUtils({ base: modified, head: deleted, cwd })
    expect(deletions.deletedFiles).toEqual([filename])
    expect(deletions.fileMatch(filename).deleted).toEqual([filename])
    expect(getGitUtils({ base: deleted, head: deleted, cwd }).createdFiles).toEqual([])
  } finally {
    rmSync(cwd, { recursive: true, force: true })
  }
})
