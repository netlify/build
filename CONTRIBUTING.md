# Contributions

🎉 Thanks for considering contributing to this project! 🎉

These guidelines will help you send a pull request.

If you're submitting an issue instead, please skip this document.

If your pull request is related to a typo or the documentation being unclear, please click on the relevant page's `Edit`
button (pencil icon) and directly suggest a correction instead.

This project was made with ❤️. The simplest way to give back is by starring and sharing it online.

Everyone is welcome regardless of personal background. We enforce a [Code of conduct](CODE_OF_CONDUCT.md) in order to
promote a positive and inclusive environment.

## Update Docs

Docs are updated with `markdown-magic` - run `npm run test:docs` for it.

We also run this on precommit hooks with `husky`.

## Development process

First fork and clone the repository. If you're not sure how to do this, please watch
[these videos](https://egghead.io/courses/how-to-contribute-to-an-open-source-project-on-github).

Run:

```bash
npm install
```

Make sure everything is correctly setup with:

```bash
npm test
```

## Packages

This is a monorepo. Below are a list of packages included.

<!-- AUTO-GENERATED-CONTENT:START (PACKAGES) -->
- [@netlify/build](./packages/build) Netlify build module [npm link](https://www.npmjs.com/package/@netlify/build).
- [@netlify/cache-utils](./packages/cache-utils) Utility for caching files in Netlify Build [npm link](https://www.npmjs.com/package/@netlify/cache-utils).
- [@netlify/config](./packages/config) Netlify config module [npm link](https://www.npmjs.com/package/@netlify/config).
- [@netlify/functions-utils](./packages/functions-utils) Utility for adding Functions files in Netlify Build [npm link](https://www.npmjs.com/package/@netlify/functions-utils).
- [@netlify/git-utils](./packages/git-utils) Utility for dealing with modified, created, deleted files since a git commit [npm link](https://www.npmjs.com/package/@netlify/git-utils).
- [@netlify/run-utils](./packages/run-utils) Utility for running commands inside Netlify Build [npm link](https://www.npmjs.com/package/@netlify/run-utils).
<!-- AUTO-GENERATED-CONTENT:END (PACKAGES) -->

## Examples

We include some example projects as fixtures to test again. You'll have to install dependencies there too:

```bash
cd examples/example-two
npm i
```

## Testing

See our [testing documentation](packages/build/tests/README.md) to learn about our integration tests setup.

## Requirements

Linting is performed with ESLint using the [following configuration](.eslintrc.json).

Prettification is performed with Prettier using the [following configuration](.prettierrc.json).

After submitting the pull request, please make sure the Continuous Integration checks are passing.
