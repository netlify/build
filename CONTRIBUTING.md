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

## Releasing

For more details, please refer to the
[shared npm release process](https://github.com/netlify/team-dev#npm-packages-release-process) (internal use only).

`release-please` creates an aggregated release PR that contains all packages that were changed from the last release.
When you merge this PR, it will automatically publish the relevant packages to `npm` in the correct order.

Packages dependencies graph:

```sh
@netlify/zip-it-and-ship-it -> @netlify/function-utils
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
@netlify/framework-info     -> buildbot
                            -> netlify-cli
```

Note that Renovate should take care of opening PRs to update the relevant packages that depend upon the modules you just
published. However, to make good use of your time, make sure to follow the dependency graph above. I.e.
`@netlify/config` is a dependency of `@netlify/build`, so if you've just updated the former you should first start by
updating `@netlify/build` and let Renovate bundle those two changes together when updating buildbot.

### Buildbot

When `@netlify/build` or `@netlify/config` is published to npm, Renovate will automatically create a release PR in the
buildbot after a short while. Once the Jenkins build has passed and finished building, the PR can be tested in
production by updating the `Site.build_image` property of any test Site. This can be done with the following
[Netlify CLI commands](https://github.com/netlify/buildbot#using-netlify-cli-or-netlify-api):

```bash
netlify api updateSite --data='{ "site_id": "{{siteId}}", "body": { "build_image": "{{buildImage}}" }}'
```

The `{{buildImage}}` can be the buildbot commit hash or `git` branch name.

_Note:_ Once the `release-please` GitHub action has completed on main (not on the release-please PR,
[example](https://github.com/netlify/build/actions/runs/1254006395)), you can tick the last checkbox on
[the `buildbot` Dependency Dashboard](https://github.com/netlify/buildbot/issues/912) to force-generate a `buildbot`
release PR.

## Beta release

To test a prerelease of `@netlify/<package>` in a site:

- Create a branch named `releases/<package>/<tag>/<version>` with the package and version you'd like to release. For
  example, a branch named `releases/cache-utils/rc/2.0.0` will create the version `v2.0.0-rc` and publish it under the
  `rc` tag.
- Push the branch to the repo
- Make a PR in the buildbot to use this version
- Update the `build_image` of a site to use this PR

This is especially useful to test how an ongoing PR in `@netlify/<package>` would behave in production.
