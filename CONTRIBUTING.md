# Contributions

🎉 Thanks for considering contributing to this project! 🎉

These guidelines will help you send a pull request.

If you're submitting an issue instead, please skip this document.

If your pull request is related to a typo or the documentation being unclear, please click on the relevant page's `Edit`
button (pencil icon) and directly suggest a correction instead.

This project was made with ❤️. The simplest way to give back is by starring and sharing it online.

Everyone is welcome regardless of personal background. We enforce a [Code of conduct](CODE_OF_CONDUCT.md) in order to
promote a positive and inclusive environment.

## Development process

First fork and clone the repository. If you're not sure how to do this, please watch
[these videos](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

Run:

```bash
npm install
```

Tests are run with:

```bash
npm test
```

Make sure everything is correctly setup by running those tests first.

ESLint and Prettier are performed automatically on `git push`. However, we recommend you setup your IDE or text editor
to run ESLint and Prettier automatically on file save. Otherwise, you should run them manually using:

```bash
npm run format
```

Alternatively you can setup your IDE to integrate with Prettier and ESLint for JavaScript and Markdown files.

This is a monorepo using [npm 7 (or later) workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces). You can find
the included packages in the [packages](packages) directory.

## Testing

See our [testing documentation](packages/build/tests/README.md) to learn about our integration tests setup.

After submitting the pull request, please make sure the Continuous Integration checks (GitHub actions) are passing.

### Testing locally

The `@netlify/testing` package will need to be built regardless of which package you are working on. In order to do this
run the following from the root directory:

```
npm run build -- --scope=@netlify/testing
```

If you wish to build all of the projects for whatever reason, the command is `npm run build`.

From there, you can run tests for a particular package by running:

```
npm run test -- --scope=<name of package as it appears in 'name' field in package.json>
```

For example, if you wished to run tests for the `build` package:

```
npm run test -- --scope=@netlify/build
```

## Releasing

For more details, please refer to the
[shared npm release process](https://github.com/netlify/team-dev#npm-packages-release-process) (internal use only).

`release-please` creates an aggregated release PR that contains all packages that were changed from the last release.
When you merge this PR, it will automatically publish the relevant packages to `npm` in the correct order.

Packages dependencies graph:

```sh
@netlify/zip-it-and-ship-it -> @netlify/functions-utils
                            -> @netlify/build
                            -> netlify-cli
js-client                   -> @netlify/config
                            -> netlify-cli
any @netlify/*-utils        -> @netlify/build
@netlify/config             -> @netlify/build
                            -> netlify-cli
                            -> buildbot
@netlify/build              -> netlify-cli
                            -> buildbot
build-image                 -> buildbot
netlify/plugins             -> buildbot
```

Note that Renovate should take care of opening PRs to update the relevant packages that depend upon the modules you just
published. However, to make good use of your time, make sure to follow the dependency graph above. I.e.
`@netlify/config` is a dependency of `@netlify/build`, so if you've just updated the former you should first start by
updating `@netlify/build` and let Renovate bundle those two changes together when updating buildbot.

### Buildbot

When `@netlify/build` or `@netlify/config` is published to npm, Renovate will automatically create a **release PR** in
Buildbot after a short while.

Unless the release does not contain any production code changes, that PR should be directly tested and merged by the
person who made the `@netlify/build` or `@netlify/config` release.

In order to test that particular PR before releasing it, refer to Buildbot's
[README.md](https://github.com/netlify/buildbot/#testing-builds-on-a-live-test-site)

_Note:_ Once the `release-please` GitHub action has completed on main (not on the release-please PR,
[example](https://github.com/netlify/build/actions/runs/1254006395)), you can tick the last checkbox on
[the `buildbot` Dependency Dashboard](https://github.com/netlify/buildbot/issues/912) to force-generate a `buildbot`
release PR.

## Test pre-release

To test a prerelease of `@netlify/<package>` in a site you have 2 options. Creating a Beta release or using remlink.

This is especially useful to test how an ongoing PR in `@netlify/<package>` would behave in production.

### Create a Beta release

- Create a branch named `releases/<package>/<tag>/<version>` with the package and version you'd like to release. For
  example, a branch named `releases/cache-utils/rc/2.0.0` will create the version `v2.0.0-rc` and publish it under the
  `rc` tag.
- Push the branch to the repo
- Make a PR in the buildbot to use this version
- Update the `build_image` of a site to use this PR

### Use remlink

Remlink allows you to link to a particular on-going branch in this repo and create a Buildbot release you can use for
testing. Refer to [`remlink`'s docs for more info](https://github.com/netlify/remlink)

- Create a [PR in Buildbot](https://github.com/netlify/buildbot/pull/2778/files) with a `remlink.config.json` your
  desired setup. Refer to the
  [example config](https://github.com/netlify/buildbot/blob/main/remlink.config.json.example) in main for a base
  structure you can use.
- Refer to the test notes for a particular PR in order to create builds using said Buildbot version. Note that whenever
  you make changes to your `@netlify/<package>` branch you need to trigger a new Buildbot build.
