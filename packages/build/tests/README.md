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
const test = require('ava')

const { runFixture } = require('../../helpers/main')

test('test title', async (t) => {
  await runFixture(t, 'fixture_name')
})
```

This calls under the hood:

```js
const netlifyBuild = require('@netlify/build')

const runTest = async function () {
  const output = await netlifyBuild({ repositoryRoot: './fixtures/fixture_name' })
  return output
}
```

Then snapshots the output.

## Options

An additional object can be passed to `runFixture()` with the following options:

- `flags` `{object}`: any flags/options passed to the main command
- `env` `{object}`: environment variables passed to child processes. To set environment variables in the parent process
  too, spawn a new process with the `useBinary: true` option.
- `useBinary` `{boolean}`: use the CLI entry point instead of the Node.js main function
- `repositoryRoot` `{string}`: fixture directory. Defaults to `./fixtures/fixture_name`.
- `copyRoot` `{object}`: when defined, copy the fixture directory to a temporary directory This is useful when no parent
  directory should have a `.git` or `package.json`.
- `copyRoot.git` `{boolean}`: whether the copied directory should have a `.git`. Default: `true`
- `copyRoot.branch` `{string}`: create a git branch after copy

Most tests do not need to specify any of the options above.

## Running tests

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

## Output normalization

Sometimes the `@netlify/build` output contains non-deterministic information such as:

- timestamps and time durations
- package versions
- machine-specific information such as file paths (including in stack traces)
- OS-specific information (e.g. file paths use backslashes on Windows)
- output different on older Node.js versions

Those would make the test snapshot non-reproducible. To fix this, the output is normalized by `./helpers/normalize.js`.
This basically performs a series of regular expressions replacements.

If you want to remove the normalization during debugging, use the `normalize` option:

```js
test('test title', async (t) => {
  await runFixture(t, 'fixture_name', { normalize: false })
})
```

`normalize` is `false` when `PRINT=1` is used, `true` otherwise.
