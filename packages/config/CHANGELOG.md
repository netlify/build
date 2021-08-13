# Changelog

### [15.1.5](https://www.github.com/netlify/build/compare/config-v15.1.4...config-v15.1.5) (2021-08-13)


### Bug Fixes

* **deps:** update dependency netlify-headers-parser to ^2.1.0 ([#3458](https://www.github.com/netlify/build/issues/3458)) ([e7665ec](https://www.github.com/netlify/build/commit/e7665ecb7bc1960ca19ba2717a2b2d608ae83bb6))

### [15.1.4](https://www.github.com/netlify/build/compare/config-v15.1.3...config-v15.1.4) (2021-08-13)


### Bug Fixes

* **deps:** update dependency find-up to v5 ([#3455](https://www.github.com/netlify/build/issues/3455)) ([e540ec2](https://www.github.com/netlify/build/commit/e540ec26863f0cfaba3736bade0ce7b4aecbe36a))

### [15.1.3](https://www.github.com/netlify/build/compare/config-v15.1.2...config-v15.1.3) (2021-08-12)


### Bug Fixes

* **deps:** update dependency netlify-headers-parser to v2 ([#3448](https://www.github.com/netlify/build/issues/3448)) ([3d83dce](https://www.github.com/netlify/build/commit/3d83dce6efa68df5ef090e57958eff6f78c8f065))

### [15.1.2](https://www.github.com/netlify/build/compare/config-v15.1.1...config-v15.1.2) (2021-08-12)


### Bug Fixes

* delete `_redirects`/`_headers` when persisted to `netlify.toml` ([#3446](https://www.github.com/netlify/build/issues/3446)) ([4bdf2cc](https://www.github.com/netlify/build/commit/4bdf2ccb64edae4254a9b7832f46e2cbeeb322eb))

### [15.1.1](https://www.github.com/netlify/build/compare/config-v15.1.0...config-v15.1.1) (2021-08-12)


### Bug Fixes

* **deps:** bump execa to the latest version (5.x) ([#3440](https://www.github.com/netlify/build/issues/3440)) ([3e8bd01](https://www.github.com/netlify/build/commit/3e8bd019eddca738a664af9590c313dd5fcd20df))

## [15.1.0](https://www.github.com/netlify/build/compare/config-v15.0.5...config-v15.1.0) (2021-08-12)


### Features

* remove headers/redirects duplicate filtering ([#3439](https://www.github.com/netlify/build/issues/3439)) ([ebc88c1](https://www.github.com/netlify/build/commit/ebc88c12eea2a8f47ee02415e94d7c4e451fb356))

### [15.0.5](https://www.github.com/netlify/build/compare/config-v15.0.4...config-v15.0.5) (2021-08-12)


### Bug Fixes

* **deps:** update dependency netlify-headers-parser to ^1.1.1 ([#3441](https://www.github.com/netlify/build/issues/3441)) ([04cee44](https://www.github.com/netlify/build/commit/04cee441dc61aa0efff3216d4a66768808a330ed))

### [15.0.4](https://www.github.com/netlify/build/compare/config-v15.0.3...config-v15.0.4) (2021-08-12)


### Bug Fixes

* **deps:** update dependency netlify-headers-parser to ^1.1.0 ([#3435](https://www.github.com/netlify/build/issues/3435)) ([26b4e4e](https://www.github.com/netlify/build/commit/26b4e4e8ba4a90b85596eaeee216ee5d6fbc509b))
* **deps:** update dependency netlify-redirect-parser to v9 ([#3436](https://www.github.com/netlify/build/issues/3436)) ([7efd2dc](https://www.github.com/netlify/build/commit/7efd2dc7b29d837b4452a1510df76b53a3276845))

### [15.0.3](https://www.github.com/netlify/build/compare/config-v15.0.2...config-v15.0.3) (2021-08-12)


### Bug Fixes

* fix how redirects/headers check for duplicates ([#3424](https://www.github.com/netlify/build/issues/3424)) ([c44f35c](https://www.github.com/netlify/build/commit/c44f35c9562ea42a210ab2f83133b76534543f4d))

### [15.0.2](https://www.github.com/netlify/build/compare/config-v15.0.1...config-v15.0.2) (2021-08-11)


### Bug Fixes

* bump `netlify-headers-parser` ([77177fc](https://www.github.com/netlify/build/commit/77177fcbc2668dc829bac8b8325063cc557c7ed1))

### [15.0.1](https://www.github.com/netlify/build/compare/config-v15.0.0...config-v15.0.1) (2021-08-11)


### Bug Fixes

* error handling of headers and redirects ([#3422](https://www.github.com/netlify/build/issues/3422)) ([add5417](https://www.github.com/netlify/build/commit/add54178e5b046d6ec8d7cc44ac626135a25b9e6))

## [15.0.0](https://www.github.com/netlify/build/compare/config-v14.4.3...config-v15.0.0) (2021-08-11)


### ⚠ BREAKING CHANGES

* add `netlifyConfig.headers` (#3407)

### Features

* add `netlifyConfig.headers` ([#3407](https://www.github.com/netlify/build/issues/3407)) ([14888c7](https://www.github.com/netlify/build/commit/14888c73278b6c68538ecaa385e5ce01932b7e09))

### [14.4.3](https://www.github.com/netlify/build/compare/config-v14.4.2...config-v14.4.3) (2021-08-05)


### Bug Fixes

* **deps:** update dependency netlify-redirect-parser to ^8.2.0 ([#3399](https://www.github.com/netlify/build/issues/3399)) ([70911c9](https://www.github.com/netlify/build/commit/70911c91729d02475684b179febe9b07e23df293))

### [14.4.2](https://www.github.com/netlify/build/compare/config-v14.4.1...config-v14.4.2) (2021-08-05)


### Bug Fixes

* `redirects[*].status` should not be a float in `netlify.toml` ([#3396](https://www.github.com/netlify/build/issues/3396)) ([1c006ea](https://www.github.com/netlify/build/commit/1c006eae3de54e034dbcd87de5e011b6bfa843e6))

### [14.4.1](https://www.github.com/netlify/build/compare/config-v14.4.0...config-v14.4.1) (2021-08-04)


### Bug Fixes

* persist `build.environment` changes to `netlify.toml` ([#3394](https://www.github.com/netlify/build/issues/3394)) ([101f99e](https://www.github.com/netlify/build/commit/101f99e0ee65eafc577241711c01e142d6b80444))

## [14.4.0](https://www.github.com/netlify/build/compare/config-v14.3.0...config-v14.4.0) (2021-08-04)


### Features

* allow modifying `build.environment` ([#3389](https://www.github.com/netlify/build/issues/3389)) ([76d3bc9](https://www.github.com/netlify/build/commit/76d3bc9c77e28cf500ada47289c01d394d6da6db))

## [14.3.0](https://www.github.com/netlify/build/compare/config-v14.2.0...config-v14.3.0) (2021-08-03)


### Features

* improve config simplification ([#3384](https://www.github.com/netlify/build/issues/3384)) ([b9f7d7a](https://www.github.com/netlify/build/commit/b9f7d7ad1baf063bd3919a16b961007cb94da2e2))

## [14.2.0](https://www.github.com/netlify/build/compare/config-v14.1.1...config-v14.2.0) (2021-08-03)


### Features

* **build:** return config mutations ([#3379](https://www.github.com/netlify/build/issues/3379)) ([8eb39b5](https://www.github.com/netlify/build/commit/8eb39b5ee3fae124498f87046a7776ad5574e011))

### [14.1.1](https://www.github.com/netlify/build/compare/config-v14.1.0...config-v14.1.1) (2021-08-02)


### Bug Fixes

* **deps:** update dependency chalk to ^4.1.1 ([#3367](https://www.github.com/netlify/build/issues/3367)) ([dd258ec](https://www.github.com/netlify/build/commit/dd258ecd758824e56b15fc5f6c73a3180ac0af66))

## [14.1.0](https://www.github.com/netlify/build/compare/config-v14.0.0...config-v14.1.0) (2021-07-28)


### Features

* add `NETLIFY_LOCAL` environment variable ([#3351](https://www.github.com/netlify/build/issues/3351)) ([c3c0716](https://www.github.com/netlify/build/commit/c3c07169ba922010d7233de868a52b6ccd6bcd20))

## [14.0.0](https://www.github.com/netlify/build/compare/config-v13.0.0...config-v14.0.0) (2021-07-26)


### ⚠ BREAKING CHANGES

* deprecate Node 8 (#3322)

### Features

* **plugins:** remove feature flag responsible plugin node version execution changes ([#3311](https://www.github.com/netlify/build/issues/3311)) ([8c94faf](https://www.github.com/netlify/build/commit/8c94faf8d1e7cbf830b1cbc722949198759f9f8c))


### Bug Fixes

* **deps:** update dependency netlify to v8 ([#3338](https://www.github.com/netlify/build/issues/3338)) ([6912475](https://www.github.com/netlify/build/commit/6912475b307be67dd003df26d0bf28ae21e3d172))


### Miscellaneous Chores

* deprecate Node 8 ([#3322](https://www.github.com/netlify/build/issues/3322)) ([9cc108a](https://www.github.com/netlify/build/commit/9cc108aab825558204ffef6b8034f456d8d11879))

## [13.0.0](https://www.github.com/netlify/build/compare/config-v12.6.0...config-v13.0.0) (2021-07-16)


### ⚠ BREAKING CHANGES

* change edge-handler default directory (#3296)

### Features

* change edge-handler default directory ([#3296](https://www.github.com/netlify/build/issues/3296)) ([86b02da](https://www.github.com/netlify/build/commit/86b02dae85bbd879f107606487853ad3cd2fc147))

## [12.6.0](https://www.github.com/netlify/build/compare/config-v12.5.0...config-v12.6.0) (2021-07-08)


### Features

* delete `netlify.toml` after deploy if it was created due to configuration changes ([#3271](https://www.github.com/netlify/build/issues/3271)) ([444087d](https://www.github.com/netlify/build/commit/444087d528a0e8450031eda65cd5877980a5fa70))

## [12.5.0](https://www.github.com/netlify/build/compare/config-v12.4.0...config-v12.5.0) (2021-07-08)


### Features

* simplify the `netlify.toml` being saved on configuration changes ([#3268](https://www.github.com/netlify/build/issues/3268)) ([15987fe](https://www.github.com/netlify/build/commit/15987fe0d869f01110d4d97c8e8395580eb1a9f7))

## [12.4.0](https://www.github.com/netlify/build/compare/config-v12.3.0...config-v12.4.0) (2021-07-08)


### Features

* restore `netlify.toml` and `_redirects` after deploy ([#3265](https://www.github.com/netlify/build/issues/3265)) ([2441d6a](https://www.github.com/netlify/build/commit/2441d6a8b2be81212384816a0686221d4a6a2577))

## [12.3.0](https://www.github.com/netlify/build/compare/config-v12.2.1...config-v12.3.0) (2021-07-08)


### Features

* fix `_redirects` to `netlify.toml` before deploy ([#3259](https://www.github.com/netlify/build/issues/3259)) ([e32d076](https://www.github.com/netlify/build/commit/e32d076ab642b8a0df72c96d8726e161b65b182f))

### [12.2.1](https://www.github.com/netlify/build/compare/config-v12.2.0...config-v12.2.1) (2021-07-08)


### Bug Fixes

* allow `netlifyConfig.redirects` to be modified before `_redirects` is added ([#3242](https://www.github.com/netlify/build/issues/3242)) ([f3330a6](https://www.github.com/netlify/build/commit/f3330a685aeb0320e1ac445bbe7a908e7a83dbda))
* **deps:** update dependency netlify-redirect-parser to ^8.1.0 ([#3246](https://www.github.com/netlify/build/issues/3246)) ([2f0b9b1](https://www.github.com/netlify/build/commit/2f0b9b1d8350caafee48d38cd05dabf7037a6c20))

## [12.2.0](https://www.github.com/netlify/build/compare/config-v12.1.1...config-v12.2.0) (2021-07-08)


### Features

* add default values for `build.processing` and `build.services` ([#3235](https://www.github.com/netlify/build/issues/3235)) ([2ba263b](https://www.github.com/netlify/build/commit/2ba263ba9ebc54c38410245f021deb906b8a8aa2))

### [12.1.1](https://www.github.com/netlify/build/compare/config-v12.1.0...config-v12.1.1) (2021-07-07)


### Bug Fixes

* return `redirects` with `@netlify/config` ([#3231](https://www.github.com/netlify/build/issues/3231)) ([be511fa](https://www.github.com/netlify/build/commit/be511fa06e09a6589f06f2943ee06de1062c88ec))

## [12.1.0](https://www.github.com/netlify/build/compare/config-v12.0.1...config-v12.1.0) (2021-07-07)


### Features

* persist configuration changes to `netlify.toml` ([#3224](https://www.github.com/netlify/build/issues/3224)) ([f924661](https://www.github.com/netlify/build/commit/f924661f94d04af1e90e1023e385e35587ae301c))

### [12.0.1](https://www.github.com/netlify/build/compare/config-v12.0.0...config-v12.0.1) (2021-07-06)


### Bug Fixes

* handle `plugins[*].pinned_version` being an empty string ([#3221](https://www.github.com/netlify/build/issues/3221)) ([46c43b4](https://www.github.com/netlify/build/commit/46c43b4eca36cd7ad866617e2ce721e45a26abd1))

## [12.0.0](https://www.github.com/netlify/build/compare/config-v11.0.0...config-v12.0.0) (2021-07-06)


### ⚠ BREAKING CHANGES

* return `redirectsPath` from `@netlify/config` (#3207)

### Features

* return `redirectsPath` from `@netlify/config` ([#3207](https://www.github.com/netlify/build/issues/3207)) ([35dd205](https://www.github.com/netlify/build/commit/35dd205ca35a393dbb3cff50e79ba1cdad8f8755))

## [11.0.0](https://www.github.com/netlify/build/compare/config-v10.3.0...config-v11.0.0) (2021-07-06)


### ⚠ BREAKING CHANGES

* add `configMutations` flag to `@netlify/config` (#3211)

### Features

* add `configMutations` flag to `@netlify/config` ([#3211](https://www.github.com/netlify/build/issues/3211)) ([9037f03](https://www.github.com/netlify/build/commit/9037f03b6d288d136007f0c2c964c04aed3f33f7))

## [10.3.0](https://www.github.com/netlify/build/compare/config-v10.2.0...config-v10.3.0) (2021-07-05)


### Features

* move some mutation logic to `@netlify/config` ([#3203](https://www.github.com/netlify/build/issues/3203)) ([9ce4725](https://www.github.com/netlify/build/commit/9ce47250e806379db93528913c298bc57f3d23a6))

## [10.2.0](https://www.github.com/netlify/build/compare/config-v10.1.0...config-v10.2.0) (2021-07-05)


### Features

* fix `context` override for `edge_handlers` ([#3199](https://www.github.com/netlify/build/issues/3199)) ([54f52e1](https://www.github.com/netlify/build/commit/54f52e19481d528b1660743038aaa747cd439384))

## [10.1.0](https://www.github.com/netlify/build/compare/config-v10.0.0...config-v10.1.0) (2021-07-05)


### Features

* improve `functions` configuration logic ([#3175](https://www.github.com/netlify/build/issues/3175)) ([7085d77](https://www.github.com/netlify/build/commit/7085d7720191c399d8fd9d560ce30a76b483e30a))

## [10.0.0](https://www.github.com/netlify/build/compare/config-v9.8.0...config-v10.0.0) (2021-07-05)


### ⚠ BREAKING CHANGES

* merge `priorityConfig` with `inlineConfig` (#3193)

### Features

* merge `priorityConfig` with `inlineConfig` ([#3193](https://www.github.com/netlify/build/issues/3193)) ([35989ef](https://www.github.com/netlify/build/commit/35989ef8fe8196c1da2d36c2f73e4ff82efba6c5))

## [9.8.0](https://www.github.com/netlify/build/compare/config-v9.7.0...config-v9.8.0) (2021-07-05)


### Features

* change `origin` of `inlineConfig` and `priorityConfig` ([#3190](https://www.github.com/netlify/build/issues/3190)) ([5ea2439](https://www.github.com/netlify/build/commit/5ea2439ae8f7de11ba15059820466456ee8df196))

## [9.7.0](https://www.github.com/netlify/build/compare/config-v9.6.0...config-v9.7.0) (2021-07-05)


### Features

* change how `priorityConfig` interacts with contexts ([#3187](https://www.github.com/netlify/build/issues/3187)) ([736c269](https://www.github.com/netlify/build/commit/736c26993385173e37110b8e26c2cf389344de3e))

## [9.6.0](https://www.github.com/netlify/build/compare/config-v9.5.0...config-v9.6.0) (2021-07-05)


### Features

* refactor config contexts logic ([#3174](https://www.github.com/netlify/build/issues/3174)) ([2815d8e](https://www.github.com/netlify/build/commit/2815d8ec46558ab87fb5c7f30e34a3f66c13ac0c))

## [9.5.0](https://www.github.com/netlify/build/compare/config-v9.4.0...config-v9.5.0) (2021-06-30)


### Features

* allow plugins to unset configuration properties ([#3158](https://www.github.com/netlify/build/issues/3158)) ([64e1235](https://www.github.com/netlify/build/commit/64e1235079356f5936638cde812a17027e627b9f))

## [9.4.0](https://www.github.com/netlify/build/compare/config-v9.3.0...config-v9.4.0) (2021-06-30)


### Features

* remove redirects parsing feature flag ([#3150](https://www.github.com/netlify/build/issues/3150)) ([1f297c9](https://www.github.com/netlify/build/commit/1f297c9845bc3a1f3ba4725c9f97aadf0d541e45))

## [9.3.0](https://www.github.com/netlify/build/compare/config-v9.2.0...config-v9.3.0) (2021-06-28)


### Features

* log `redirectsOrigin` in debug mode ([#3128](https://www.github.com/netlify/build/issues/3128)) ([d18601c](https://www.github.com/netlify/build/commit/d18601c04e96ea87e29bac4d6eaf0bf8b5753988))

## [9.2.0](https://www.github.com/netlify/build/compare/config-v9.1.0...config-v9.2.0) (2021-06-28)


### Features

* add `config.redirectsOrigin` ([#3115](https://www.github.com/netlify/build/issues/3115)) ([50a783f](https://www.github.com/netlify/build/commit/50a783ff434d24b528c94d761863f1227a47e9de))

## [9.1.0](https://www.github.com/netlify/build/compare/config-v9.0.0...config-v9.1.0) (2021-06-24)


### Features

* add `priorityConfig` to `@netlify/config` ([#3102](https://www.github.com/netlify/build/issues/3102)) ([013ca1d](https://www.github.com/netlify/build/commit/013ca1d2efbde3547373f17f1550fe9cf60b9826))

## [9.0.0](https://www.github.com/netlify/build/compare/config-v8.0.1...config-v9.0.0) (2021-06-24)


### ⚠ BREAKING CHANGES

* do not print `@netlify/config` return value when `output` is defined (#3109)

### Features

* do not print `@netlify/config` return value when `output` is defined ([#3109](https://www.github.com/netlify/build/issues/3109)) ([38363fd](https://www.github.com/netlify/build/commit/38363fd173428b57c948c1ea9329265f013c8007))

### [8.0.1](https://www.github.com/netlify/build/compare/config-v8.0.0...config-v8.0.1) (2021-06-24)


### Bug Fixes

* **plugins:** feature flag plugin execution with the system node version ([#3081](https://www.github.com/netlify/build/issues/3081)) ([d1d5b58](https://www.github.com/netlify/build/commit/d1d5b58925fbe156591de0cf7123276fb910332d))

## [8.0.0](https://www.github.com/netlify/build/compare/config-v7.7.1...config-v8.0.0) (2021-06-22)


### ⚠ BREAKING CHANGES

* update dependency netlify-redirect-parser to v8 (#3091)

### Bug Fixes

* update dependency netlify-redirect-parser to v8 ([#3091](https://www.github.com/netlify/build/issues/3091)) ([bf21959](https://www.github.com/netlify/build/commit/bf2195937ae7c33f4a74d64fd8c1cdc2e327a58e))

### [7.7.1](https://www.github.com/netlify/build/compare/config-v7.7.0...config-v7.7.1) (2021-06-22)


### Bug Fixes

* set `redirects` to an empty array with `@netlify/config` binary output ([#3083](https://www.github.com/netlify/build/issues/3083)) ([7543c21](https://www.github.com/netlify/build/commit/7543c217b5b89c978b5178b938b633affe00f1db))

## [7.7.0](https://www.github.com/netlify/build/compare/config-v7.6.0...config-v7.7.0) (2021-06-22)


### Features

* do not print `redirects` with the `@netlify/config` CLI ([#3059](https://www.github.com/netlify/build/issues/3059)) ([ccaa12d](https://www.github.com/netlify/build/commit/ccaa12dffc6701c7d8a2eee176a81b92e330b9c7))

## [7.6.0](https://www.github.com/netlify/build/compare/config-v7.5.0...config-v7.6.0) (2021-06-22)


### Features

* add `build.publishOrigin` to `@netlify/config` ([#3078](https://www.github.com/netlify/build/issues/3078)) ([b5badfd](https://www.github.com/netlify/build/commit/b5badfdda2c7bada76d21583f6f57465b12b16cb))

## [7.5.0](https://www.github.com/netlify/build/compare/config-v7.4.1...config-v7.5.0) (2021-06-17)


### Features

* return `accounts` and `addons` from `@netlify/config` ([#3057](https://www.github.com/netlify/build/issues/3057)) ([661f79c](https://www.github.com/netlify/build/commit/661f79cf9ca6eaee03f25a24a6569bc6cc9302a3))

### [7.4.1](https://www.github.com/netlify/build/compare/config-v7.4.0...config-v7.4.1) (2021-06-17)


### Bug Fixes

* remove `netlify_config_default_publish` feature flag ([#3047](https://www.github.com/netlify/build/issues/3047)) ([0e2c137](https://www.github.com/netlify/build/commit/0e2c137fffae8ad3d4d8243ade3e5f46c0e96e21))

## [7.4.0](https://www.github.com/netlify/build/compare/config-v7.3.0...config-v7.4.0) (2021-06-15)


### Features

* add `--cachedConfigPath` CLI flag ([#3037](https://www.github.com/netlify/build/issues/3037)) ([e317a36](https://www.github.com/netlify/build/commit/e317a36b7c7028fcab6bb0fb0d026e0da522b692))

## [7.3.0](https://www.github.com/netlify/build/compare/config-v7.2.4...config-v7.3.0) (2021-06-15)


### Features

* add `--output` CLI flag to `@netlify/config` ([#3028](https://www.github.com/netlify/build/issues/3028)) ([5a07b84](https://www.github.com/netlify/build/commit/5a07b84c501c36b696f017d585d79d149577dbb2))

### [7.2.4](https://www.github.com/netlify/build/compare/config-v7.2.3...config-v7.2.4) (2021-06-14)


### Bug Fixes

* **deps:** update dependency netlify-redirect-parser to v7 ([#3026](https://www.github.com/netlify/build/issues/3026)) ([33b4d2a](https://www.github.com/netlify/build/commit/33b4d2a8ada68941d2f3f0171ac05eb37f77af60))

### [7.2.3](https://www.github.com/netlify/build/compare/config-v7.2.2...config-v7.2.3) (2021-06-14)


### Bug Fixes

* **deps:** update dependency netlify-redirect-parser to v5.2.1 ([#3021](https://www.github.com/netlify/build/issues/3021)) ([be298a1](https://www.github.com/netlify/build/commit/be298a1315f89f02fb38ba99762ab029cde20a68))
* pin zisi version in functions utils ([#3023](https://www.github.com/netlify/build/issues/3023)) ([9c6b09b](https://www.github.com/netlify/build/commit/9c6b09b89d5b3e1552eb848aea016092c6abcf5e))

### [7.2.2](https://www.github.com/netlify/build/compare/config-v7.2.1...config-v7.2.2) (2021-06-14)


### Bug Fixes

* **deps:** update dependency netlify-redirect-parser to ^5.2.0 ([#3018](https://www.github.com/netlify/build/issues/3018)) ([374b1cc](https://www.github.com/netlify/build/commit/374b1ccaede449a79d366b75bc38dbdb90d2a9ff))

### [7.2.1](https://www.github.com/netlify/build/compare/config-v7.2.0...config-v7.2.1) (2021-06-14)


### Bug Fixes

* revert `redirects` parsing ([#3016](https://www.github.com/netlify/build/issues/3016)) ([39613cf](https://www.github.com/netlify/build/commit/39613cfd04281e51264ef61a75c3bd4880158a11))

## [7.2.0](https://www.github.com/netlify/build/compare/config-v7.1.2...config-v7.2.0) (2021-06-11)


### Features

* add `config.redirects` ([#3003](https://www.github.com/netlify/build/issues/3003)) ([ec3c177](https://www.github.com/netlify/build/commit/ec3c177fcc6a90a99fb7a584d2402b004704bc7e))

### [7.1.2](https://www.github.com/netlify/build/compare/config-v7.1.1...config-v7.1.2) (2021-06-11)


### Bug Fixes

* refactor some logic related to the `base` directory ([#3001](https://www.github.com/netlify/build/issues/3001)) ([2fa3b43](https://www.github.com/netlify/build/commit/2fa3b43ddc13829505776b21631803a5009de4ea))

### [7.1.1](https://www.github.com/netlify/build/compare/config-v7.1.0...config-v7.1.1) (2021-06-11)


### Bug Fixes

* move some lines of code ([#2999](https://www.github.com/netlify/build/issues/2999)) ([857787f](https://www.github.com/netlify/build/commit/857787fec08612f4e53687d4cbba0374fc4022bf))

## [7.1.0](https://www.github.com/netlify/build/compare/config-v7.0.3...config-v7.1.0) (2021-06-11)


### Features

* refactor some logic related to the `base` directory ([#2997](https://www.github.com/netlify/build/issues/2997)) ([683b9bd](https://www.github.com/netlify/build/commit/683b9bd0e3d1f93ac4f293e904657193e2ca253c))

### [7.0.3](https://www.github.com/netlify/build/compare/config-v7.0.2...config-v7.0.3) (2021-06-10)


### Bug Fixes

* merge conflict ([e1fcf01](https://www.github.com/netlify/build/commit/e1fcf017549a084f7b024a6b7cdceb9154c6462e))

### [7.0.2](https://www.github.com/netlify/build/compare/config-v7.0.1...config-v7.0.2) (2021-06-10)


### Bug Fixes

* refactor a warning message ([#2973](https://www.github.com/netlify/build/issues/2973)) ([dee5bd8](https://www.github.com/netlify/build/commit/dee5bd8c68e77aa027894599e6c30a3eaf6f3c2a))

### [7.0.1](https://www.github.com/netlify/build/compare/config-v7.0.0...config-v7.0.1) (2021-06-10)


### Bug Fixes

* feature flags logging in `@netlify/config` ([#2993](https://www.github.com/netlify/build/issues/2993)) ([03e2978](https://www.github.com/netlify/build/commit/03e2978174ce6e357b66d6df054a441facbfd52d))

## [7.0.0](https://www.github.com/netlify/build/compare/config-v6.10.0...config-v7.0.0) (2021-06-10)


### ⚠ BREAKING CHANGES

* improve support for monorepo sites without a `publish` directory (#2988)

### Features

* improve support for monorepo sites without a `publish` directory ([#2988](https://www.github.com/netlify/build/issues/2988)) ([1fcad8a](https://www.github.com/netlify/build/commit/1fcad8a81c35060fbc3ec8cb15ade9762579a166))

## [6.10.0](https://www.github.com/netlify/build/compare/config-v6.9.2...config-v6.10.0) (2021-06-10)


### Features

* improve feature flags logic ([#2960](https://www.github.com/netlify/build/issues/2960)) ([6df6360](https://www.github.com/netlify/build/commit/6df63603ee3822229d1504e95f4622d47387ddfb))

### [6.9.2](https://www.github.com/netlify/build/compare/config-v6.9.1...config-v6.9.2) (2021-06-09)


### Bug Fixes

* refactor warning message related to monorepo `publish` default value ([#2970](https://www.github.com/netlify/build/issues/2970)) ([09b50ac](https://www.github.com/netlify/build/commit/09b50acb82c10eccbf96752e76e47907e50c029f))

### [6.9.1](https://www.github.com/netlify/build/compare/config-v6.9.0...config-v6.9.1) (2021-06-09)


### Bug Fixes

* move build directory logic to its own file ([#2969](https://www.github.com/netlify/build/issues/2969)) ([db6eba3](https://www.github.com/netlify/build/commit/db6eba3ad9b72662ee23615b97408d064fcccd21))

## [6.9.0](https://www.github.com/netlify/build/compare/config-v6.8.0...config-v6.9.0) (2021-06-09)


### Features

* simplify code related to `base` directory ([#2951](https://www.github.com/netlify/build/issues/2951)) ([bfffc2e](https://www.github.com/netlify/build/commit/bfffc2e86a82ded738074b1ed32ce2bf0d8d4a91))

## [6.8.0](https://www.github.com/netlify/build/compare/config-v6.7.3...config-v6.8.0) (2021-06-09)


### Features

* refactor configuration file paths resolution ([#2954](https://www.github.com/netlify/build/issues/2954)) ([d059450](https://www.github.com/netlify/build/commit/d0594507501936a2eaba2b59c912d51962f738b8))

### [6.7.3](https://www.github.com/netlify/build/compare/config-v6.7.2...config-v6.7.3) (2021-06-08)


### Bug Fixes

* `@netlify/config` `README` update ([#2946](https://www.github.com/netlify/build/issues/2946)) ([baf5a9a](https://www.github.com/netlify/build/commit/baf5a9aff5eb8a5040930189fc0406e46980a994))

### [6.7.2](https://www.github.com/netlify/build/compare/config-v6.7.1...config-v6.7.2) (2021-06-04)


### Bug Fixes

* **deps:** update dependency netlify to ^7.0.1 ([#2908](https://www.github.com/netlify/build/issues/2908)) ([28f1366](https://www.github.com/netlify/build/commit/28f13666a0dec4625c221619175f554aa7c8b761))

### [6.7.1](https://www.github.com/netlify/build/compare/config-v6.7.0...config-v6.7.1) (2021-05-27)


### Bug Fixes

* **deps:** update dependency netlify to v7 ([#2858](https://www.github.com/netlify/build/issues/2858)) ([866fddb](https://www.github.com/netlify/build/commit/866fddbb0eb9a8272997960197b8418c62a4b06b))

## [6.7.0](https://www.github.com/netlify/build/compare/config-v6.6.0...config-v6.7.0) (2021-05-24)


### Features

* **config:** consider package.json when detecting base directory ([#2838](https://www.github.com/netlify/build/issues/2838)) ([9172222](https://www.github.com/netlify/build/commit/9172222dea8458bf32119788fc89c17264757e5f))

## [6.6.0](https://www.github.com/netlify/build/compare/config-v6.5.0...config-v6.6.0) (2021-05-21)


### Features

* print a warning message when `base` is set but not `publish` ([#2827](https://www.github.com/netlify/build/issues/2827)) ([a9fb807](https://www.github.com/netlify/build/commit/a9fb807be477bcd2419520b92d8a7c7d7ee03088))

## [6.5.0](https://www.github.com/netlify/build/compare/config-v6.4.4...config-v6.5.0) (2021-05-12)


### Features

* **config:** return repository root ([#2785](https://www.github.com/netlify/build/issues/2785)) ([9a05786](https://www.github.com/netlify/build/commit/9a05786266c51031ccaef1f216f21c5821ec92fb))

### [6.4.4](https://www.github.com/netlify/build/compare/config-v6.4.3...config-v6.4.4) (2021-05-05)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.27 ([#2745](https://www.github.com/netlify/build/issues/2745)) ([c2725e8](https://www.github.com/netlify/build/commit/c2725e835e1b13c233f53201399c767a75e1bab1))

### [6.4.3](https://www.github.com/netlify/build/compare/config-v6.4.2...config-v6.4.3) (2021-05-04)


### Bug Fixes

* **deps:** update netlify packages ([#2735](https://www.github.com/netlify/build/issues/2735)) ([6060bab](https://www.github.com/netlify/build/commit/6060babcee003881df46f45eda1118b7737cc4e1))

### [6.4.2](https://www.github.com/netlify/build/compare/config-v6.4.1...config-v6.4.2) (2021-05-03)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.25 ([#2733](https://www.github.com/netlify/build/issues/2733)) ([0a06086](https://www.github.com/netlify/build/commit/0a060867d3896adf61daf4ddd875e872a1ae956d))

### [6.4.1](https://www.github.com/netlify/build/compare/config-v6.4.0...config-v6.4.1) (2021-05-03)


### Bug Fixes

* **deps:** update dependency map-obj to v4 ([#2721](https://www.github.com/netlify/build/issues/2721)) ([17559dc](https://www.github.com/netlify/build/commit/17559dcc75dd9f9a73f2a604c9f8ef3140a91b42))
* local builds version pinning ([#2717](https://www.github.com/netlify/build/issues/2717)) ([f3a8c17](https://www.github.com/netlify/build/commit/f3a8c17dbcbc9c4f44ba97acf9e886e1cb03da71))

## [6.4.0](https://www.github.com/netlify/build/compare/config-v6.3.2...config-v6.4.0) (2021-05-03)


### Features

* add support for `functions.included_files` config property ([#2681](https://www.github.com/netlify/build/issues/2681)) ([d75dc74](https://www.github.com/netlify/build/commit/d75dc74d9bbe9b542b17afce37419bed575c8651))

### [6.3.2](https://www.github.com/netlify/build/compare/config-v6.3.1...config-v6.3.2) (2021-04-29)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.24 ([#2686](https://www.github.com/netlify/build/issues/2686)) ([914b7cb](https://www.github.com/netlify/build/commit/914b7cb11ee0bd9edb95f304c34fecc01e36bdc3))

### [6.3.1](https://www.github.com/netlify/build/compare/config-v6.3.0...config-v6.3.1) (2021-04-29)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.23 ([#2684](https://www.github.com/netlify/build/issues/2684)) ([cf821f1](https://www.github.com/netlify/build/commit/cf821f102ea219af730c3b6d9989c16a0500e211))

## [6.3.0](https://www.github.com/netlify/build/compare/config-v6.2.1...config-v6.3.0) (2021-04-27)


### Features

* allow buildbot to pin plugin versions in `@netlify/config` ([#2674](https://www.github.com/netlify/build/issues/2674)) ([2e8a086](https://www.github.com/netlify/build/commit/2e8a0866b6bc60dfbeaccc54edc093c82d5aef7a))

### [6.2.1](https://www.github.com/netlify/build/compare/config-v6.2.0...config-v6.2.1) (2021-04-26)


### Bug Fixes

* add some newlines before some warning message ([#2652](https://www.github.com/netlify/build/issues/2652)) ([fc96155](https://www.github.com/netlify/build/commit/fc96155d137fb9a772dda25586007d04a30bf448))
* **deps:** update dependency map-obj to v3.1.0 ([#2656](https://www.github.com/netlify/build/issues/2656)) ([89e497a](https://www.github.com/netlify/build/commit/89e497a37a892f203a601a510e0e24ae037ad146))
* missing colors in `@netlify/config` warnings ([#2651](https://www.github.com/netlify/build/issues/2651)) ([5133c2a](https://www.github.com/netlify/build/commit/5133c2a8c95af70b928b6f7b3e3de702b0570bd8))

## [6.2.0](https://www.github.com/netlify/build/compare/config-v6.1.0...config-v6.2.0) (2021-04-23)


### Features

* improve context-specific configuration validation ([#2648](https://www.github.com/netlify/build/issues/2648)) ([e5059f9](https://www.github.com/netlify/build/commit/e5059f999488e9833c129f4a26d10811e7541878))

## [6.1.0](https://www.github.com/netlify/build/compare/config-v6.0.3...config-v6.1.0) (2021-04-23)


### Features

* validate all contexts in configuration ([#2641](https://www.github.com/netlify/build/issues/2641)) ([447f21e](https://www.github.com/netlify/build/commit/447f21ed87079ef4b12a96e67ca55b4f2ba544b3))

### [6.0.3](https://www.github.com/netlify/build/compare/config-v6.0.2...config-v6.0.3) (2021-04-23)


### Bug Fixes

* support `main` branch in `@netlify/config` ([#2639](https://www.github.com/netlify/build/issues/2639)) ([7728c60](https://www.github.com/netlify/build/commit/7728c60aed1e7c3bf0bb7a95aeef8b6686ca7478))

### [6.0.2](https://www.github.com/netlify/build/compare/config-v6.0.1...config-v6.0.2) (2021-04-20)


### Bug Fixes

* **deps:** update netlify packages ([#2622](https://www.github.com/netlify/build/issues/2622)) ([4d35de4](https://www.github.com/netlify/build/commit/4d35de4d4d8d49b460080480c6e5b3610e6ef023))

### [6.0.1](https://www.github.com/netlify/build/compare/config-v6.0.0...config-v6.0.1) (2021-04-14)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.18 ([#2602](https://www.github.com/netlify/build/issues/2602)) ([c36356d](https://www.github.com/netlify/build/commit/c36356de80c4a19fb8ee808f074c9c9e827ebc07))

## [6.0.0](https://www.github.com/netlify/build/compare/config-v5.12.0...config-v6.0.0) (2021-04-14)


### ⚠ BREAKING CHANGES

* simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags (#2595)

### Features

* simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags ([#2595](https://www.github.com/netlify/build/issues/2595)) ([c272632](https://www.github.com/netlify/build/commit/c272632db8825f85c07bb05cd90eacb1c8ea2544))

## [5.12.0](https://www.github.com/netlify/build/compare/config-v5.11.1...config-v5.12.0) (2021-04-12)


### Features

* deep merge context-specific plugin config ([#2572](https://www.github.com/netlify/build/issues/2572)) ([0a29162](https://www.github.com/netlify/build/commit/0a2916234a14ef0f99f093c8c5cdde0727d0f09f))

### [5.11.1](https://www.github.com/netlify/build/compare/config-v5.11.0...config-v5.11.1) (2021-04-12)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.17 ([#2589](https://www.github.com/netlify/build/issues/2589)) ([925a1c4](https://www.github.com/netlify/build/commit/925a1c4613be2d96142caecda9dd452a0fd4f951))

## [5.11.0](https://www.github.com/netlify/build/compare/config-v5.10.0...config-v5.11.0) (2021-04-09)


### Features

* add a test related to context-specific plugins config ([#2570](https://www.github.com/netlify/build/issues/2570)) ([cb23b93](https://www.github.com/netlify/build/commit/cb23b938c32775ff852ce815bc3622b9c0cfcf5a))

## [5.10.0](https://www.github.com/netlify/build/compare/config-v5.9.0...config-v5.10.0) (2021-04-09)


### Features

* allow context-specific plugins configuration ([#2567](https://www.github.com/netlify/build/issues/2567)) ([dc3b462](https://www.github.com/netlify/build/commit/dc3b46223fe2d965d6a8fb479e41f65bc7c89478))

## [5.9.0](https://www.github.com/netlify/build/compare/config-v5.8.0...config-v5.9.0) (2021-04-08)


### Features

* move validation related to duplicated plugins configuration ([#2566](https://www.github.com/netlify/build/issues/2566)) ([df2e5d5](https://www.github.com/netlify/build/commit/df2e5d563397b90ec79982f264c851e9bd21b2c4))

## [5.8.0](https://www.github.com/netlify/build/compare/config-v5.7.0...config-v5.8.0) (2021-04-08)


### Features

* refactor configuration merge logic ([#2564](https://www.github.com/netlify/build/issues/2564)) ([06ea3fd](https://www.github.com/netlify/build/commit/06ea3fd438c25f8f372b4a111119e116f7d90f6d))

## [5.7.0](https://www.github.com/netlify/build/compare/config-v5.6.0...config-v5.7.0) (2021-04-08)


### Features

* refactor configuration merge logic ([#2561](https://www.github.com/netlify/build/issues/2561)) ([839d400](https://www.github.com/netlify/build/commit/839d4008dd3d515785bdff12174910902d242709))
* refactors how plugins configurations are currently merged ([#2562](https://www.github.com/netlify/build/issues/2562)) ([7276576](https://www.github.com/netlify/build/commit/7276576020d9bf133f1e50666a614c10e980be3b))

## [5.6.0](https://www.github.com/netlify/build/compare/config-v5.5.1...config-v5.6.0) (2021-04-08)


### Features

* improve how context-specific config are merged ([#2555](https://www.github.com/netlify/build/issues/2555)) ([a642a9d](https://www.github.com/netlify/build/commit/a642a9d36f24dc5c93e43304858007c524035b71))

### [5.5.1](https://www.github.com/netlify/build/compare/config-v5.5.0...config-v5.5.1) (2021-04-07)


### Bug Fixes

* context properties should not unset plugins ([#2558](https://www.github.com/netlify/build/issues/2558)) ([32be1bb](https://www.github.com/netlify/build/commit/32be1bb7d052d8e4a0b9bcbf9d5d0dbd428a8535))

## [5.5.0](https://www.github.com/netlify/build/compare/config-v5.4.0...config-v5.5.0) (2021-04-07)


### Features

* validate `context.{context}.*` properties ([#2551](https://www.github.com/netlify/build/issues/2551)) ([4559349](https://www.github.com/netlify/build/commit/45593491b6a053c0d256a169d4ff998187c533e9))

## [5.4.0](https://www.github.com/netlify/build/compare/config-v5.3.1...config-v5.4.0) (2021-04-07)


### Features

* refactor configuration property origins ([#2549](https://www.github.com/netlify/build/issues/2549)) ([b1d7c66](https://www.github.com/netlify/build/commit/b1d7c6623a16a62941ddd2f3d406657c4206b096))

### [5.3.1](https://www.github.com/netlify/build/compare/config-v5.3.0...config-v5.3.1) (2021-04-07)


### Bug Fixes

* improve config normalization logic ([#2547](https://www.github.com/netlify/build/issues/2547)) ([7945e0a](https://www.github.com/netlify/build/commit/7945e0ab496f48da006392646cf0512f6a564348))

## [5.3.0](https://www.github.com/netlify/build/compare/config-v5.2.0...config-v5.3.0) (2021-04-07)


### Features

* refactor how origin is added to context-specific configs ([#2545](https://www.github.com/netlify/build/issues/2545)) ([c3f45b2](https://www.github.com/netlify/build/commit/c3f45b288544200a6408a9af7bdfb955d45ebb81))

## [5.2.0](https://www.github.com/netlify/build/compare/config-v5.1.1...config-v5.2.0) (2021-04-07)


### Features

* refactor plugins[*].origin ([#2540](https://www.github.com/netlify/build/issues/2540)) ([43ad104](https://www.github.com/netlify/build/commit/43ad104928d707b864a6e667270d783ae4e5cbac))

### [5.1.1](https://www.github.com/netlify/build/compare/config-v5.1.0...config-v5.1.1) (2021-04-06)


### Bug Fixes

* validate build.command even when not used due to config merge ([#2541](https://www.github.com/netlify/build/issues/2541)) ([95c8e70](https://www.github.com/netlify/build/commit/95c8e7088c8956b34535548da4b2c7a3014ff37d))

## [5.1.0](https://www.github.com/netlify/build/compare/config-v5.0.1...config-v5.1.0) (2021-04-01)


### Features

* add functions config object to build output ([#2518](https://www.github.com/netlify/build/issues/2518)) ([280834c](https://www.github.com/netlify/build/commit/280834c079995ad3c3b5607f983198fba6b3ac13))

### [5.0.1](https://www.github.com/netlify/build/compare/config-v5.0.0...config-v5.0.1) (2021-04-01)


### Bug Fixes

* reinstate legacy build.functions property ([#2519](https://www.github.com/netlify/build/issues/2519)) ([488bea6](https://www.github.com/netlify/build/commit/488bea6f6a75aaf7bdd33b9c5d781b49f2316168))

## [5.0.0](https://www.github.com/netlify/build/compare/config-v4.3.0...config-v5.0.0) (2021-03-30)


### ⚠ BREAKING CHANGES

* add functions.directory property (#2496)

### Features

* add functions.directory property ([#2496](https://www.github.com/netlify/build/issues/2496)) ([d72b1d1](https://www.github.com/netlify/build/commit/d72b1d1fb91de3fa23310ed477a6658c5492aed0))

## [4.3.0](https://www.github.com/netlify/build/compare/v4.2.0...v4.3.0) (2021-03-23)


### Features

* add context support to the functions block ([#2447](https://www.github.com/netlify/build/issues/2447)) ([5813826](https://www.github.com/netlify/build/commit/581382662506b01695fcbedadc0ea4b7d19b7efc))

## [4.2.0](https://www.github.com/netlify/build/compare/v4.1.3...v4.2.0) (2021-03-18)


### Features

* add functions configuration API to @netlify/config ([#2390](https://www.github.com/netlify/build/issues/2390)) ([654d32e](https://www.github.com/netlify/build/commit/654d32eb49bea33816b1adde02f13f0843db9cdd))
* add functions.*.node_bundler config property ([#2430](https://www.github.com/netlify/build/issues/2430)) ([72bed60](https://www.github.com/netlify/build/commit/72bed606e4395a42861bf0f78c43eb81bcdcc326))

### [4.1.3](https://www.github.com/netlify/build/compare/v4.1.2...v4.1.3) (2021-03-12)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.16 ([#2399](https://www.github.com/netlify/build/issues/2399)) ([528d5b9](https://www.github.com/netlify/build/commit/528d5b99e09d38c414bb4daa7c906a72bdd83302))

### [4.1.2](https://www.github.com/netlify/build/compare/v4.1.1...v4.1.2) (2021-03-10)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.14 ([#2387](https://www.github.com/netlify/build/issues/2387)) ([d5886f1](https://www.github.com/netlify/build/commit/d5886f1537734af0abf06bd59d083ca16d6b49a5))

### [4.1.1](https://www.github.com/netlify/build/compare/v4.1.0...v4.1.1) (2021-03-09)


### Bug Fixes

* fix `host` option in `@netlify/config` ([#2379](https://www.github.com/netlify/build/issues/2379)) ([64d8386](https://www.github.com/netlify/build/commit/64d8386daf5f1f069ea95fb655a593b05f8f8107))

## [4.1.0](https://www.github.com/netlify/build/compare/v4.0.4...v4.1.0) (2021-03-08)


### Features

* allow passing Netlify API host to Netlify API client ([#2288](https://www.github.com/netlify/build/issues/2288)) ([5529b1d](https://www.github.com/netlify/build/commit/5529b1dc92eccb6a932f80b006e83acfa0034413))

### [4.0.4](https://www.github.com/netlify/build/compare/v4.0.3...v4.0.4) (2021-03-04)


### Bug Fixes

* **deps:** update netlify packages ([#2352](https://www.github.com/netlify/build/issues/2352)) ([c45bdc8](https://www.github.com/netlify/build/commit/c45bdc8e6165751b4294993426ff32e366f0c55a))

### [4.0.3](https://www.github.com/netlify/build/compare/v4.0.2...v4.0.3) (2021-03-03)


### Bug Fixes

* **deps:** update dependency netlify to ^6.1.11 ([#2343](https://www.github.com/netlify/build/issues/2343)) ([bafca4e](https://www.github.com/netlify/build/commit/bafca4e8d2d462c1816695483bc1e381cc199b33))

### [4.0.2](https://www.github.com/netlify/build/compare/v4.0.1...v4.0.2) (2021-02-18)


### Bug Fixes

* fix `files` in `package.json` with `npm@7` ([#2278](https://www.github.com/netlify/build/issues/2278)) ([e9df064](https://www.github.com/netlify/build/commit/e9df0645f3083a0bb141c8b5b6e474ed4e27dbe9))

### [4.0.1](https://www.github.com/netlify/build/compare/v4.0.0...v4.0.1) (2021-02-09)


### Bug Fixes

* **deps:** update dependency netlify to v6.1.7 ([#2261](https://www.github.com/netlify/build/issues/2261)) ([607c848](https://www.github.com/netlify/build/commit/607c84868af5db36e18c9a9160b4d5e811c22e3a))

## [4.0.0](https://www.github.com/netlify/build/compare/v3.1.2...v4.0.0) (2021-02-04)


### ⚠ BREAKING CHANGES

* use netlify/functions as the default functions directory (#2188)

### Features

* use netlify/functions as the default functions directory ([#2188](https://www.github.com/netlify/build/issues/2188)) ([84e1e07](https://www.github.com/netlify/build/commit/84e1e075b5efd7ca26ccaf2531511e7737d97f1f))

### [3.1.2](https://www.github.com/netlify/build/compare/v3.1.1...v3.1.2) (2021-02-02)


### Bug Fixes

* add SITE_ID and SITE_NAME env vars to local builds ([#2239](https://www.github.com/netlify/build/issues/2239)) ([113e4d2](https://www.github.com/netlify/build/commit/113e4d2c48e0264e48f391e5a7d219332d012fab))

### [3.1.1](https://www.github.com/netlify/build/compare/v3.1.0...v3.1.1) (2021-01-29)


### Bug Fixes

* **deps:** update dependency netlify to v6.1.5 ([#2225](https://www.github.com/netlify/build/issues/2225)) ([fec5c83](https://www.github.com/netlify/build/commit/fec5c83c12ebf7572aaf8756fdbec6e9fe1e3699))

## [3.1.0](https://www.github.com/netlify/build/compare/v3.0.5...v3.1.0) (2021-01-27)


### Features

* allow override of API URL ([#2190](https://www.github.com/netlify/build/issues/2190)) ([3e1be70](https://www.github.com/netlify/build/commit/3e1be7057ac9f217405b2cbe15f39e1ecd7496e6))

### [3.0.5](https://www.github.com/netlify/build/compare/v3.0.4...v3.0.5) (2021-01-27)


### Bug Fixes

* **deps:** update dependency netlify to v6.1.4 ([#2219](https://www.github.com/netlify/build/issues/2219)) ([3a75574](https://www.github.com/netlify/build/commit/3a7557400d46388aad42250f6d9751f1617f3cd0))

### [3.0.4](https://www.github.com/netlify/build/compare/v3.0.3...v3.0.4) (2021-01-25)


### Bug Fixes

* **deps:** update dependency netlify to v6.1.3 ([#2210](https://www.github.com/netlify/build/issues/2210)) ([b7c2c40](https://www.github.com/netlify/build/commit/b7c2c4049e9037cf855475543b13e33c32ceb4a6))

### [3.0.3](https://www.github.com/netlify/build/compare/v3.0.2...v3.0.3) (2021-01-25)


### Bug Fixes

* **deps:** update dependency netlify to v6.1.1 ([#2200](https://www.github.com/netlify/build/issues/2200)) ([930805e](https://www.github.com/netlify/build/commit/930805ec70cedbb08d58490c038ea9bcd8ecd35f))

### [3.0.2](https://www.github.com/netlify/build/compare/config-v3.0.1...v3.0.2) (2021-01-22)


### Bug Fixes

* **deps:** update dependency netlify to v6.1.0 ([#2194](https://www.github.com/netlify/build/issues/2194)) ([4b39e9c](https://www.github.com/netlify/build/commit/4b39e9c746c3a8cf1753bd66913883f2adff6ed8))
