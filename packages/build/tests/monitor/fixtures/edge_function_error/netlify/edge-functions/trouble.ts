// @ts-expect-error Resolving specifier should error
import { foo } from './file.ts'

// eslint-disable-next-line import/no-anonymous-default-export, require-await
export default async () => foo
