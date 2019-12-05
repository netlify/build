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
- [@netlify/config](./packages/config) Netlify config module [npm link](https://www.npmjs.com/package/@netlify/config).
- [@netlify/plugin-encrypted-files](./packages/netlify-plugin-encrypted-files)
  [npm link](https://www.npmjs.com/package/@netlify/plugin-encrypted-files).
- [@netlify/plugin-no-more-404](./packages/netlify-plugin-no-more-404) fail netlify build if html goes missing with no
  redirects [npm link](https://www.npmjs.com/package/@netlify/plugin-no-more-404).
- [@netlify/plugin-svgoptimizer](./packages/netlify-plugin-svgoptimizer) Optimize SVG assets during the Netlify build
  process [npm link](https://www.npmjs.com/package/@netlify/plugin-svgoptimizer).
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
