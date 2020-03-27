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

Make sure everything is correctly setup with:

```bash
npm test
```

Linting and prettification is performed automatically on `git push`. However you should run them before any `git commit`
using:

```bash
npm run format
```

Alternatively you can setup your IDE to integrate with Prettier and ESLint for JavaScript and Markdown files.

This is a monorepo. You can find the included packages in the [packages](packages) directory.

## Testing

See our [testing documentation](packages/build/tests/README.md) to learn about our integration tests setup.

To test a beta release of `@netlify/build` in a site on Netlify, set the environment variable
`NETLIFY_BUILD_CLI_VERSION` to the NPM tag you wish to use.

After submitting the pull request, please make sure the Continuous Integration checks (GitHub actions) are passing.
