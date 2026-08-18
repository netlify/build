import { describe, expect, test } from 'vitest'

import { getDatabaseBranchId } from './utils.js'

const DEPLOY_ID = '6a7b7aad242683d1afab3f2c'

describe('getDatabaseBranchId', () => {
  test('uses the git branch when the deploy has one', () => {
    expect(getDatabaseBranchId({ branch: 'my-feature', deployId: DEPLOY_ID })).toBe('my-feature')
  })

  test.each([undefined, ''])('falls back to the deploy ID when branch is %o', (branch) => {
    expect(getDatabaseBranchId({ branch, deployId: DEPLOY_ID })).toBe(DEPLOY_ID)
  })

  test('gives two branchless deploys different IDs', () => {
    // Sharing one ID would put unrelated previews on the same database, and
    // branch cleanup resolves a branchless deploy by its deploy ID, so a
    // shared ID would also never be collected.
    const first = getDatabaseBranchId({ deployId: '6a67d980f5a4c125104f5375' })
    const second = getDatabaseBranchId({ deployId: '6a67dcc8a623bb39450d934b' })
    expect(first).not.toBe(second)
  })

  test('reuses one ID across redeploys of the same git branch', () => {
    expect(getDatabaseBranchId({ branch: 'shared', deployId: 'deploy-a' })).toBe(
      getDatabaseBranchId({ branch: 'shared', deployId: 'deploy-b' }),
    )
  })
})
