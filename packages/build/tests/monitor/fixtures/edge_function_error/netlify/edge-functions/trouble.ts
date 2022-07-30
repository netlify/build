// @ts-expect-error Resolving specifier should error
// eslint-disable-next-line import/no-unresolved, n/no-missing-import
import { foo } from 'file://bar'

// eslint-disable-next-line import/no-anonymous-default-export, require-await
export default async () => foo
