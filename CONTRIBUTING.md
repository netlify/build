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

This is a monorepo. You can find the included packages in the [packages](packages) directory.

## Testing

See our [testing documentation](packages/build/tests/README.md) to learn about our integration tests setup.

After submitting the pull request, please make sure the Continuous Integration checks (GitHub actions) are passing.

## Releasing

To release a specific package:

1. Merge the relevant package release PR created by `release-please`
2. Run `npm publish packages/packageName`

Linting and tests will automatically run before publish.

Packages dependencies graph:

```
@netlify/zip-it-and-ship-it -> js-client
                            -> @netlify/function-utils
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

When `@netlify/build` or `@netlify/config` is published to npm, Renovate will automatically create a release PR in the
buildbot after a short while. Once the Jenkins build has passed and finished building, the PR can be tested in
production by updating the `Site.build_image` property of any test Site. This can be done with the following Netlify CLI
commands:

```bash
netlify api updateSite --data='{ "site_id": "{{siteId}}", "body": { "build_image": "{{buildImage}}" }}'
```

The `{{buildImage}}` can be the buildbot commit hash or `git` branch name.

Note that `@netlify/config` is a dependency of `@netlify/build`, so if you've just updated the former you should first start by updating `@netlify/build` and let renovate bundle those two changes together when updating buildbot.

## Beta release

To test a beta release of `@netlify/build` in a site:

- Make a prerelease: `npm version prerelease`
- Publish on npm using a `beta` tag: `npm publish --tag=beta`
- Make a PR in the buildbot to use this prerelease
- Update the `build_image` of a site to use this PR

This is especially useful to test how an ongoing PR in `@netlify/build` would behave in production.
