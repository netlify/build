// @ts-expect-error Resolving specifier should error
// eslint-disable-next-line import/no-unresolved, n/no-missing-import, ava/no-import-test-files
import { foo } from './file.ts'

// eslint-disable-next-line import/no-anonymous-default-export, require-await
export default async () => foo
