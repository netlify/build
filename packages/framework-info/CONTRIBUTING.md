# CONTRIBUTING

Contributions are always welcome, no matter how large or small. Before contributing, please read the
[code of conduct](CODE_OF_CONDUCT.md).

## Setup

From the root of the repository:

```sh
npm install
npm run build -- --scope=@netlify/framework-info
npm test -- --scope=@netlify/framework-info
```

## Releasing

Merge the release PR

### Creating a prerelease

1. Create a branch named `releases/framework-info/<tag>/<version>` with the version and tag you'd like to release.
2. Push the branch to the repo.

For example, a branch named `releases/framework-info/rc/4.0.0` will create the version `v4.0.0-rc` and publish it under
the `rc` tag.

## License

By contributing to Netlify Node Client, you agree that your contributions will be licensed under its
[MIT license](LICENSE).
