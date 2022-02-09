# Changelog

### [4.1.3](https://github.com/netlify/build/compare/cache-utils-v4.1.2...cache-utils-v4.1.3) (2022-02-08)


### Bug Fixes

* **deps:** update dependency locate-path to v7 ([#4097](https://github.com/netlify/build/issues/4097)) ([b4b451f](https://github.com/netlify/build/commit/b4b451f2016ce255ac6634c6ebfa9078cd5e8b3f))
* **deps:** update dependency path-exists to v5 ([#4102](https://github.com/netlify/build/issues/4102)) ([744421d](https://github.com/netlify/build/commit/744421d89d6e773bd96d82d3ceeb561ee5d7f3db))

### [4.1.2](https://github.com/netlify/build/compare/cache-utils-v4.1.1...cache-utils-v4.1.2) (2022-01-17)


### Bug Fixes

* **deps:** update del to v6.0.0 ([#4036](https://github.com/netlify/build/issues/4036)) ([f5e076c](https://github.com/netlify/build/commit/f5e076c7152aeadcddfa3805548fd160a416d3dc))

### [4.1.1](https://github.com/netlify/build/compare/cache-utils-v4.1.0...cache-utils-v4.1.1) (2022-01-13)


### Bug Fixes

* use fs promises directly ([#4030](https://github.com/netlify/build/issues/4030)) ([02c4309](https://github.com/netlify/build/commit/02c4309a8325a7bf69f7170d2a1fe992a31edff7))

## [4.1.0](https://github.com/netlify/build/compare/cache-utils-v4.0.0...cache-utils-v4.1.0) (2022-01-12)


### Features

* update `README.md` to use ES modules with plugins ([#4023](https://github.com/netlify/build/issues/4023)) ([a96e05b](https://github.com/netlify/build/commit/a96e05b0fddbcd33cbc684b1e37994666419eafe))

## [4.0.0](https://www.github.com/netlify/build/compare/cache-utils-v3.0.1...cache-utils-v4.0.0) (2021-12-15)


### ⚠ BREAKING CHANGES

* use pure ES modules with `cache-utils` (#3944)

### Miscellaneous Chores

* use pure ES modules with `cache-utils` ([#3944](https://www.github.com/netlify/build/issues/3944)) ([ca0ac3b](https://www.github.com/netlify/build/commit/ca0ac3b79acd62fd8a9ee37777fdfba6851b23ce))

### [3.0.1](https://www.github.com/netlify/build/compare/cache-utils-v3.0.0...cache-utils-v3.0.1) (2021-11-25)


### Bug Fixes

* remove `array-flat-polyfill` ([#3883](https://www.github.com/netlify/build/issues/3883)) ([a70ee72](https://www.github.com/netlify/build/commit/a70ee72ba481e7ab15da357773ef9033d5b9ddeb))

## [3.0.0](https://www.github.com/netlify/build/compare/cache-utils-v2.0.4...cache-utils-v3.0.0) (2021-11-24)


### ⚠ BREAKING CHANGES

* drop support for Node 10 (#3873)

### Miscellaneous Chores

* drop support for Node 10 ([#3873](https://www.github.com/netlify/build/issues/3873)) ([ae8224d](https://www.github.com/netlify/build/commit/ae8224da8bca4f8c216afb6723664eb7095f1e98))

### [2.0.4](https://www.github.com/netlify/build/compare/cache-utils-v2.0.3...cache-utils-v2.0.4) (2021-10-01)


### Bug Fixes

* **deps:** update dependency globby to v11 ([#3487](https://www.github.com/netlify/build/issues/3487)) ([6776522](https://www.github.com/netlify/build/commit/677652284d345b5d0db4344a93c92546559735c1))

### [2.0.3](https://www.github.com/netlify/build/compare/cache-utils-v2.0.2...cache-utils-v2.0.3) (2021-08-18)


### Bug Fixes

* **cache-utils:** don't cache junk files nor list them as cached ([#3516](https://www.github.com/netlify/build/issues/3516)) ([2aa9641](https://www.github.com/netlify/build/commit/2aa96413cdd3daf8fa73a9ac26ee2f6c85fc89b7))

### [2.0.2](https://www.github.com/netlify/build/compare/cache-utils-v2.0.1...cache-utils-v2.0.2) (2021-08-16)


### Bug Fixes

* **deps:** update dependency locate-path to v6 ([#3490](https://www.github.com/netlify/build/issues/3490)) ([523b049](https://www.github.com/netlify/build/commit/523b0496c90e4c80fcabd406022a2423b12d0a90))
* **deps:** update dependency move-file to v2 ([#3492](https://www.github.com/netlify/build/issues/3492)) ([9a71aab](https://www.github.com/netlify/build/commit/9a71aab0b9fdddbc56718b8956ecc0c6e427a8a0))

### [2.0.1](https://www.github.com/netlify/build/compare/cache-utils-v2.0.0...cache-utils-v2.0.1) (2021-08-13)


### Bug Fixes

* **deps:** update dependency get-stream to v6 ([#3456](https://www.github.com/netlify/build/issues/3456)) ([478a039](https://www.github.com/netlify/build/commit/478a03946579729a5796eb1a395389eafcc9168e))

## [2.0.0](https://www.github.com/netlify/build/compare/cache-utils-v1.0.7...cache-utils-v2.0.0) (2021-07-23)


### ⚠ BREAKING CHANGES

* deprecate Node 8 (#3322)

### Miscellaneous Chores

* deprecate Node 8 ([#3322](https://www.github.com/netlify/build/issues/3322)) ([9cc108a](https://www.github.com/netlify/build/commit/9cc108aab825558204ffef6b8034f456d8d11879))

### [1.0.7](https://www.github.com/netlify/build/compare/cache-utils-v1.0.6...v1.0.7) (2021-02-18)


### Bug Fixes

* fix `files` in `package.json` with `npm@7` ([#2278](https://www.github.com/netlify/build/issues/2278)) ([e9df064](https://www.github.com/netlify/build/commit/e9df0645f3083a0bb141c8b5b6e474ed4e27dbe9))
