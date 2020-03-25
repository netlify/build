# Integration tests

## Steps

Each integration test has the following steps:

1. Select a fixture directory from `./tests/**/fixtures/`
2. Run the `netlify-build` CLI command on that fixture directory
3. Snapshot the output

Everything below also applies to `netlify-config` which follows the same pattern but using its own CLI command.

## Snapshot testing

Snapshot testing is a recent alternative to assertion testing. We use
[Ava snapshots](https://github.com/avajs/ava/blob/master/docs/04-snapshot-testing.md). The idea is to:

- save a command's output the first time the test is run
- compare the commmand's output with the previous snapshot the next time the test is run

The test passes if the `netlify-build` output for a specific fixture directory did not change. If it did change, the
diff will be printed on the console. You should check the diff and figure out if the output change was introduced by:

- a bug. In that case the bug should be fixed.
- an intentional change in the command's logic/output. In that case you should run `ava -u` to update the test
  snapshots. All tests snapshots will be updated, so make sure you do not update other test snapshots accidentally.

When a PR changes test snaphots, the diff shows how the `netlify-build` output has changed for specific tests. This
allows PR reviewers to quickly see how that PR is affecting the output shown to the user.

## Syntax

Every test follows this template:

```js
const test = require('ava')
const { runFixture } = require('../../helpers/main')

test('test title', async t => {
  await runFixture(t, 'fixture_name')
})
```

`runFixture()` calls:

```
netlify-build --repositoryRoot ./fixtures/fixture_name
```

Then snapshots the output.

## Options

An additional object can be passed to `runFixture()` with the following options:

- `repositoryRoot` `{string}`: `--repositoryRoot` CLI flag. Defaults to `./fixtures/fixture_name`.
- `flags` `{string[]}`: other CLI flags
- `env` `{object}`: environment variables
- `normalize` `{boolean}`: see [below](#output-normalization)

You usually do not need to specify any of those options except `flags` when testing specific CLI flags.

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
[`test.only()`](https://github.com/avajs/ava/blob/master/docs/01-writing-tests.md#running-specific-tests).

Add the `-u` flag to update snapshots.

## Debug mode

A debug mode is available when:

- debugging why a specific test is failing
- writing new tests

To activate it, set the `PRINT=1` environment variable:

```
PRINT=1 npx ava /path/to/tests.js
```

Using [`test.only()`](https://github.com/avajs/ava/blob/master/docs/01-writing-tests.md#running-specific-tests) to
target a specific test is recommended.

When run in debug mode:

- the command output is printed
- new tests do not create test snapshots
- other tests are not compared with their existing test snapshots

## Output normalization

Sometimes the `netlify-build` output contains non-deterministic information such as:

- timestamps and time durations
- package versions
- machine-specific information such as file paths (including in stack traces)
- OS-specific information (e.g. file paths use backslashes on Windows)
- output different on older Node.js versions

Those would make the test snapshot non-reproducible. To fix this, the output is normalized by `./helpers/normalize.js`.
This basically performs a series of regular expressions replacements.

If you want to remove the normalization during debugging, use the `normalize` option:

```js
await runFixture(t, 'fixture_name', { normalize: false })
```

`normalize` is `false` when `PRINT=1` is used, `true` otherwise.
