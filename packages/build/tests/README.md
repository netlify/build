# Integration tests

## Steps

Each integration test has the following steps:

1. Select a fixture directory from `./tests/**/fixtures/`
2. Run the `@netlify/build` main function on that fixture directory
3. Snapshot the output

Everything below also applies to `@netlify/config` which follows the same pattern but using its own main function.

## Snapshot testing

Snapshot testing is a recent alternative to assertion testing. We use
[Ava snapshots](https://github.com/avajs/ava/blob/main/docs/04-snapshot-testing.md). The idea is to:

- save a command's output the first time the test is run
- compare the commmand's output with the previous snapshot the next time the test is run

The test passes if the `@netlify/build` output for a specific fixture directory did not change. If it did change, the
diff will be printed on the console. You should check the diff and figure out if the output change was introduced by:

- a bug. In that case the bug should be fixed.
- an intentional change in the command's logic/output. In that case you should run `ava -u` to update the test
  snapshots. All tests snapshots will be updated, so make sure you do not update other test snapshots accidentally.

When a PR changes test snaphots, the diff shows how the `@netlify/build` output has changed for specific tests. This
allows PR reviewers to quickly see how that PR is affecting the output shown to the user.

## Goal

Snapshot testing has some downsides:

- It is a different approach from assertion testing and can have a steep learning curve.
- Any changes to the command output require updating test snapshots. In some cases, this can be lots of snapshots.
- Testing internal details can get tricky if it does not directly impact the command output.
- The command output might be non-deterministic and require [normalization](#output-normalization).

On the other hand, it has the following upsides:

- It operates at a high/integration level, giving strong guarantees that what the user will see (the command output) and
  experience in production matches what was tested.
- It is harder to miss a bug due to issues in the test logic itself, since the test logic is limited to the test
  fixtures directory.
- It only tests user-facing behavior not implementation details, requiring fewer code updates when the source code
  changes.
- When the tests do need to be updated, they can be done with a single command (`ava -u`) instead of manually updating
  each test assertion.
- The fixture directories can be used for debugging/running any features of the project (see the
  [debug mode](#debug-mode))
- Tests can be understood without knowing the implementation details
- Code reviewers can see the user-facing changes introduced by a PR without knowing the implementation details, by
  simply looking at the test snapshots.

## Syntax

Every test follows this template:

<!-- eslint-disable-next-line ava/no-ignored-test-files -->

```js
import { Fixture, normalizeOutput } from '@netlify/testing'
import test from 'ava'

test('test title', async (t) => {
  const output = await new Fixture('./fixtures/fixture_name').runWithBuild()
  t.snapshot(normalizeOutput(output))
})
```

This calls under the hood:

<!-- eslint-disable-next-line import/default -->

```js
import netlifyBuild from '@netlify/build'

const output = await netlifyBuild({ repositoryRoot: './fixtures/fixture_name' })
```

## Running tests

Prerequisites:

```
npx lerna run build
```

To successfully run or update the snapshot tests, you need to
[install deno](https://deno.land/manual@v1.29.1/getting_started/installation)

To run all tests:

```
npx ava
```

To run the tests for a specific file:

```
npx ava /path/to/tests.js
```

To run a single test, use the command above combined with
[`test.only()`](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md#running-specific-tests).

Add the `-u` flag to update snapshots.

## Debug mode

A debug mode is available when:

- debugging why a specific test is failing
- writing new tests

When run in debug mode:

- the command output is printed
- new tests do not create test snapshots
- other tests are not compared with their existing test snapshots

To activate it, set the `PRINT=1` environment variable:

```
PRINT=1 npx ava /path/to/tests.js
```

Using [`test.only()`](https://github.com/avajs/ava/blob/main/docs/01-writing-tests.md#running-specific-tests) to target
a specific test is recommended.
