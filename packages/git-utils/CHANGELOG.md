# Changelog

## [6.0.3](https://github.com/netlify/build/compare/git-utils-v6.0.2...git-utils-v6.0.3) (2025-12-19)


### Bug Fixes

* replace moize with micro-memoize ([#6836](https://github.com/netlify/build/issues/6836)) ([40f4bc6](https://github.com/netlify/build/commit/40f4bc6bf2821515a4293bc08f3f414a77b21dbc))

## [6.0.2](https://github.com/netlify/build/compare/git-utils-v6.0.1...git-utils-v6.0.2) (2025-05-29)


### Bug Fixes

* upgrade @types/node to v18 ([#6400](https://github.com/netlify/build/issues/6400)) ([efcc052](https://github.com/netlify/build/commit/efcc052daf4eeb57392e76f1e971422158ec5fab))

## [6.0.1](https://github.com/netlify/build/compare/git-utils-v6.0.0...git-utils-v6.0.1) (2025-05-20)


### Bug Fixes

* **deps:** upgrade execa to v8 ([#6301](https://github.com/netlify/build/issues/6301)) ([1f93c17](https://github.com/netlify/build/commit/1f93c179b7f48c5141456f1645156cd6b3909e3b))

## [6.0.0](https://github.com/netlify/build/compare/git-utils-v5.2.0...git-utils-v6.0.0) (2025-05-14)


### ⚠ BREAKING CHANGES

* end of support for v14 and v16 ([#6223](https://github.com/netlify/build/issues/6223))

### Features

* end of support for v14 and v16 ([#6223](https://github.com/netlify/build/issues/6223)) ([9917ef4](https://github.com/netlify/build/commit/9917ef4eb0bd47162e33aa432be7c9fa3fa462c4))

## [5.2.0](https://github.com/netlify/build/compare/git-utils-v5.1.1...git-utils-v5.2.0) (2024-12-11)


### Features

* add node 22 to supported versions list ([#5917](https://github.com/netlify/build/issues/5917)) ([5455393](https://github.com/netlify/build/commit/545539369a3f1a0e9d2036df7d41a8bed1df8272))

## [5.1.1](https://github.com/netlify/build/compare/git-utils-v5.1.0...git-utils-v5.1.1) (2023-03-13)


### Bug Fixes

* improve grammar and typos in comments ([#4922](https://github.com/netlify/build/issues/4922)) ([2e9d9c0](https://github.com/netlify/build/commit/2e9d9c06134f125aaf17bbbca0937cf43d3abae6))

## [5.1.0](https://github.com/netlify/build/compare/git-utils-v5.0.2...git-utils-v5.1.0) (2022-12-13)


### Features

* add build system detection ([#4763](https://github.com/netlify/build/issues/4763)) ([73bdb7b](https://github.com/netlify/build/commit/73bdb7bed7347cf6a8c4d729142c322297a0dce8))

## [5.0.2](https://github.com/netlify/build/compare/git-utils-v5.0.1...git-utils-v5.0.2) (2022-11-17)


### Bug Fixes

* **deps:** update dependency @netlify/edge-bundler to v4.1.0 ([#4696](https://github.com/netlify/build/issues/4696)) ([f7044e0](https://github.com/netlify/build/commit/f7044e013804096dfb61ba0459226ff6d702ddf3))

## [5.0.1](https://github.com/netlify/build/compare/git-utils-v5.0.0...git-utils-v5.0.1) (2022-10-18)


### Bug Fixes

* run tsc -w if user runs ava -w ([#4601](https://github.com/netlify/build/issues/4601)) ([ebcc8a8](https://github.com/netlify/build/commit/ebcc8a86bc5324ab6c5450fbe396073215aaac6c))

## [5.0.0](https://github.com/netlify/build/compare/git-utils-v4.1.4...git-utils-v5.0.0) (2022-10-11)


### ⚠ BREAKING CHANGES

* drop node 12 support as it already reached EOL (#4599)

### Bug Fixes

* drop node 12 support as it already reached EOL ([#4599](https://github.com/netlify/build/issues/4599)) ([98d0d1e](https://github.com/netlify/build/commit/98d0d1e4db479fb9bb3a529de590f89aef7dd223))

## [4.1.4](https://github.com/netlify/build/compare/git-utils-v4.1.3...git-utils-v4.1.4) (2022-10-10)


### Bug Fixes

* **headers-parser:** move headers-parser to monorepo and add types ([#4594](https://github.com/netlify/build/issues/4594)) ([b2d8078](https://github.com/netlify/build/commit/b2d8078349ba6bf09ad5ca3cbffd0018639a2042))

## [4.1.3](https://github.com/netlify/build/compare/git-utils-v4.1.2...git-utils-v4.1.3) (2022-10-06)


### Bug Fixes

* migrate to ts ([#4570](https://github.com/netlify/build/issues/4570)) ([9451924](https://github.com/netlify/build/commit/945192426ce9e0d7e14cf88a58a7de6277757cbb))

## [4.1.2](https://github.com/netlify/build/compare/git-utils-v4.1.1...git-utils-v4.1.2) (2022-09-26)

### Bug Fixes

- build packages with lerna ([#4524](https://github.com/netlify/build/issues/4524))
  ([f74e385](https://github.com/netlify/build/commit/f74e385ffb7ffe7f3bfd5c3f80edc1b3249ca343))
- lerna caching ([#4533](https://github.com/netlify/build/issues/4533))
  ([4af0e1a](https://github.com/netlify/build/commit/4af0e1a9e0e5851e1d25b4acf41d1c4a98322019))

### [4.1.1](https://github.com/netlify/build/compare/git-utils-v4.1.0...git-utils-v4.1.1) (2022-02-08)

### Bug Fixes

- **deps:** update dependency execa to v6 ([#4094](https://github.com/netlify/build/issues/4094))
  ([4511447](https://github.com/netlify/build/commit/4511447230ae5b582821b40499ae29d97af0aeae))
- **deps:** update dependency map-obj to v5 ([#4120](https://github.com/netlify/build/issues/4120))
  ([179269f](https://github.com/netlify/build/commit/179269ffe3f8747f320c5484ed67254d493d6997))
- **deps:** update dependency path-exists to v5 ([#4102](https://github.com/netlify/build/issues/4102))
  ([744421d](https://github.com/netlify/build/commit/744421d89d6e773bd96d82d3ceeb561ee5d7f3db))

## [4.1.0](https://github.com/netlify/build/compare/git-utils-v4.0.0...git-utils-v4.1.0) (2022-01-12)

### Features

- update `README.md` to use ES modules with plugins ([#4023](https://github.com/netlify/build/issues/4023))
  ([a96e05b](https://github.com/netlify/build/commit/a96e05b0fddbcd33cbc684b1e37994666419eafe))

## [4.0.0](https://www.github.com/netlify/build/compare/git-utils-v3.0.0...git-utils-v4.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with `git-utils` (#3943)

### Miscellaneous Chores

- use pure ES modules with `git-utils` ([#3943](https://www.github.com/netlify/build/issues/3943))
  ([59a9189](https://www.github.com/netlify/build/commit/59a918987c5ba9755c3e684d12e82879dbbe8b54))

## [3.0.0](https://www.github.com/netlify/build/compare/git-utils-v2.0.2...git-utils-v3.0.0) (2021-11-24)

### ⚠ BREAKING CHANGES

- drop support for Node 10 (#3873)

### Miscellaneous Chores

- drop support for Node 10 ([#3873](https://www.github.com/netlify/build/issues/3873))
  ([ae8224d](https://www.github.com/netlify/build/commit/ae8224da8bca4f8c216afb6723664eb7095f1e98))

### [2.0.2](https://www.github.com/netlify/build/compare/git-utils-v2.0.1...git-utils-v2.0.2) (2021-09-17)

### Bug Fixes

- `utils.git` crashes when commit messages or authors have uncommon characters
  ([#3623](https://www.github.com/netlify/build/issues/3623))
  ([895a06c](https://www.github.com/netlify/build/commit/895a06cc998f3f75c3fd204f887fad9c0e45e67d))

### [2.0.1](https://www.github.com/netlify/build/compare/git-utils-v2.0.0...git-utils-v2.0.1) (2021-08-12)

### Bug Fixes

- **deps:** bump execa to the latest version (5.x) ([#3440](https://www.github.com/netlify/build/issues/3440))
  ([3e8bd01](https://www.github.com/netlify/build/commit/3e8bd019eddca738a664af9590c313dd5fcd20df))

## [2.0.0](https://www.github.com/netlify/build/compare/git-utils-v1.0.11...git-utils-v2.0.0) (2021-07-23)

### ⚠ BREAKING CHANGES

- deprecate Node 8 (#3322)

### Miscellaneous Chores

- deprecate Node 8 ([#3322](https://www.github.com/netlify/build/issues/3322))
  ([9cc108a](https://www.github.com/netlify/build/commit/9cc108aab825558204ffef6b8034f456d8d11879))

### [1.0.11](https://www.github.com/netlify/build/compare/git-utils-v1.0.10...git-utils-v1.0.11) (2021-05-03)

### Bug Fixes

- **deps:** update dependency map-obj to v4 ([#2721](https://www.github.com/netlify/build/issues/2721))
  ([17559dc](https://www.github.com/netlify/build/commit/17559dcc75dd9f9a73f2a604c9f8ef3140a91b42))

### [1.0.10](https://www.github.com/netlify/build/compare/git-utils-v1.0.9...git-utils-v1.0.10) (2021-04-26)

### Bug Fixes

- **deps:** update dependency map-obj to v3.1.0 ([#2656](https://www.github.com/netlify/build/issues/2656))
  ([89e497a](https://www.github.com/netlify/build/commit/89e497a37a892f203a601a510e0e24ae037ad146))

### [1.0.9](https://www.github.com/netlify/build/compare/git-utils-v1.0.8...git-utils-v1.0.9) (2021-04-23)

### Bug Fixes

- fix `utils.git` for repositories with `main` branch ([#2638](https://www.github.com/netlify/build/issues/2638))
  ([5f80961](https://www.github.com/netlify/build/commit/5f80961e25387deee9b37bba07379adc1fed44c3))

### [1.0.8](https://www.github.com/netlify/build/compare/v1.0.7...v1.0.8) (2021-02-18)

### Bug Fixes

- fix `files` in `package.json` with `npm@7` ([#2278](https://www.github.com/netlify/build/issues/2278))
  ([e9df064](https://www.github.com/netlify/build/commit/e9df0645f3083a0bb141c8b5b6e474ed4e27dbe9))

### [1.0.7](https://www.github.com/netlify/build/compare/git-utils-v1.0.6...v1.0.7) (2021-02-01)

### Bug Fixes

- **deps:** update dependency moize to v6 ([#2231](https://www.github.com/netlify/build/issues/2231))
  ([e34454c](https://www.github.com/netlify/build/commit/e34454c633bbc541c4074bdaa15361c84f0c8f04))
