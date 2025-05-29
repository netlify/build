# Changelog

## [6.0.2](https://github.com/netlify/build/compare/run-utils-v6.0.1...run-utils-v6.0.2) (2025-05-29)


### Bug Fixes

* upgrade @types/node to v18 ([#6400](https://github.com/netlify/build/issues/6400)) ([efcc052](https://github.com/netlify/build/commit/efcc052daf4eeb57392e76f1e971422158ec5fab))

## [6.0.1](https://github.com/netlify/build/compare/run-utils-v6.0.0...run-utils-v6.0.1) (2025-05-20)


### Bug Fixes

* **deps:** upgrade execa to v8 ([#6301](https://github.com/netlify/build/issues/6301)) ([1f93c17](https://github.com/netlify/build/commit/1f93c179b7f48c5141456f1645156cd6b3909e3b))

## [6.0.0](https://github.com/netlify/build/compare/run-utils-v5.2.0...run-utils-v6.0.0) (2025-05-14)


### ⚠ BREAKING CHANGES

* end of support for v14 and v16 ([#6223](https://github.com/netlify/build/issues/6223))

### Features

* end of support for v14 and v16 ([#6223](https://github.com/netlify/build/issues/6223)) ([9917ef4](https://github.com/netlify/build/commit/9917ef4eb0bd47162e33aa432be7c9fa3fa462c4))

## [5.2.0](https://github.com/netlify/build/compare/run-utils-v5.1.1...run-utils-v5.2.0) (2024-12-11)


### Features

* add node 22 to supported versions list ([#5917](https://github.com/netlify/build/issues/5917)) ([5455393](https://github.com/netlify/build/commit/545539369a3f1a0e9d2036df7d41a8bed1df8272))

## [5.1.1](https://github.com/netlify/build/compare/run-utils-v5.1.0...run-utils-v5.1.1) (2023-06-05)


### Bug Fixes

* update minimum version of semver to be ESM compatible ([#5049](https://github.com/netlify/build/issues/5049)) ([6454437](https://github.com/netlify/build/commit/6454437dbbc54de309c2a7dbeb59149e1b7d02ca))

## [5.1.0](https://github.com/netlify/build/compare/run-utils-v5.0.2...run-utils-v5.1.0) (2022-12-13)


### Features

* add build system detection ([#4763](https://github.com/netlify/build/issues/4763)) ([73bdb7b](https://github.com/netlify/build/commit/73bdb7bed7347cf6a8c4d729142c322297a0dce8))

## [5.0.2](https://github.com/netlify/build/compare/run-utils-v5.0.1...run-utils-v5.0.2) (2022-11-17)


### Bug Fixes

* **deps:** update dependency @netlify/edge-bundler to v4.1.0 ([#4696](https://github.com/netlify/build/issues/4696)) ([f7044e0](https://github.com/netlify/build/commit/f7044e013804096dfb61ba0459226ff6d702ddf3))

## [5.0.1](https://github.com/netlify/build/compare/run-utils-v5.0.0...run-utils-v5.0.1) (2022-10-18)


### Bug Fixes

* run tsc -w if user runs ava -w ([#4601](https://github.com/netlify/build/issues/4601)) ([ebcc8a8](https://github.com/netlify/build/commit/ebcc8a86bc5324ab6c5450fbe396073215aaac6c))

## [5.0.0](https://github.com/netlify/build/compare/run-utils-v4.0.2...run-utils-v5.0.0) (2022-10-11)


### ⚠ BREAKING CHANGES

* drop node 12 support as it already reached EOL (#4599)

### Bug Fixes

* drop node 12 support as it already reached EOL ([#4599](https://github.com/netlify/build/issues/4599)) ([98d0d1e](https://github.com/netlify/build/commit/98d0d1e4db479fb9bb3a529de590f89aef7dd223))

## [4.0.2](https://github.com/netlify/build/compare/run-utils-v4.0.1...run-utils-v4.0.2) (2022-09-26)

### Bug Fixes

- build packages with lerna ([#4524](https://github.com/netlify/build/issues/4524))
  ([f74e385](https://github.com/netlify/build/commit/f74e385ffb7ffe7f3bfd5c3f80edc1b3249ca343))
- lerna caching ([#4533](https://github.com/netlify/build/issues/4533))
  ([4af0e1a](https://github.com/netlify/build/commit/4af0e1a9e0e5851e1d25b4acf41d1c4a98322019))

### [4.0.1](https://github.com/netlify/build/compare/run-utils-v4.0.0...run-utils-v4.0.1) (2022-02-08)

### Bug Fixes

- **deps:** update dependency execa to v6 ([#4094](https://github.com/netlify/build/issues/4094))
  ([4511447](https://github.com/netlify/build/commit/4511447230ae5b582821b40499ae29d97af0aeae))

## [4.0.0](https://www.github.com/netlify/build/compare/run-utils-v3.0.0...run-utils-v4.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with `run-utils` (#3936)

### Miscellaneous Chores

- use pure ES modules with `run-utils` ([#3936](https://www.github.com/netlify/build/issues/3936))
  ([d2365aa](https://www.github.com/netlify/build/commit/d2365aa096b924bb95c98fe7cfc4fbae13cee14a))

## [3.0.0](https://www.github.com/netlify/build/compare/run-utils-v2.0.1...run-utils-v3.0.0) (2021-11-24)

### ⚠ BREAKING CHANGES

- drop support for Node 10 (#3873)

### Miscellaneous Chores

- drop support for Node 10 ([#3873](https://www.github.com/netlify/build/issues/3873))
  ([ae8224d](https://www.github.com/netlify/build/commit/ae8224da8bca4f8c216afb6723664eb7095f1e98))

### [2.0.1](https://www.github.com/netlify/build/compare/run-utils-v2.0.0...run-utils-v2.0.1) (2021-08-12)

### Bug Fixes

- **deps:** bump execa to the latest version (5.x) ([#3440](https://www.github.com/netlify/build/issues/3440))
  ([3e8bd01](https://www.github.com/netlify/build/commit/3e8bd019eddca738a664af9590c313dd5fcd20df))

## [2.0.0](https://www.github.com/netlify/build/compare/run-utils-v1.0.7...run-utils-v2.0.0) (2021-07-23)

### ⚠ BREAKING CHANGES

- deprecate Node 8 (#3322)

### Miscellaneous Chores

- deprecate Node 8 ([#3322](https://www.github.com/netlify/build/issues/3322))
  ([9cc108a](https://www.github.com/netlify/build/commit/9cc108aab825558204ffef6b8034f456d8d11879))

### [1.0.7](https://www.github.com/netlify/build/compare/v1.0.6...v1.0.7) (2021-03-09)

### Bug Fixes

- fix `semver` version with Node 8 ([#2362](https://www.github.com/netlify/build/issues/2362))
  ([c72ecd8](https://www.github.com/netlify/build/commit/c72ecd8c8525e269180b427489991d9ec3238022))

### [1.0.6](https://www.github.com/netlify/build/compare/run-utils-v1.0.5...v1.0.6) (2021-02-18)

### Bug Fixes

- fix `files` in `package.json` with `npm@7` ([#2278](https://www.github.com/netlify/build/issues/2278))
  ([e9df064](https://www.github.com/netlify/build/commit/e9df0645f3083a0bb141c8b5b6e474ed4e27dbe9))
