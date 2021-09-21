# Changelog

### [18.11.1](https://www.github.com/netlify/build/compare/build-v18.11.0...build-v18.11.1) (2021-09-21)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.22.0 ([#3634](https://www.github.com/netlify/build/issues/3634)) ([e1175a3](https://www.github.com/netlify/build/commit/e1175a37c5d1af72bf3298a1060cfd1bf2d4cf07))

## [18.11.0](https://www.github.com/netlify/build/compare/build-v18.10.0...build-v18.11.0) (2021-09-20)


### Features

* **build:** pass ES module feature flag to zisi ([#3619](https://www.github.com/netlify/build/issues/3619)) ([5002fc4](https://www.github.com/netlify/build/commit/5002fc4ed0ec63ae89dbd2f43e21446097226afc))


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.21.1 ([#3633](https://www.github.com/netlify/build/issues/3633)) ([5f70b85](https://www.github.com/netlify/build/commit/5f70b850f470c18d8b015b0e150b598fe8c8a571))

## [18.10.0](https://www.github.com/netlify/build/compare/build-v18.9.1...build-v18.10.0) (2021-09-15)


### Features

* remove `netlify_build_warning_missing_headers` feature flag ([#3612](https://www.github.com/netlify/build/issues/3612)) ([fd255b0](https://www.github.com/netlify/build/commit/fd255b0029cc40b0bf99782228b9c78892c2b550))

### [18.9.1](https://www.github.com/netlify/build/compare/build-v18.9.0...build-v18.9.1) (2021-09-15)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.21.0 ([#3614](https://www.github.com/netlify/build/issues/3614)) ([541da43](https://www.github.com/netlify/build/commit/541da43fd57b1d0413a649d0b948c4f4ff7aba3d))

## [18.9.0](https://www.github.com/netlify/build/compare/build-v18.8.0...build-v18.9.0) (2021-09-14)


### Features

* warn when `_headers`/`_redirects` file is missing ([#3608](https://www.github.com/netlify/build/issues/3608)) ([254a03b](https://www.github.com/netlify/build/commit/254a03b17bbeed7bc14a27b3be384357c1f72216))

## [18.8.0](https://www.github.com/netlify/build/compare/build-v18.7.4...build-v18.8.0) (2021-09-07)


### Features

* remove `builders` and `buildersDistDir` ([#3581](https://www.github.com/netlify/build/issues/3581)) ([d27906b](https://www.github.com/netlify/build/commit/d27906bc1390dbeb6ebc64279ce7475d418a8514))

### [18.7.4](https://www.github.com/netlify/build/compare/build-v18.7.3...build-v18.7.4) (2021-09-06)


### Bug Fixes

* **deps:** update dependency got to v10 ([#3488](https://www.github.com/netlify/build/issues/3488)) ([6be8f2b](https://www.github.com/netlify/build/commit/6be8f2bd3b48c18c5ce58d1a2f2189c9c0c9b3c2))

### [18.7.3](https://www.github.com/netlify/build/compare/build-v18.7.2...build-v18.7.3) (2021-09-01)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^3.6.0 ([#3582](https://www.github.com/netlify/build/issues/3582)) ([a7bdb43](https://www.github.com/netlify/build/commit/a7bdb433242791fb3bb6bb4f32ce9c5c2eb0f907))
* error handling of syntax errors in plugin configuration changes ([#3586](https://www.github.com/netlify/build/issues/3586)) ([56d902d](https://www.github.com/netlify/build/commit/56d902d88353b5b836ca4124b94532fb744470fc))

### [18.7.2](https://www.github.com/netlify/build/compare/build-v18.7.1...build-v18.7.2) (2021-08-27)


### Bug Fixes

* internal functions directory ([#3564](https://www.github.com/netlify/build/issues/3564)) ([11144f4](https://www.github.com/netlify/build/commit/11144f4728147fe59a4ffef7e0fc18274e48d913))
* revert `utils.functions.add()` fix ([#3570](https://www.github.com/netlify/build/issues/3570)) ([4f247d1](https://www.github.com/netlify/build/commit/4f247d15c0e06783332736a98757eb575113123b))

### [18.7.1](https://www.github.com/netlify/build/compare/build-v18.7.0...build-v18.7.1) (2021-08-27)


### Bug Fixes

* file path resolution of `INTERNAL_BUILDERS_SRC` ([#3566](https://www.github.com/netlify/build/issues/3566)) ([2b614b2](https://www.github.com/netlify/build/commit/2b614b2fd5ed5bed7e753b6e16b90135033e2de3))

## [18.7.0](https://www.github.com/netlify/build/compare/build-v18.6.0...build-v18.7.0) (2021-08-27)


### Features

* add `builders` configuration to `@netlify/build` ([#3563](https://www.github.com/netlify/build/issues/3563)) ([daecb3b](https://www.github.com/netlify/build/commit/daecb3b2f95a690f9454ca8ab6e76d2d671ea574))

## [18.6.0](https://www.github.com/netlify/build/compare/build-v18.5.0...build-v18.6.0) (2021-08-26)


### Features

* add `builders.*` and `builders.directory` configuration properties to `@netlify/config` ([#3560](https://www.github.com/netlify/build/issues/3560)) ([4e9b757](https://www.github.com/netlify/build/commit/4e9b757efcdeec5477cd278ec57feb02dbe49248))

## [18.5.0](https://www.github.com/netlify/build/compare/build-v18.4.3...build-v18.5.0) (2021-08-24)


### Features

* add `--buildersDistDir` flag ([#3552](https://www.github.com/netlify/build/issues/3552)) ([49037dd](https://www.github.com/netlify/build/commit/49037dd01e29094255a11ae78ba330c0166348fe))

### [18.4.3](https://www.github.com/netlify/build/compare/build-v18.4.2...build-v18.4.3) (2021-08-24)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^3.4.0 ([#3544](https://www.github.com/netlify/build/issues/3544)) ([978f4d1](https://www.github.com/netlify/build/commit/978f4d19723cad958c3a293cc875bc8cf33c5692))
* **deps:** update dependency @netlify/plugins-list to ^3.5.0 ([#3546](https://www.github.com/netlify/build/issues/3546)) ([72c067a](https://www.github.com/netlify/build/commit/72c067a7eed0b2ccb0cdc6b1b34cb8618e4afef4))
* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.20.0 ([#3551](https://www.github.com/netlify/build/issues/3551)) ([fd2d891](https://www.github.com/netlify/build/commit/fd2d89196ad01882c396894d8f968310bb6bc172))

### [18.4.2](https://www.github.com/netlify/build/compare/build-v18.4.1...build-v18.4.2) (2021-08-20)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.19.0 ([#3535](https://www.github.com/netlify/build/issues/3535)) ([eb11110](https://www.github.com/netlify/build/commit/eb11110b9fc6a54f8f063b2db63c47757b2a3c11))

### [18.4.1](https://www.github.com/netlify/build/compare/build-v18.4.0...build-v18.4.1) (2021-08-19)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.18.0 ([#3530](https://www.github.com/netlify/build/issues/3530)) ([7addb52](https://www.github.com/netlify/build/commit/7addb5290e11065282dc91692ed0c4b5f66990d8))

## [18.4.0](https://www.github.com/netlify/build/compare/build-v18.3.0...build-v18.4.0) (2021-08-18)


### Features

* **build-id:** add a `build-id` flag and expose `BUILD_ID` based on said flag ([#3527](https://www.github.com/netlify/build/issues/3527)) ([94a4a03](https://www.github.com/netlify/build/commit/94a4a03f337d3c2195f4b4a1912f778893ebf485))

## [18.3.0](https://www.github.com/netlify/build/compare/build-v18.2.12...build-v18.3.0) (2021-08-18)


### Features

* **telemetry:** report both build and deploy ids ([#3520](https://www.github.com/netlify/build/issues/3520)) ([97e36bd](https://www.github.com/netlify/build/commit/97e36bd5c93753fb958ea3e9e7829a7ca3d1e54b))

### [18.2.12](https://www.github.com/netlify/build/compare/build-v18.2.11...build-v18.2.12) (2021-08-17)


### Bug Fixes

* **deps:** update dependency os-name to v5 ([#3493](https://www.github.com/netlify/build/issues/3493)) ([47b724b](https://www.github.com/netlify/build/commit/47b724b9a5c6b724356ccfc4106257c1fbe2a69e))

### [18.2.11](https://www.github.com/netlify/build/compare/build-v18.2.10...build-v18.2.11) (2021-08-17)


### Bug Fixes

* **deps:** update dependency log-process-errors to v6 ([#3491](https://www.github.com/netlify/build/issues/3491)) ([c7f1dd4](https://www.github.com/netlify/build/commit/c7f1dd4d4ded87e39cc97b3cb8f53e825e4b4f8b))

### [18.2.10](https://www.github.com/netlify/build/compare/build-v18.2.9...build-v18.2.10) (2021-08-16)


### Bug Fixes

* **deps:** update dependency is-plain-obj to v3 ([#3489](https://www.github.com/netlify/build/issues/3489)) ([b353eec](https://www.github.com/netlify/build/commit/b353eece861296ef18de8e19855a6b2e30ac4fba))
* **deps:** update dependency locate-path to v6 ([#3490](https://www.github.com/netlify/build/issues/3490)) ([523b049](https://www.github.com/netlify/build/commit/523b0496c90e4c80fcabd406022a2423b12d0a90))
* **deps:** update dependency pkg-dir to v5 ([#3497](https://www.github.com/netlify/build/issues/3497)) ([7a0ec32](https://www.github.com/netlify/build/commit/7a0ec3273e486956fae3be63c8808062569cee50))

### [18.2.9](https://www.github.com/netlify/build/compare/build-v18.2.8...build-v18.2.9) (2021-08-16)


### Bug Fixes

* **deps:** update dependency p-locate to v5 ([#3495](https://www.github.com/netlify/build/issues/3495)) ([ce07fbc](https://www.github.com/netlify/build/commit/ce07fbccc5e93224e7adab5dc039f9534a49f06b))
* **deps:** update dependency pretty-ms to v7 ([#3498](https://www.github.com/netlify/build/issues/3498)) ([435629a](https://www.github.com/netlify/build/commit/435629a8f2368582cc1b01b12298911ccb548a70))

### [18.2.8](https://www.github.com/netlify/build/compare/build-v18.2.7...build-v18.2.8) (2021-08-13)


### Bug Fixes

* **deps:** update dependency supports-color to v8 ([#3466](https://www.github.com/netlify/build/issues/3466)) ([2cdf370](https://www.github.com/netlify/build/commit/2cdf370a5347772ec6437b41679bec5eceb3311f))
* **deps:** update dependency update-notifier to v5 ([#3467](https://www.github.com/netlify/build/issues/3467)) ([d34a0d7](https://www.github.com/netlify/build/commit/d34a0d76721d551d1a3bf6dc8a77ea123c92b3e5))
* rely on `package.engines.node` for plugin version support instead of a hardcoded var ([#3474](https://www.github.com/netlify/build/issues/3474)) ([3c8c7b2](https://www.github.com/netlify/build/commit/3c8c7b2714f65755ec14ca2d19396a7f6836ca66))
* **utils:** remove condition around `require.resolve` invocation ([#3480](https://www.github.com/netlify/build/issues/3480)) ([f29d7c1](https://www.github.com/netlify/build/commit/f29d7c1badd2467fef8d13920d1199e7988abde2))

### [18.2.7](https://www.github.com/netlify/build/compare/build-v18.2.6...build-v18.2.7) (2021-08-13)


### Bug Fixes

* **deps:** update dependency ps-list to v7 ([#3465](https://www.github.com/netlify/build/issues/3465)) ([05398cc](https://www.github.com/netlify/build/commit/05398ccb97c986e4c7ec88df4ac108c8ec17142c))

### [18.2.6](https://www.github.com/netlify/build/compare/build-v18.2.5...build-v18.2.6) (2021-08-13)


### Bug Fixes

* **deps:** remove cp-file usage ([#3470](https://www.github.com/netlify/build/issues/3470)) ([5b98fb4](https://www.github.com/netlify/build/commit/5b98fb494478cc0e7676856ce38f980b406306b9))

### [18.2.5](https://www.github.com/netlify/build/compare/build-v18.2.4...build-v18.2.5) (2021-08-13)


### Bug Fixes

* **deps:** update dependency get-stream to v6 ([#3456](https://www.github.com/netlify/build/issues/3456)) ([478a039](https://www.github.com/netlify/build/commit/478a03946579729a5796eb1a395389eafcc9168e))

### [18.2.4](https://www.github.com/netlify/build/compare/build-v18.2.3...build-v18.2.4) (2021-08-12)


### Bug Fixes

* **deps:** update dependency netlify-headers-parser to v2 ([#3448](https://www.github.com/netlify/build/issues/3448)) ([3d83dce](https://www.github.com/netlify/build/commit/3d83dce6efa68df5ef090e57958eff6f78c8f065))

### [18.2.3](https://www.github.com/netlify/build/compare/build-v18.2.2...build-v18.2.3) (2021-08-12)


### Bug Fixes

* delete `_redirects`/`_headers` when persisted to `netlify.toml` ([#3446](https://www.github.com/netlify/build/issues/3446)) ([4bdf2cc](https://www.github.com/netlify/build/commit/4bdf2ccb64edae4254a9b7832f46e2cbeeb322eb))

### [18.2.2](https://www.github.com/netlify/build/compare/build-v18.2.1...build-v18.2.2) (2021-08-12)


### Bug Fixes

* **deps:** bump execa to the latest version (5.x) ([#3440](https://www.github.com/netlify/build/issues/3440)) ([3e8bd01](https://www.github.com/netlify/build/commit/3e8bd019eddca738a664af9590c313dd5fcd20df))

### [18.2.1](https://www.github.com/netlify/build/compare/build-v18.2.0...build-v18.2.1) (2021-08-12)


### Bug Fixes

* avoid debug mode to be too verbose ([#3437](https://www.github.com/netlify/build/issues/3437)) ([23dc159](https://www.github.com/netlify/build/commit/23dc1591d8a2de3ffb2b2e1f54e5068ea361c681))

## [18.2.0](https://www.github.com/netlify/build/compare/build-v18.1.0...build-v18.2.0) (2021-08-12)


### Features

* improve warning messages shown with invalid redirects/headers ([#3426](https://www.github.com/netlify/build/issues/3426)) ([6eb42ce](https://www.github.com/netlify/build/commit/6eb42ced66873e3bd95226d6ad6937cdb71536d6))

## [18.1.0](https://www.github.com/netlify/build/compare/build-v18.0.3...build-v18.1.0) (2021-08-12)


### Features

* remove some double newlines in the build logs ([#3425](https://www.github.com/netlify/build/issues/3425)) ([d17af96](https://www.github.com/netlify/build/commit/d17af96445a142aeb57256af33cbe854ead93a6d))

### [18.0.3](https://www.github.com/netlify/build/compare/build-v18.0.2...build-v18.0.3) (2021-08-12)


### Bug Fixes

* **deps:** bump clean-stack to 3.x ([#3429](https://www.github.com/netlify/build/issues/3429)) ([eb94887](https://www.github.com/netlify/build/commit/eb94887298428ca27c28131439cfaf5284f609f8))

### [18.0.2](https://www.github.com/netlify/build/compare/build-v18.0.1...build-v18.0.2) (2021-08-11)


### Bug Fixes

* error handling of headers and redirects ([#3422](https://www.github.com/netlify/build/issues/3422)) ([add5417](https://www.github.com/netlify/build/commit/add54178e5b046d6ec8d7cc44ac626135a25b9e6))

### [18.0.1](https://www.github.com/netlify/build/compare/build-v18.0.0...build-v18.0.1) (2021-08-11)


### Bug Fixes

* `@netlify/config` upgrade ([bd118ed](https://www.github.com/netlify/build/commit/bd118edfd083bdae19da984cb78e2a7a35335d3e))

## [18.0.0](https://www.github.com/netlify/build/compare/build-v17.11.0...build-v18.0.0) (2021-08-11)


### ⚠ BREAKING CHANGES

* add `netlifyConfig.headers` (#3407)

### Features

* add `netlifyConfig.headers` ([#3407](https://www.github.com/netlify/build/issues/3407)) ([14888c7](https://www.github.com/netlify/build/commit/14888c73278b6c68538ecaa385e5ce01932b7e09))

## [17.11.0](https://www.github.com/netlify/build/compare/build-v17.10.0...build-v17.11.0) (2021-08-11)


### Features

* pass `rustTargetDirectory` to ZISI ([#3411](https://www.github.com/netlify/build/issues/3411)) ([0287d22](https://www.github.com/netlify/build/commit/0287d221d804f0cbe5036ce7d170c3f7271a32b3))

## [17.10.0](https://www.github.com/netlify/build/compare/build-v17.9.2...build-v17.10.0) (2021-08-10)


### Features

* fix log messages related to redirects upload ([#3412](https://www.github.com/netlify/build/issues/3412)) ([8a2fcc1](https://www.github.com/netlify/build/commit/8a2fcc1eb87430f3bcb5f6cfa8a7a87d952a089e))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^3.3.0 ([#3405](https://www.github.com/netlify/build/issues/3405)) ([64e3a62](https://www.github.com/netlify/build/commit/64e3a626881f2116a5c27571fb5110f35035c508))
* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.17.0 ([#3409](https://www.github.com/netlify/build/issues/3409)) ([6942dcd](https://www.github.com/netlify/build/commit/6942dcd83b7908710e994b39b5ef4323cf88f039))

### [17.9.2](https://www.github.com/netlify/build/compare/build-v17.9.1...build-v17.9.2) (2021-08-05)


### Bug Fixes

* **deps:** update dependency netlify-redirect-parser to ^8.2.0 ([#3399](https://www.github.com/netlify/build/issues/3399)) ([70911c9](https://www.github.com/netlify/build/commit/70911c91729d02475684b179febe9b07e23df293))

### [17.9.1](https://www.github.com/netlify/build/compare/build-v17.9.0...build-v17.9.1) (2021-08-05)


### Bug Fixes

* `redirects[*].status` should not be a float in `netlify.toml` ([#3396](https://www.github.com/netlify/build/issues/3396)) ([1c006ea](https://www.github.com/netlify/build/commit/1c006eae3de54e034dbcd87de5e011b6bfa843e6))

## [17.9.0](https://www.github.com/netlify/build/compare/build-v17.8.0...build-v17.9.0) (2021-08-04)


### Features

* allow modifying `build.environment` ([#3389](https://www.github.com/netlify/build/issues/3389)) ([76d3bc9](https://www.github.com/netlify/build/commit/76d3bc9c77e28cf500ada47289c01d394d6da6db))
* do not log modified `build.environment` ([#3392](https://www.github.com/netlify/build/issues/3392)) ([cb734f3](https://www.github.com/netlify/build/commit/cb734f372279ad15472b0de7e04a8dda417925e3))
* update environment variables with `netlifyConfig.build.environment` ([#3393](https://www.github.com/netlify/build/issues/3393)) ([9ef37af](https://www.github.com/netlify/build/commit/9ef37af440df8701917f68e70d104b117b8ae5c5))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^3.2.1 ([#3390](https://www.github.com/netlify/build/issues/3390)) ([32da36a](https://www.github.com/netlify/build/commit/32da36ad02c8e33ffcfb18a6c867be702fa858af))

## [17.8.0](https://www.github.com/netlify/build/compare/build-v17.7.1...build-v17.8.0) (2021-08-03)


### Features

* improve config simplification ([#3384](https://www.github.com/netlify/build/issues/3384)) ([b9f7d7a](https://www.github.com/netlify/build/commit/b9f7d7ad1baf063bd3919a16b961007cb94da2e2))

### [17.7.1](https://www.github.com/netlify/build/compare/build-v17.7.0...build-v17.7.1) (2021-08-03)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^3.2.0 ([#3381](https://www.github.com/netlify/build/issues/3381)) ([b02dc7f](https://www.github.com/netlify/build/commit/b02dc7fd3fec933be3ca204508a4906a78e22b94))

## [17.7.0](https://www.github.com/netlify/build/compare/build-v17.6.0...build-v17.7.0) (2021-08-03)


### Features

* enable functions bundling manifest ([#3378](https://www.github.com/netlify/build/issues/3378)) ([c03c4ac](https://www.github.com/netlify/build/commit/c03c4ac64f79020d732488014f4cb337cb6363a7))

## [17.6.0](https://www.github.com/netlify/build/compare/build-v17.5.0...build-v17.6.0) (2021-08-03)


### Features

* **build:** return config mutations ([#3379](https://www.github.com/netlify/build/issues/3379)) ([8eb39b5](https://www.github.com/netlify/build/commit/8eb39b5ee3fae124498f87046a7776ad5574e011))

## [17.5.0](https://www.github.com/netlify/build/compare/build-v17.4.4...build-v17.5.0) (2021-08-02)


### Features

* re-add support for feature-flagging plugin versions ([#3373](https://www.github.com/netlify/build/issues/3373)) ([85b739c](https://www.github.com/netlify/build/commit/85b739c0b48d36c76429f02ddcc32e5c3c51e28d))

### [17.4.4](https://www.github.com/netlify/build/compare/build-v17.4.3...build-v17.4.4) (2021-08-02)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.16.0 ([#3375](https://www.github.com/netlify/build/issues/3375)) ([4d1c90d](https://www.github.com/netlify/build/commit/4d1c90d5218c8d60373a50043ac6cfa6bda1aa9e))

### [17.4.3](https://www.github.com/netlify/build/compare/build-v17.4.2...build-v17.4.3) (2021-08-02)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to v3 ([#3372](https://www.github.com/netlify/build/issues/3372)) ([c911b2d](https://www.github.com/netlify/build/commit/c911b2d3c02dddaf38183cc9499a0b0d976723da))

### [17.4.2](https://www.github.com/netlify/build/compare/build-v17.4.1...build-v17.4.2) (2021-08-02)


### Bug Fixes

* **deps:** update dependency chalk to ^4.1.1 ([#3367](https://www.github.com/netlify/build/issues/3367)) ([dd258ec](https://www.github.com/netlify/build/commit/dd258ecd758824e56b15fc5f6c73a3180ac0af66))

### [17.4.1](https://www.github.com/netlify/build/compare/build-v17.4.0...build-v17.4.1) (2021-07-30)


### Bug Fixes

* `deployDir` parameter sent to buildbot during deploys ([#3363](https://www.github.com/netlify/build/issues/3363)) ([5c39e70](https://www.github.com/netlify/build/commit/5c39e70c3a5b8ceecad448593b1095c093b093ff))

## [17.4.0](https://www.github.com/netlify/build/compare/build-v17.3.1...build-v17.4.0) (2021-07-30)


### Features

* allow adding new properties to `compatibility` ([#3361](https://www.github.com/netlify/build/issues/3361)) ([24d1541](https://www.github.com/netlify/build/commit/24d15419e64b5d7b291b154fd9363660e468416d))

### [17.3.1](https://www.github.com/netlify/build/compare/build-v17.3.0...build-v17.3.1) (2021-07-29)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.21.0 ([#3359](https://www.github.com/netlify/build/issues/3359)) ([2b34de5](https://www.github.com/netlify/build/commit/2b34de56e7561c915c840c9070ad0fe6edbcfe2c))
* update `plugins.json` version ([#3358](https://www.github.com/netlify/build/issues/3358)) ([511da72](https://www.github.com/netlify/build/commit/511da7264f0369aebec0e5cc975164d04c736a83))

## [17.3.0](https://www.github.com/netlify/build/compare/build-v17.2.0...build-v17.3.0) (2021-07-29)


### Features

* add versioning to `plugins.json` ([#3355](https://www.github.com/netlify/build/issues/3355)) ([034ac01](https://www.github.com/netlify/build/commit/034ac0106327c2aeccc6b3358e1d3e0b25c48af5))

## [17.2.0](https://www.github.com/netlify/build/compare/build-v17.1.1...build-v17.2.0) (2021-07-28)


### Features

* add `NETLIFY_LOCAL` environment variable ([#3351](https://www.github.com/netlify/build/issues/3351)) ([c3c0716](https://www.github.com/netlify/build/commit/c3c07169ba922010d7233de868a52b6ccd6bcd20))

### [17.1.1](https://www.github.com/netlify/build/compare/build-v17.1.0...build-v17.1.1) (2021-07-27)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.15.1 ([#3344](https://www.github.com/netlify/build/issues/3344)) ([9d9d52f](https://www.github.com/netlify/build/commit/9d9d52f8974a8af298dce47b089bb3c2ba3374ac))

## [17.1.0](https://www.github.com/netlify/build/compare/build-v17.0.1...build-v17.1.0) (2021-07-27)


### Features

* **telemetry:** report the framework provided ([#3328](https://www.github.com/netlify/build/issues/3328)) ([bc64b5c](https://www.github.com/netlify/build/commit/bc64b5c163ef8a4b303fa6e44491cc250a6092c8))

### [17.0.1](https://www.github.com/netlify/build/compare/build-v17.0.0...build-v17.0.1) (2021-07-27)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.15.0 ([#3340](https://www.github.com/netlify/build/issues/3340)) ([3bd2099](https://www.github.com/netlify/build/commit/3bd2099526ba17c351af27d91241d37667caae6b))

## [17.0.0](https://www.github.com/netlify/build/compare/build-v16.2.1...build-v17.0.0) (2021-07-26)


### ⚠ BREAKING CHANGES

* deprecate Node 8 (#3322)

### Features

* **deps:** bump @netlify/*-utils and @netlify/config to latest ([d57c7c3](https://www.github.com/netlify/build/commit/d57c7c3cadb79b96f6e96052fbd261b2a1e77f41))


### Miscellaneous Chores

* deprecate Node 8 ([#3322](https://www.github.com/netlify/build/issues/3322)) ([9cc108a](https://www.github.com/netlify/build/commit/9cc108aab825558204ffef6b8034f456d8d11879))

### [16.2.1](https://www.github.com/netlify/build/compare/build-v16.2.0...build-v16.2.1) (2021-07-23)


### Bug Fixes

* allow functions directory to be a symlink ([#3326](https://www.github.com/netlify/build/issues/3326)) ([1b98e50](https://www.github.com/netlify/build/commit/1b98e50c8bedc1a15855ab5ede42b8f5305ef263))

## [16.2.0](https://www.github.com/netlify/build/compare/build-v16.1.1...build-v16.2.0) (2021-07-22)


### Features

* add support for feature-flagging plugin versions ([#3304](https://www.github.com/netlify/build/issues/3304)) ([157c03c](https://www.github.com/netlify/build/commit/157c03c70ab33ffd4ecc659b3437a113009729dd))
* **plugins:** remove feature flag responsible plugin node version execution changes ([#3311](https://www.github.com/netlify/build/issues/3311)) ([8c94faf](https://www.github.com/netlify/build/commit/8c94faf8d1e7cbf830b1cbc722949198759f9f8c))


### Bug Fixes

* revert "feat: add support for feature-flagging plugin versions ([#3304](https://www.github.com/netlify/build/issues/3304))" ([#3318](https://www.github.com/netlify/build/issues/3318)) ([226ff8e](https://www.github.com/netlify/build/commit/226ff8ead52642961bdba8c0f445879e67b2bbaf))

### [16.1.1](https://www.github.com/netlify/build/compare/build-v16.1.0...build-v16.1.1) (2021-07-22)


### Bug Fixes

* bundle functions from internal directory if configured user dire… ([#3314](https://www.github.com/netlify/build/issues/3314)) ([b58afc3](https://www.github.com/netlify/build/commit/b58afc31fdfe4c412605e11b2f9261d2ed412c93))

## [16.1.0](https://www.github.com/netlify/build/compare/build-v16.0.1...build-v16.1.0) (2021-07-21)


### Features

* bundle functions from `.netlify/functions-internal` ([#3213](https://www.github.com/netlify/build/issues/3213)) ([9ff3b9c](https://www.github.com/netlify/build/commit/9ff3b9cec1008a117bc687ba5a55d0fb8aecd91a))

### [16.0.1](https://www.github.com/netlify/build/compare/build-v16.0.0...build-v16.0.1) (2021-07-20)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.22 ([#3306](https://www.github.com/netlify/build/issues/3306)) ([a21dc85](https://www.github.com/netlify/build/commit/a21dc85cc3575572dfbe151d518336f88a6f7be9))

## [16.0.0](https://www.github.com/netlify/build/compare/build-v15.11.5...build-v16.0.0) (2021-07-19)


### ⚠ BREAKING CHANGES

* change edge-handler default directory (#3296)

### Features

* change edge-handler default directory ([#3296](https://www.github.com/netlify/build/issues/3296)) ([86b02da](https://www.github.com/netlify/build/commit/86b02dae85bbd879f107606487853ad3cd2fc147))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.19.3 ([#3297](https://www.github.com/netlify/build/issues/3297)) ([1a9d614](https://www.github.com/netlify/build/commit/1a9d614dae066568017c882719379ceccf8118eb))

### [15.11.5](https://www.github.com/netlify/build/compare/build-v15.11.4...build-v15.11.5) (2021-07-15)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.14.0 ([#3293](https://www.github.com/netlify/build/issues/3293)) ([a371a0d](https://www.github.com/netlify/build/commit/a371a0dbdb3a7c8a05674ab9d6255635cd63d727))

### [15.11.4](https://www.github.com/netlify/build/compare/build-v15.11.3...build-v15.11.4) (2021-07-14)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.13.1 ([#3288](https://www.github.com/netlify/build/issues/3288)) ([f5e5b6b](https://www.github.com/netlify/build/commit/f5e5b6ba91a8ad9e95d4dea5c18078a8e334313a))

### [15.11.3](https://www.github.com/netlify/build/compare/build-v15.11.2...build-v15.11.3) (2021-07-14)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.19.2 ([#3286](https://www.github.com/netlify/build/issues/3286)) ([23b323d](https://www.github.com/netlify/build/commit/23b323db25e444307c382e20b807f17fb4126d8d))

### [15.11.2](https://www.github.com/netlify/build/compare/build-v15.11.1...build-v15.11.2) (2021-07-12)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.13.0 ([#3280](https://www.github.com/netlify/build/issues/3280)) ([8249fe1](https://www.github.com/netlify/build/commit/8249fe19d1edab64fad2362757d59d33fabe18c2))

### [15.11.1](https://www.github.com/netlify/build/compare/build-v15.11.0...build-v15.11.1) (2021-07-12)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.21 ([#3278](https://www.github.com/netlify/build/issues/3278)) ([556706f](https://www.github.com/netlify/build/commit/556706f67688ad804e7a0694df549e7f46255c6f))

## [15.11.0](https://www.github.com/netlify/build/compare/build-v15.10.0...build-v15.11.0) (2021-07-08)


### Features

* delete `netlify.toml` after deploy if it was created due to configuration changes ([#3271](https://www.github.com/netlify/build/issues/3271)) ([444087d](https://www.github.com/netlify/build/commit/444087d528a0e8450031eda65cd5877980a5fa70))

## [15.10.0](https://www.github.com/netlify/build/compare/build-v15.9.0...build-v15.10.0) (2021-07-08)


### Features

* simplify the `netlify.toml` being saved on configuration changes ([#3268](https://www.github.com/netlify/build/issues/3268)) ([15987fe](https://www.github.com/netlify/build/commit/15987fe0d869f01110d4d97c8e8395580eb1a9f7))

## [15.9.0](https://www.github.com/netlify/build/compare/build-v15.8.0...build-v15.9.0) (2021-07-08)


### Features

* restore `netlify.toml` and `_redirects` after deploy ([#3265](https://www.github.com/netlify/build/issues/3265)) ([2441d6a](https://www.github.com/netlify/build/commit/2441d6a8b2be81212384816a0686221d4a6a2577))

## [15.8.0](https://www.github.com/netlify/build/compare/build-v15.7.0...build-v15.8.0) (2021-07-08)


### Features

* add debug logs to deploys ([#3262](https://www.github.com/netlify/build/issues/3262)) ([5748f92](https://www.github.com/netlify/build/commit/5748f92fa82efd0a892f45a015f39a03dbf41159))

## [15.7.0](https://www.github.com/netlify/build/compare/build-v15.6.0...build-v15.7.0) (2021-07-08)


### Features

* fix `_redirects` to `netlify.toml` before deploy ([#3259](https://www.github.com/netlify/build/issues/3259)) ([e32d076](https://www.github.com/netlify/build/commit/e32d076ab642b8a0df72c96d8726e161b65b182f))

## [15.6.0](https://www.github.com/netlify/build/compare/build-v15.5.0...build-v15.6.0) (2021-07-08)


### Features

* use a diff instead of a Proxy for configuration mutations ([#3254](https://www.github.com/netlify/build/issues/3254)) ([ae7f36e](https://www.github.com/netlify/build/commit/ae7f36e03fe84a512007694654cbfeb3b12c2cf3))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.19.1 ([#3255](https://www.github.com/netlify/build/issues/3255)) ([a1db0b0](https://www.github.com/netlify/build/commit/a1db0b035bfe50d2852746ed34214641a02d94f1))

## [15.5.0](https://www.github.com/netlify/build/compare/build-v15.4.0...build-v15.5.0) (2021-07-08)


### Features

* move configMutations validation logic ([#3252](https://www.github.com/netlify/build/issues/3252)) ([db11947](https://www.github.com/netlify/build/commit/db119472d6f8105409ac8b560bd51a140b84226d))

## [15.4.0](https://www.github.com/netlify/build/compare/build-v15.3.1...build-v15.4.0) (2021-07-08)


### Features

* do not validate against `preventExtensions()` nor `setPrototypeOf()` ([#3250](https://www.github.com/netlify/build/issues/3250)) ([6fed537](https://www.github.com/netlify/build/commit/6fed537e071617f7f6acbe84b8fb98d39f7e2677))
* move configMutations logging logic ([#3249](https://www.github.com/netlify/build/issues/3249)) ([8764874](https://www.github.com/netlify/build/commit/8764874f09b82a336700366b0fca6407a1dacb8c))

### [15.3.1](https://www.github.com/netlify/build/compare/build-v15.3.0...build-v15.3.1) (2021-07-08)


### Bug Fixes

* allow `netlifyConfig.redirects` to be modified before `_redirects` is added ([#3242](https://www.github.com/netlify/build/issues/3242)) ([f3330a6](https://www.github.com/netlify/build/commit/f3330a685aeb0320e1ac445bbe7a908e7a83dbda))

## [15.3.0](https://www.github.com/netlify/build/compare/build-v15.2.2...build-v15.3.0) (2021-07-08)


### Features

* add default values for `build.processing` and `build.services` ([#3235](https://www.github.com/netlify/build/issues/3235)) ([2ba263b](https://www.github.com/netlify/build/commit/2ba263ba9ebc54c38410245f021deb906b8a8aa2))

### [15.2.2](https://www.github.com/netlify/build/compare/build-v15.2.1...build-v15.2.2) (2021-07-07)


### Bug Fixes

* save the `netlify.toml` earlier ([#3233](https://www.github.com/netlify/build/issues/3233)) ([d4bfb25](https://www.github.com/netlify/build/commit/d4bfb25e362ebf3aea0ba2830d79cfc178b355a9))

### [15.2.1](https://www.github.com/netlify/build/compare/build-v15.2.0...build-v15.2.1) (2021-07-07)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.12.0 ([#3228](https://www.github.com/netlify/build/issues/3228)) ([3c8a3c6](https://www.github.com/netlify/build/commit/3c8a3c6a4a0e3a29f984739613b6f823b1d7f38c))

## [15.2.0](https://www.github.com/netlify/build/compare/build-v15.1.0...build-v15.2.0) (2021-07-07)


### Features

* persist configuration changes to `netlify.toml` ([#3224](https://www.github.com/netlify/build/issues/3224)) ([f924661](https://www.github.com/netlify/build/commit/f924661f94d04af1e90e1023e385e35587ae301c))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.19.0 ([#3227](https://www.github.com/netlify/build/issues/3227)) ([571bcb4](https://www.github.com/netlify/build/commit/571bcb4821faece491c9f1b7392a364317e3d571))

## [15.1.0](https://www.github.com/netlify/build/compare/build-v15.0.0...build-v15.1.0) (2021-07-06)


### Features

* fix the payload sent during deploy to the buildbot ([#3218](https://www.github.com/netlify/build/issues/3218)) ([55d5fc4](https://www.github.com/netlify/build/commit/55d5fc4a71d7d7055a679371ff588d9e6c2ea200))

## [15.0.0](https://www.github.com/netlify/build/compare/build-v14.0.0...build-v15.0.0) (2021-07-06)


### ⚠ BREAKING CHANGES

* return `redirectsPath` from `@netlify/config` (#3207)

### Features

* return `redirectsPath` from `@netlify/config` ([#3207](https://www.github.com/netlify/build/issues/3207)) ([35dd205](https://www.github.com/netlify/build/commit/35dd205ca35a393dbb3cff50e79ba1cdad8f8755))

## [14.0.0](https://www.github.com/netlify/build/compare/build-v13.3.1...build-v14.0.0) (2021-07-06)


### ⚠ BREAKING CHANGES

* add `configMutations` flag to `@netlify/config` (#3211)

### Features

* add `configMutations` flag to `@netlify/config` ([#3211](https://www.github.com/netlify/build/issues/3211)) ([9037f03](https://www.github.com/netlify/build/commit/9037f03b6d288d136007f0c2c964c04aed3f33f7))

### [13.3.1](https://www.github.com/netlify/build/compare/build-v13.3.0...build-v13.3.1) (2021-07-06)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.11.0 ([#3202](https://www.github.com/netlify/build/issues/3202)) ([37df6bd](https://www.github.com/netlify/build/commit/37df6bd5ce55e3176f336285e3b17b9982d8f2f2))

## [13.3.0](https://www.github.com/netlify/build/compare/build-v13.2.0...build-v13.3.0) (2021-07-05)


### Features

* move some mutation logic to `@netlify/config` ([#3203](https://www.github.com/netlify/build/issues/3203)) ([9ce4725](https://www.github.com/netlify/build/commit/9ce47250e806379db93528913c298bc57f3d23a6))

## [13.2.0](https://www.github.com/netlify/build/compare/build-v13.1.0...build-v13.2.0) (2021-07-05)


### Features

* allow mutating `edge_handlers` in plugins ([#3200](https://www.github.com/netlify/build/issues/3200)) ([896b795](https://www.github.com/netlify/build/commit/896b795e4f97186c35d76f60cbd012bf76d1d31e))

## [13.1.0](https://www.github.com/netlify/build/compare/build-v13.0.0...build-v13.1.0) (2021-07-05)


### Features

* improve `functions` configuration logic ([#3175](https://www.github.com/netlify/build/issues/3175)) ([7085d77](https://www.github.com/netlify/build/commit/7085d7720191c399d8fd9d560ce30a76b483e30a))

## [13.0.0](https://www.github.com/netlify/build/compare/build-v12.28.0...build-v13.0.0) (2021-07-05)


### ⚠ BREAKING CHANGES

* merge `priorityConfig` with `inlineConfig` (#3193)

### Features

* merge `priorityConfig` with `inlineConfig` ([#3193](https://www.github.com/netlify/build/issues/3193)) ([35989ef](https://www.github.com/netlify/build/commit/35989ef8fe8196c1da2d36c2f73e4ff82efba6c5))

## [12.28.0](https://www.github.com/netlify/build/compare/build-v12.27.0...build-v12.28.0) (2021-07-05)


### Features

* change `origin` of `inlineConfig` and `priorityConfig` ([#3190](https://www.github.com/netlify/build/issues/3190)) ([5ea2439](https://www.github.com/netlify/build/commit/5ea2439ae8f7de11ba15059820466456ee8df196))

## [12.27.0](https://www.github.com/netlify/build/compare/build-v12.26.1...build-v12.27.0) (2021-07-05)


### Features

* change how `priorityConfig` interacts with contexts ([#3187](https://www.github.com/netlify/build/issues/3187)) ([736c269](https://www.github.com/netlify/build/commit/736c26993385173e37110b8e26c2cf389344de3e))

### [12.26.1](https://www.github.com/netlify/build/compare/build-v12.26.0...build-v12.26.1) (2021-07-05)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.20 ([#3182](https://www.github.com/netlify/build/issues/3182)) ([0c19650](https://www.github.com/netlify/build/commit/0c19650bd88be78ba291dd19d9e800dbf08db1aa))
* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.9.0 ([#3181](https://www.github.com/netlify/build/issues/3181)) ([1d733f6](https://www.github.com/netlify/build/commit/1d733f69f30db1e06722c1e0b7cd167e1e8ddad9))

## [12.26.0](https://www.github.com/netlify/build/compare/build-v12.25.0...build-v12.26.0) (2021-07-01)


### Features

* detect when build command adds `_redirects` file ([#3171](https://www.github.com/netlify/build/issues/3171)) ([ddf93d5](https://www.github.com/netlify/build/commit/ddf93d5dea00f5f86320be8eb353b75853ba1409))

## [12.25.0](https://www.github.com/netlify/build/compare/build-v12.24.0...build-v12.25.0) (2021-07-01)


### Features

* allow mutating more configuration properties ([#3163](https://www.github.com/netlify/build/issues/3163)) ([7357fa8](https://www.github.com/netlify/build/commit/7357fa89cd2824e03ae3c1fe654537f4218d4f52))

## [12.24.0](https://www.github.com/netlify/build/compare/build-v12.23.0...build-v12.24.0) (2021-07-01)


### Features

* detect when `_redirects` are created during builds ([#3168](https://www.github.com/netlify/build/issues/3168)) ([82746f4](https://www.github.com/netlify/build/commit/82746f48c21817c41228d782db6266226cb02ba2))

## [12.23.0](https://www.github.com/netlify/build/compare/build-v12.22.0...build-v12.23.0) (2021-07-01)


### Features

* reduce verbose logs when changing `netlifyConfig` ([#3167](https://www.github.com/netlify/build/issues/3167)) ([6f3413d](https://www.github.com/netlify/build/commit/6f3413ded8c06da9a81425ee5de0f3208983d64a))

## [12.22.0](https://www.github.com/netlify/build/compare/build-v12.21.0...build-v12.22.0) (2021-07-01)


### Features

* log updated config when changed, in debug mode ([#3162](https://www.github.com/netlify/build/issues/3162)) ([83c53f8](https://www.github.com/netlify/build/commit/83c53f89d9da42e029f5f23c3b62c3e55a60c5e5))

## [12.21.0](https://www.github.com/netlify/build/compare/build-v12.20.0...build-v12.21.0) (2021-07-01)


### Features

* allow array configuration property to be modified ([#3161](https://www.github.com/netlify/build/issues/3161)) ([f4f2982](https://www.github.com/netlify/build/commit/f4f298207d27ca00c785fc0e4b4837258c1db8ff))

## [12.20.0](https://www.github.com/netlify/build/compare/build-v12.19.1...build-v12.20.0) (2021-06-30)


### Features

* allow plugins to unset configuration properties ([#3158](https://www.github.com/netlify/build/issues/3158)) ([64e1235](https://www.github.com/netlify/build/commit/64e1235079356f5936638cde812a17027e627b9f))

### [12.19.1](https://www.github.com/netlify/build/compare/build-v12.19.0...build-v12.19.1) (2021-06-30)


### Bug Fixes

* **plugins:** only rely in the system node version for plugins running Node <10 ([#3144](https://www.github.com/netlify/build/issues/3144)) ([74bbff2](https://www.github.com/netlify/build/commit/74bbff231ec49277a1900b1ac19c2390094a1d0f))

## [12.19.0](https://www.github.com/netlify/build/compare/build-v12.18.0...build-v12.19.0) (2021-06-30)


### Features

* remove redirects parsing feature flag ([#3150](https://www.github.com/netlify/build/issues/3150)) ([1f297c9](https://www.github.com/netlify/build/commit/1f297c9845bc3a1f3ba4725c9f97aadf0d541e45))

## [12.18.0](https://www.github.com/netlify/build/compare/build-v12.17.0...build-v12.18.0) (2021-06-30)


### Features

* validate and normalize config properties modified by plugins ([#3153](https://www.github.com/netlify/build/issues/3153)) ([daf5c91](https://www.github.com/netlify/build/commit/daf5c91c080e41c7c5371f6fd6ca2ffa2c965f6f))

## [12.17.0](https://www.github.com/netlify/build/compare/build-v12.16.0...build-v12.17.0) (2021-06-29)


### Features

* call `@netlify/config` when the configuration is modified ([#3147](https://www.github.com/netlify/build/issues/3147)) ([afc73a4](https://www.github.com/netlify/build/commit/afc73a4afa2f6b765bfb6043358c5e9af27314f7))

## [12.16.0](https://www.github.com/netlify/build/compare/build-v12.15.0...build-v12.16.0) (2021-06-29)


### Features

* remove zisiHandlerV2 feature flag ([#3145](https://www.github.com/netlify/build/issues/3145)) ([239fb4b](https://www.github.com/netlify/build/commit/239fb4b7ed41636f7c3814a5f61a7676d4242256))

## [12.15.0](https://www.github.com/netlify/build/compare/build-v12.14.0...build-v12.15.0) (2021-06-29)


### Features

* add `priorityConfig` to `@netlify/build` ([#3143](https://www.github.com/netlify/build/issues/3143)) ([61a5fca](https://www.github.com/netlify/build/commit/61a5fcadb2c15e62accf9e1c97e40f8e3a73170f))

## [12.14.0](https://www.github.com/netlify/build/compare/build-v12.13.1...build-v12.14.0) (2021-06-29)


### Features

* apply `netlifyConfig` modifications in the parent process ([#3135](https://www.github.com/netlify/build/issues/3135)) ([44f107f](https://www.github.com/netlify/build/commit/44f107fbc34653b97359681f1a8d763d29b81ce2))

### [12.13.1](https://www.github.com/netlify/build/compare/build-v12.13.0...build-v12.13.1) (2021-06-29)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.8.0 ([#3137](https://www.github.com/netlify/build/issues/3137)) ([872db54](https://www.github.com/netlify/build/commit/872db544c2d1b798e8a93024c2c8b7fb87bf3f04))

## [12.13.0](https://www.github.com/netlify/build/compare/build-v12.12.0...build-v12.13.0) (2021-06-28)


### Features

* split mutations logic ([#3132](https://www.github.com/netlify/build/issues/3132)) ([6da5a40](https://www.github.com/netlify/build/commit/6da5a405b9d92e95edd67150f9adaf24dd06d749))

## [12.12.0](https://www.github.com/netlify/build/compare/build-v12.11.0...build-v12.12.0) (2021-06-28)


### Features

* update dependency @netlify/zip-it-and-ship-it to v4.7.0 ([#3123](https://www.github.com/netlify/build/issues/3123)) ([c70b708](https://www.github.com/netlify/build/commit/c70b70881f836693dff6994287f23bcfe3d25bb9))

## [12.11.0](https://www.github.com/netlify/build/compare/build-v12.10.0...build-v12.11.0) (2021-06-28)


### Features

* simplify proxy logic ([#3117](https://www.github.com/netlify/build/issues/3117)) ([f833a21](https://www.github.com/netlify/build/commit/f833a219eafb174786695e59691215215a3e6db6))

## [12.10.0](https://www.github.com/netlify/build/compare/build-v12.9.0...build-v12.10.0) (2021-06-24)


### Features

* move `netlifyConfig` mutations validation logic ([#3113](https://www.github.com/netlify/build/issues/3113)) ([a962fd0](https://www.github.com/netlify/build/commit/a962fd0c0a97c56199dd00d117c44f787fdbed03))

## [12.9.0](https://www.github.com/netlify/build/compare/build-v12.8.3...build-v12.9.0) (2021-06-24)


### Features

* move proxy handler logic ([#3101](https://www.github.com/netlify/build/issues/3101)) ([6773d58](https://www.github.com/netlify/build/commit/6773d58b9eece26a0b56811ea92b0a6bc59847ba))

### [12.8.3](https://www.github.com/netlify/build/compare/build-v12.8.2...build-v12.8.3) (2021-06-24)


### Bug Fixes

* dependencies ([67cae98](https://www.github.com/netlify/build/commit/67cae981597b0b2dea6ab2a1856a134705adee89))

### [12.8.2](https://www.github.com/netlify/build/compare/build-v12.8.1...build-v12.8.2) (2021-06-24)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v4.6.0 ([#3105](https://www.github.com/netlify/build/issues/3105)) ([b2c53c7](https://www.github.com/netlify/build/commit/b2c53c789faa5c29295bb2f0209020cd0d9af7b6))

### [12.8.1](https://www.github.com/netlify/build/compare/build-v12.8.0...build-v12.8.1) (2021-06-24)


### Bug Fixes

* **plugins:** feature flag plugin execution with the system node version ([#3081](https://www.github.com/netlify/build/issues/3081)) ([d1d5b58](https://www.github.com/netlify/build/commit/d1d5b58925fbe156591de0cf7123276fb910332d))

## [12.8.0](https://www.github.com/netlify/build/compare/build-v12.7.2...build-v12.8.0) (2021-06-23)


### Features

* add `configMutations` internal variable ([#3093](https://www.github.com/netlify/build/issues/3093)) ([629d32e](https://www.github.com/netlify/build/commit/629d32e3c5205ce555de579bbe349e56355a48d4))

### [12.7.2](https://www.github.com/netlify/build/compare/build-v12.7.1...build-v12.7.2) (2021-06-23)


### Bug Fixes

* pin zip-it-and-ship-it to version 4.4.2 ([#3095](https://www.github.com/netlify/build/issues/3095)) ([86a00ce](https://www.github.com/netlify/build/commit/86a00ce3d5ee0bb5e9158ce81531459215ac0015))

### [12.7.1](https://www.github.com/netlify/build/compare/build-v12.7.0...build-v12.7.1) (2021-06-22)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.5.1 ([#3088](https://www.github.com/netlify/build/issues/3088)) ([192d1ff](https://www.github.com/netlify/build/commit/192d1ff219ab5e091e6023d4f14933b1e7cc5230))

## [12.7.0](https://www.github.com/netlify/build/compare/build-v12.6.0...build-v12.7.0) (2021-06-22)


### Features

* do not allow deleting configuration properties ([#3067](https://www.github.com/netlify/build/issues/3067)) ([aea876a](https://www.github.com/netlify/build/commit/aea876a63bfaf483a9b74018fb68a2604b760354))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.17.0 ([#3085](https://www.github.com/netlify/build/issues/3085)) ([104aebf](https://www.github.com/netlify/build/commit/104aebf0595d1c75e860714bbc9b6b82bd7ace7a))

## [12.6.0](https://www.github.com/netlify/build/compare/build-v12.5.2...build-v12.6.0) (2021-06-22)


### Features

* add `build.publishOrigin` to `@netlify/config` ([#3078](https://www.github.com/netlify/build/issues/3078)) ([b5badfd](https://www.github.com/netlify/build/commit/b5badfdda2c7bada76d21583f6f57465b12b16cb))

### [12.5.2](https://www.github.com/netlify/build/compare/build-v12.5.1...build-v12.5.2) (2021-06-22)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.4.2 ([#3070](https://www.github.com/netlify/build/issues/3070)) ([673f684](https://www.github.com/netlify/build/commit/673f68442849774c62969049e3f0bd7e22ed40b0))

### [12.5.1](https://www.github.com/netlify/build/compare/build-v12.5.0...build-v12.5.1) (2021-06-22)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.19 ([#3073](https://www.github.com/netlify/build/issues/3073)) ([e5f68ab](https://www.github.com/netlify/build/commit/e5f68abbc2b3121c8866e32105ee66fb6d60d136))

## [12.5.0](https://www.github.com/netlify/build/compare/build-v12.4.1...build-v12.5.0) (2021-06-22)


### Features

* improve verbose logging ([#3066](https://www.github.com/netlify/build/issues/3066)) ([6cb567b](https://www.github.com/netlify/build/commit/6cb567b9c4ca3a5abd9cc967df1d5812b0989602))

### [12.4.1](https://www.github.com/netlify/build/compare/build-v12.4.0...build-v12.4.1) (2021-06-17)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.16.0 ([#3064](https://www.github.com/netlify/build/issues/3064)) ([a01bea3](https://www.github.com/netlify/build/commit/a01bea386b5a2a4f60a2d1c36ed6ebb778c7ff50))

## [12.4.0](https://www.github.com/netlify/build/compare/build-v12.3.0...build-v12.4.0) (2021-06-17)


### Features

* pass `publish` directory to the buildbot during deploys ([#3056](https://www.github.com/netlify/build/issues/3056)) ([7d57080](https://www.github.com/netlify/build/commit/7d570801dc9fd469638b938e62c76433b861ff55))

## [12.3.0](https://www.github.com/netlify/build/compare/build-v12.2.2...build-v12.3.0) (2021-06-17)


### Features

* return `accounts` and `addons` from `@netlify/config` ([#3057](https://www.github.com/netlify/build/issues/3057)) ([661f79c](https://www.github.com/netlify/build/commit/661f79cf9ca6eaee03f25a24a6569bc6cc9302a3))

### [12.2.2](https://www.github.com/netlify/build/compare/build-v12.2.1...build-v12.2.2) (2021-06-17)


### Bug Fixes

* log `--cachedConfigPath` in verbose mode ([#3046](https://www.github.com/netlify/build/issues/3046)) ([dc4028f](https://www.github.com/netlify/build/commit/dc4028f1ea84435f62c461be3367015f8be75817))

### [12.2.1](https://www.github.com/netlify/build/compare/build-v12.2.0...build-v12.2.1) (2021-06-17)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.18 ([#3044](https://www.github.com/netlify/build/issues/3044)) ([68828d6](https://www.github.com/netlify/build/commit/68828d688a25959ae37966510ae0d43c0d532e7a))
* remove `netlify_config_default_publish` feature flag ([#3047](https://www.github.com/netlify/build/issues/3047)) ([0e2c137](https://www.github.com/netlify/build/commit/0e2c137fffae8ad3d4d8243ade3e5f46c0e96e21))

## [12.2.0](https://www.github.com/netlify/build/compare/build-v12.1.7...build-v12.2.0) (2021-06-15)


### Features

* add `--cachedConfigPath` CLI flag ([#3037](https://www.github.com/netlify/build/issues/3037)) ([e317a36](https://www.github.com/netlify/build/commit/e317a36b7c7028fcab6bb0fb0d026e0da522b692))

### [12.1.7](https://www.github.com/netlify/build/compare/build-v12.1.6...build-v12.1.7) (2021-06-15)


### Bug Fixes

* do not print warning messages for plugins from the directory ([#3038](https://www.github.com/netlify/build/issues/3038)) ([12c36b2](https://www.github.com/netlify/build/commit/12c36b24cba72dbc6421c231599c073d5e04b3c7))

### [12.1.6](https://www.github.com/netlify/build/compare/build-v12.1.5...build-v12.1.6) (2021-06-15)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.4.1 ([#3034](https://www.github.com/netlify/build/issues/3034)) ([034f13a](https://www.github.com/netlify/build/commit/034f13a59a7ba73b3b0c9b46752b67d971e1a8ac))

### [12.1.5](https://www.github.com/netlify/build/compare/build-v12.1.4...build-v12.1.5) (2021-06-15)


### Bug Fixes

* **plugins:** add warning message for local/package.json plugins relying on old node versions ([#2952](https://www.github.com/netlify/build/issues/2952)) ([5e9b101](https://www.github.com/netlify/build/commit/5e9b101629b5f7f261f985495c7ca17d3c17d8c1))

### [12.1.4](https://www.github.com/netlify/build/compare/build-v12.1.3...build-v12.1.4) (2021-06-15)


### Bug Fixes

* **metrics:** remove timing metrics report ([#3022](https://www.github.com/netlify/build/issues/3022)) ([12424ff](https://www.github.com/netlify/build/commit/12424fffab992497d718549ac2a19129e8281073))

### [12.1.3](https://www.github.com/netlify/build/compare/build-v12.1.2...build-v12.1.3) (2021-06-15)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v4.4.0 ([#3011](https://www.github.com/netlify/build/issues/3011)) ([f49b8c3](https://www.github.com/netlify/build/commit/f49b8c3024f070187a66b3f713b1cb3a5154ab0f))

### [12.1.2](https://www.github.com/netlify/build/compare/build-v12.1.1...build-v12.1.2) (2021-06-14)


### Bug Fixes

* **feature_flags:** remove distribution metrics feature flag ([#3015](https://www.github.com/netlify/build/issues/3015)) ([36e11a2](https://www.github.com/netlify/build/commit/36e11a299a626d918a009f9d8038572bd12d19ad))

### [12.1.1](https://www.github.com/netlify/build/compare/build-v12.1.0...build-v12.1.1) (2021-06-14)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.17 ([#3010](https://www.github.com/netlify/build/issues/3010)) ([8e35944](https://www.github.com/netlify/build/commit/8e35944e4974e026c600dfbc46758985b9d9cb2e))
* **deps:** update dependency @netlify/plugins-list to ^2.15.1 ([#3014](https://www.github.com/netlify/build/issues/3014)) ([1b7bfa6](https://www.github.com/netlify/build/commit/1b7bfa61d1c7fe689268d1a10442609dc220fa44))
* revert `redirects` parsing ([#3016](https://www.github.com/netlify/build/issues/3016)) ([39613cf](https://www.github.com/netlify/build/commit/39613cfd04281e51264ef61a75c3bd4880158a11))

## [12.1.0](https://www.github.com/netlify/build/compare/build-v12.0.1...build-v12.1.0) (2021-06-11)


### Features

* add `config.redirects` ([#3003](https://www.github.com/netlify/build/issues/3003)) ([ec3c177](https://www.github.com/netlify/build/commit/ec3c177fcc6a90a99fb7a584d2402b004704bc7e))

### [12.0.1](https://www.github.com/netlify/build/compare/build-v12.0.0...build-v12.0.1) (2021-06-10)


### Bug Fixes

* allow using no feature flags ([#2991](https://www.github.com/netlify/build/issues/2991)) ([f25ca43](https://www.github.com/netlify/build/commit/f25ca434df6bba362112d3a1c881c7391988ae58))

## [12.0.0](https://www.github.com/netlify/build/compare/build-v11.38.0...build-v12.0.0) (2021-06-10)


### ⚠ BREAKING CHANGES

* improve support for monorepo sites without a `publish` directory (#2988)

### Features

* improve support for monorepo sites without a `publish` directory ([#2988](https://www.github.com/netlify/build/issues/2988)) ([1fcad8a](https://www.github.com/netlify/build/commit/1fcad8a81c35060fbc3ec8cb15ade9762579a166))

## [11.38.0](https://www.github.com/netlify/build/compare/build-v11.37.2...build-v11.38.0) (2021-06-10)


### Features

* improve feature flags logic ([#2960](https://www.github.com/netlify/build/issues/2960)) ([6df6360](https://www.github.com/netlify/build/commit/6df63603ee3822229d1504e95f4622d47387ddfb))

### [11.37.2](https://www.github.com/netlify/build/compare/build-v11.37.1...build-v11.37.2) (2021-06-10)


### Bug Fixes

* pin ZISI to v4.2.7 ([#2983](https://www.github.com/netlify/build/issues/2983)) ([29a8b19](https://www.github.com/netlify/build/commit/29a8b199b7d4db780b237a838e6495b4259bdfcc))

### [11.37.1](https://www.github.com/netlify/build/compare/build-v11.37.0...build-v11.37.1) (2021-06-10)


### Bug Fixes

* force release of Build ([#2981](https://www.github.com/netlify/build/issues/2981)) ([a64994b](https://www.github.com/netlify/build/commit/a64994b5bc296056bf9bc51a1c21fcb157c86edd))

## [11.37.0](https://www.github.com/netlify/build/compare/build-v11.36.3...build-v11.37.0) (2021-06-09)


### Features

* only monitor the duration of Netlify maintained plugins ([#2967](https://www.github.com/netlify/build/issues/2967)) ([1968e34](https://www.github.com/netlify/build/commit/1968e344512ea2ff231f18cb608f88ef37c58278))

### [11.36.3](https://www.github.com/netlify/build/compare/build-v11.36.2...build-v11.36.3) (2021-06-09)


### Bug Fixes

* do not record plugins duration if no plugins ([#2962](https://www.github.com/netlify/build/issues/2962)) ([dee54bf](https://www.github.com/netlify/build/commit/dee54bf8c0bf28aa17b37144da282ca3f4f4b637))

### [11.36.2](https://www.github.com/netlify/build/compare/build-v11.36.1...build-v11.36.2) (2021-06-09)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.3.0 ([#2959](https://www.github.com/netlify/build/issues/2959)) ([a5f7b64](https://www.github.com/netlify/build/commit/a5f7b64c6d5a43ec330db989c3862679aa91ea0f))

### [11.36.1](https://www.github.com/netlify/build/compare/build-v11.36.0...build-v11.36.1) (2021-06-09)


### Bug Fixes

* improve error handling of plugins list fetch error ([#2957](https://www.github.com/netlify/build/issues/2957)) ([414d405](https://www.github.com/netlify/build/commit/414d405845a8fd28e9cc46b706bec4f1662ebe61))

## [11.36.0](https://www.github.com/netlify/build/compare/build-v11.35.0...build-v11.36.0) (2021-06-08)


### Features

* allow mutating `functions.*` top-level properties ([#2944](https://www.github.com/netlify/build/issues/2944)) ([0b4b58b](https://www.github.com/netlify/build/commit/0b4b58bbdd1e5a9aa82b185404920f3c353b54f5))

## [11.35.0](https://www.github.com/netlify/build/compare/build-v11.34.0...build-v11.35.0) (2021-06-08)


### Features

* log when `netlifyConfig` is mutated ([#2945](https://www.github.com/netlify/build/issues/2945)) ([fd98db3](https://www.github.com/netlify/build/commit/fd98db331096e75ef3812d6e9a901a8841aafbc4))

## [11.34.0](https://www.github.com/netlify/build/compare/build-v11.33.0...build-v11.34.0) (2021-06-08)


### Features

* fix `functions.directory` mutation ([#2940](https://www.github.com/netlify/build/issues/2940)) ([29f71be](https://www.github.com/netlify/build/commit/29f71beae04fed1b365504d3d7144618d222f720))
* handle symbols mutations on `netlifyConfig` ([#2941](https://www.github.com/netlify/build/issues/2941)) ([58f9f8f](https://www.github.com/netlify/build/commit/58f9f8f3f2f7a69441049b95159362507f7bfc40))


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.16 ([#2942](https://www.github.com/netlify/build/issues/2942)) ([29728b5](https://www.github.com/netlify/build/commit/29728b58ab2d6334d6cc2a0722ff7bff2a701c90))

## [11.33.0](https://www.github.com/netlify/build/compare/build-v11.32.5...build-v11.33.0) (2021-06-07)


### Features

* **metrics:** report distribution metrics under a feature flag ([#2933](https://www.github.com/netlify/build/issues/2933)) ([5a2e2f2](https://www.github.com/netlify/build/commit/5a2e2f2dc96112f32a31ae1dba3c46fd9f23de82))

### [11.32.5](https://www.github.com/netlify/build/compare/build-v11.32.4...build-v11.32.5) (2021-06-07)


### Bug Fixes

* correct usage of ZISI's basePath property ([#2927](https://www.github.com/netlify/build/issues/2927)) ([c354944](https://www.github.com/netlify/build/commit/c3549448740f504308ffb50d2897054f29b83d65))

### [11.32.4](https://www.github.com/netlify/build/compare/build-v11.32.3...build-v11.32.4) (2021-06-07)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.15 ([#2929](https://www.github.com/netlify/build/issues/2929)) ([87df6cb](https://www.github.com/netlify/build/commit/87df6cb9c6855bf6506290a7099a84022d3a0e93))
* **deps:** update dependency @netlify/plugins-list to ^2.15.0 ([#2931](https://www.github.com/netlify/build/issues/2931)) ([efef14b](https://www.github.com/netlify/build/commit/efef14b09b907b08cd659de51f8e74e9c2b83b5f))
* **deps:** update dependency statsd-client to v0.4.7 ([#2920](https://www.github.com/netlify/build/issues/2920)) ([a789aec](https://www.github.com/netlify/build/commit/a789aecaa20803e81822248d56312aa2b64c1419))

### [11.32.3](https://www.github.com/netlify/build/compare/build-v11.32.2...build-v11.32.3) (2021-06-06)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.14 ([#2917](https://www.github.com/netlify/build/issues/2917)) ([3985338](https://www.github.com/netlify/build/commit/3985338aab737255a68749a84b6c0570373be69a))

### [11.32.2](https://www.github.com/netlify/build/compare/build-v11.32.1...build-v11.32.2) (2021-06-04)


### Bug Fixes

* configuration mutation of object values ([#2915](https://www.github.com/netlify/build/issues/2915)) ([5560199](https://www.github.com/netlify/build/commit/5560199e9b47e05b6ff514af127020fed9eecaa1))

### [11.32.1](https://www.github.com/netlify/build/compare/build-v11.32.0...build-v11.32.1) (2021-06-04)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.7 ([#2910](https://www.github.com/netlify/build/issues/2910)) ([a96240f](https://www.github.com/netlify/build/commit/a96240f54c4842634d0e2756a9891934926e71f7))

## [11.32.0](https://www.github.com/netlify/build/compare/build-v11.31.1...build-v11.32.0) (2021-06-04)


### Features

* monitor total time for user/system/plugin code ([#2911](https://www.github.com/netlify/build/issues/2911)) ([ef33e9f](https://www.github.com/netlify/build/commit/ef33e9f2cb6bafa0cc861ee7c45d52187048132a))

### [11.31.1](https://www.github.com/netlify/build/compare/build-v11.31.0...build-v11.31.1) (2021-06-02)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.6 ([#2900](https://www.github.com/netlify/build/issues/2900)) ([6ae857d](https://www.github.com/netlify/build/commit/6ae857d99cdf69ac9f70cc96a891c9c14804b4a2))

## [11.31.0](https://www.github.com/netlify/build/compare/build-v11.30.0...build-v11.31.0) (2021-06-02)


### Features

* validate when mutating a property too late ([#2894](https://www.github.com/netlify/build/issues/2894)) ([fa2d870](https://www.github.com/netlify/build/commit/fa2d87073fed71cf0219ebac70056f4e91f67f73))

## [11.30.0](https://www.github.com/netlify/build/compare/build-v11.29.2...build-v11.30.0) (2021-06-02)


### Features

* add support for experimental ZISI v2 handler ([#2895](https://www.github.com/netlify/build/issues/2895)) ([7fea341](https://www.github.com/netlify/build/commit/7fea34122cd2ab8a1c56a177c5dffa83618542fe))

### [11.29.2](https://www.github.com/netlify/build/compare/build-v11.29.1...build-v11.29.2) (2021-05-31)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.5 ([#2891](https://www.github.com/netlify/build/issues/2891)) ([5ccd5f5](https://www.github.com/netlify/build/commit/5ccd5f51c553fd5f588065b384a795d90837ac85))

### [11.29.1](https://www.github.com/netlify/build/compare/build-v11.29.0...build-v11.29.1) (2021-05-31)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.13 ([#2885](https://www.github.com/netlify/build/issues/2885)) ([3a2f6ff](https://www.github.com/netlify/build/commit/3a2f6ff14013e0791ce21f51393b36c7e799cd42))
* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.2 ([#2886](https://www.github.com/netlify/build/issues/2886)) ([a4a0549](https://www.github.com/netlify/build/commit/a4a05497ba9809bc6420b31514f690badba4bc53))
* **deps:** update dependency uuid to v8 ([#2882](https://www.github.com/netlify/build/issues/2882)) ([1d06463](https://www.github.com/netlify/build/commit/1d06463d9e4a15bfddb14b4be271411f29ed709a))

## [11.29.0](https://www.github.com/netlify/build/compare/build-v11.28.0...build-v11.29.0) (2021-05-28)


### Features

* allow mutating `build.command` ([#2874](https://www.github.com/netlify/build/issues/2874)) ([e55dd94](https://www.github.com/netlify/build/commit/e55dd94e375c805fa923cd9bdccd184928d0790c))

## [11.28.0](https://www.github.com/netlify/build/compare/build-v11.27.0...build-v11.28.0) (2021-05-28)


### Features

* allow mutating `build.functions`, `functions.directory` and `functions.*.directory` ([#2875](https://www.github.com/netlify/build/issues/2875)) ([39804f2](https://www.github.com/netlify/build/commit/39804f214a4de40b1eb573c7b405079df528b5ec))

## [11.27.0](https://www.github.com/netlify/build/compare/build-v11.26.1...build-v11.27.0) (2021-05-28)


### Features

* make build command a core command ([#2868](https://www.github.com/netlify/build/issues/2868)) ([5149c87](https://www.github.com/netlify/build/commit/5149c87574f2dead8a4c6e8c1ef9056d35f91639))

### [11.26.1](https://www.github.com/netlify/build/compare/build-v11.26.0...build-v11.26.1) (2021-05-28)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.1 ([#2870](https://www.github.com/netlify/build/issues/2870)) ([6e576b2](https://www.github.com/netlify/build/commit/6e576b252fb08a8e70c0f17e178ff54aede1e272))

## [11.26.0](https://www.github.com/netlify/build/compare/build-v11.25.1...build-v11.26.0) (2021-05-27)


### Features

* allow mutating `build.publish` and `build.edge_handlers` ([#2866](https://www.github.com/netlify/build/issues/2866)) ([c27557e](https://www.github.com/netlify/build/commit/c27557e0aadb8b9241358e2d5a77fc24fb7faed0))
* improve normalization of `constants` ([#2865](https://www.github.com/netlify/build/issues/2865)) ([9dc4fdd](https://www.github.com/netlify/build/commit/9dc4fddfa351e9230387316af6c8386cb63ffea2))

### [11.25.1](https://www.github.com/netlify/build/compare/build-v11.25.0...build-v11.25.1) (2021-05-27)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.0 ([#2861](https://www.github.com/netlify/build/issues/2861)) ([1bd75f8](https://www.github.com/netlify/build/commit/1bd75f89509c4859cb3e31908d3ce54985142d7c))

## [11.25.0](https://www.github.com/netlify/build/compare/build-v11.24.0...build-v11.25.0) (2021-05-27)


### Features

* allow mutating `netlifyConfig.functions` ([#2857](https://www.github.com/netlify/build/issues/2857)) ([0ea57a5](https://www.github.com/netlify/build/commit/0ea57a5d868afcc7abbbd65f11e843c4938035d4))

## [11.24.0](https://www.github.com/netlify/build/compare/build-v11.23.0...build-v11.24.0) (2021-05-26)


### Features

* allow mutating `netlifyConfig.functionsDirectory` ([#2852](https://www.github.com/netlify/build/issues/2852)) ([c81904e](https://www.github.com/netlify/build/commit/c81904e9a89f0bc09f1dfda3f430e2ed14f1409b))

## [11.23.0](https://www.github.com/netlify/build/compare/build-v11.22.0...build-v11.23.0) (2021-05-26)


### Features

* allow `constants` to be mutated during builds ([#2850](https://www.github.com/netlify/build/issues/2850)) ([b7a51aa](https://www.github.com/netlify/build/commit/b7a51aa61e86e51a8b074f5472fbd578aa2ca3a0))


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.1.0 ([#2853](https://www.github.com/netlify/build/issues/2853)) ([8269428](https://www.github.com/netlify/build/commit/826942805e8b02aa2462fa547890a263d5b4fbd8))

## [11.22.0](https://www.github.com/netlify/build/compare/build-v11.21.0...build-v11.22.0) (2021-05-25)


### Features

* pass mutated `netlifyConfig` everywhere ([#2847](https://www.github.com/netlify/build/issues/2847)) ([7191b57](https://www.github.com/netlify/build/commit/7191b57e1a9cbc8d599db24b20996b568609c875))

## [11.21.0](https://www.github.com/netlify/build/compare/build-v11.20.0...build-v11.21.0) (2021-05-25)


### Features

* pass `netlifyConfig` to each event handler ([#2845](https://www.github.com/netlify/build/issues/2845)) ([16ea9e4](https://www.github.com/netlify/build/commit/16ea9e401ec7045a091d70ff3724023eab3261fc))

## [11.20.0](https://www.github.com/netlify/build/compare/build-v11.19.1...build-v11.20.0) (2021-05-25)


### Features

* make `netlifyConfig` readonly ([#2840](https://www.github.com/netlify/build/issues/2840)) ([a8e8e31](https://www.github.com/netlify/build/commit/a8e8e3173e8c58c3c0cdc2b956aa588c445c2f27))

### [11.19.1](https://www.github.com/netlify/build/compare/build-v11.19.0...build-v11.19.1) (2021-05-25)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.12 ([#2841](https://www.github.com/netlify/build/issues/2841)) ([9933438](https://www.github.com/netlify/build/commit/99334380f0057d37680695852019f4ad0561cb61))

## [11.19.0](https://www.github.com/netlify/build/compare/build-v11.18.1...build-v11.19.0) (2021-05-25)


### Features

* add `installType` to telemetry ([#2837](https://www.github.com/netlify/build/issues/2837)) ([de0f18f](https://www.github.com/netlify/build/commit/de0f18f1b1172fb3353bbc1e325c3bf7b551e601))

### [11.18.1](https://www.github.com/netlify/build/compare/build-v11.18.0...build-v11.18.1) (2021-05-24)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.11 ([#2835](https://www.github.com/netlify/build/issues/2835)) ([03932f6](https://www.github.com/netlify/build/commit/03932f62398f459d0e46033e5aed89462fdd9909))
* **deps:** update dependency @netlify/plugins-list to ^2.14.2 ([#2831](https://www.github.com/netlify/build/issues/2831)) ([b779b3f](https://www.github.com/netlify/build/commit/b779b3f503a9603e439d30ac305391c78675f168))

## [11.18.0](https://www.github.com/netlify/build/compare/build-v11.17.4...build-v11.18.0) (2021-05-21)


### Features

* print a warning message when `base` is set but not `publish` ([#2827](https://www.github.com/netlify/build/issues/2827)) ([a9fb807](https://www.github.com/netlify/build/commit/a9fb807be477bcd2419520b92d8a7c7d7ee03088))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.14.1 ([#2830](https://www.github.com/netlify/build/issues/2830)) ([1ee3998](https://www.github.com/netlify/build/commit/1ee3998a8aaa0d2e1cb07285e6853c37e5b64ca1))

### [11.17.4](https://www.github.com/netlify/build/compare/build-v11.17.3...build-v11.17.4) (2021-05-19)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.10 ([#2822](https://www.github.com/netlify/build/issues/2822)) ([47c8e05](https://www.github.com/netlify/build/commit/47c8e05269f3735d1988e46ac80ddfec2ff7c930))

### [11.17.3](https://www.github.com/netlify/build/compare/build-v11.17.2...build-v11.17.3) (2021-05-19)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.9 ([#2819](https://www.github.com/netlify/build/issues/2819)) ([0a820a2](https://www.github.com/netlify/build/commit/0a820a2cf2d370829e87e17d1e45f5c9c72be645))
* **deps:** update dependency @netlify/plugins-list to ^2.14.0 ([#2820](https://www.github.com/netlify/build/issues/2820)) ([fb55377](https://www.github.com/netlify/build/commit/fb5537770234866f23c3a441b668f0ab2dee837e))

### [11.17.2](https://www.github.com/netlify/build/compare/build-v11.17.1...build-v11.17.2) (2021-05-17)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.0.1 ([#2814](https://www.github.com/netlify/build/issues/2814)) ([122446e](https://www.github.com/netlify/build/commit/122446edb82aa597f1882c543664fbf683744904))

### [11.17.1](https://www.github.com/netlify/build/compare/build-v11.17.0...build-v11.17.1) (2021-05-17)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.13.0 ([#2803](https://www.github.com/netlify/build/issues/2803)) ([0d2009a](https://www.github.com/netlify/build/commit/0d2009aa3fb308f93a71425a312c2f5a8ca9aa40))
* **deps:** update dependency @netlify/zip-it-and-ship-it to v4 ([#2800](https://www.github.com/netlify/build/issues/2800)) ([5575708](https://www.github.com/netlify/build/commit/5575708ab19384103dd0e8c477e0ae672750c6cf))

## [11.17.0](https://www.github.com/netlify/build/compare/build-v11.16.0...build-v11.17.0) (2021-05-14)


### Features

* add build logs to explain how to upgrade plugins ([#2798](https://www.github.com/netlify/build/issues/2798)) ([7e054ae](https://www.github.com/netlify/build/commit/7e054ae16d815b89f6a4ea2984a4c21dc4c75a4e))


### Bug Fixes

* improve `compatibility`-related warning messages ([#2797](https://www.github.com/netlify/build/issues/2797)) ([7f34aa5](https://www.github.com/netlify/build/commit/7f34aa59909dce6fa5fa6cd7f9721c8203745da6))

## [11.16.0](https://www.github.com/netlify/build/compare/build-v11.15.0...build-v11.16.0) (2021-05-13)


### Features

* simplify version pinning logic ([#2795](https://www.github.com/netlify/build/issues/2795)) ([7c0d61b](https://www.github.com/netlify/build/commit/7c0d61b896b50be42272d489bd04b09097fbc752))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.12.0 ([#2793](https://www.github.com/netlify/build/issues/2793)) ([f2b4bad](https://www.github.com/netlify/build/commit/f2b4bad006d9185ff2ee0c09c101d69873fc0ffa))

## [11.15.0](https://www.github.com/netlify/build/compare/build-v11.14.0...build-v11.15.0) (2021-05-13)


### Features

* change shape of `compatibility` field ([#2791](https://www.github.com/netlify/build/issues/2791)) ([f43d3f6](https://www.github.com/netlify/build/commit/f43d3f6682aa46e2d442b4d94a787629507945af))

## [11.14.0](https://www.github.com/netlify/build/compare/build-v11.13.0...build-v11.14.0) (2021-05-12)


### Features

* allow commands to add tags to the metrics + `bundler` tag ([#2783](https://www.github.com/netlify/build/issues/2783)) ([345e433](https://www.github.com/netlify/build/commit/345e433244b4c27e8d9a333e52e056d7f51e4bea))
* **config:** return repository root ([#2785](https://www.github.com/netlify/build/issues/2785)) ([9a05786](https://www.github.com/netlify/build/commit/9a05786266c51031ccaef1f216f21c5821ec92fb))

## [11.13.0](https://www.github.com/netlify/build/compare/build-v11.12.1...build-v11.13.0) (2021-05-12)


### Features

* show warning about modules with dynamic imports ([#2773](https://www.github.com/netlify/build/issues/2773)) ([b49efe5](https://www.github.com/netlify/build/commit/b49efe54e81b1cd35b912b1980ba6cd1bd04539c))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.11.2 ([#2779](https://www.github.com/netlify/build/issues/2779)) ([83cfde7](https://www.github.com/netlify/build/commit/83cfde78abda0c782b3a9979d60f06d8eb07ce5f))
* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.10.0 ([#2776](https://www.github.com/netlify/build/issues/2776)) ([e8599eb](https://www.github.com/netlify/build/commit/e8599ebaac5828fbd143dc54bd14abeb1aee6732))

### [11.12.1](https://www.github.com/netlify/build/compare/build-v11.12.0...build-v11.12.1) (2021-05-12)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.11.1 ([#2775](https://www.github.com/netlify/build/issues/2775)) ([982944b](https://www.github.com/netlify/build/commit/982944b5c90b39ce838c0849294d9787dc141ab9))

## [11.12.0](https://www.github.com/netlify/build/compare/build-v11.11.0...build-v11.12.0) (2021-05-10)


### Features

* improve version pinning ([#2762](https://www.github.com/netlify/build/issues/2762)) ([940b19e](https://www.github.com/netlify/build/commit/940b19eb10747f33f67d4eecec834471c0455cc0))

## [11.11.0](https://www.github.com/netlify/build/compare/build-v11.10.0...build-v11.11.0) (2021-05-10)


### Features

* fix test snapshots related to version pinning ([#2764](https://www.github.com/netlify/build/issues/2764)) ([0ce49e0](https://www.github.com/netlify/build/commit/0ce49e001e9f7fb980b3de3e22bbcc047e4f5d4e))

## [11.10.0](https://www.github.com/netlify/build/compare/build-v11.9.4...build-v11.10.0) (2021-05-07)


### Features

* add support for `0.*` versions in outdated plugins message ([#2756](https://www.github.com/netlify/build/issues/2756)) ([69a0ea1](https://www.github.com/netlify/build/commit/69a0ea13e655535c113ec37374a99a5b7b3308c3))
* add support for `0.*` versions when pinning versions ([#2758](https://www.github.com/netlify/build/issues/2758)) ([6210e36](https://www.github.com/netlify/build/commit/6210e36dafc4f7deda44d8ab3e4a76c44e3e1a5d))

### [11.9.4](https://www.github.com/netlify/build/compare/build-v11.9.3...build-v11.9.4) (2021-05-06)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.10.0 ([#2759](https://www.github.com/netlify/build/issues/2759)) ([3cf77d9](https://www.github.com/netlify/build/commit/3cf77d941a0d83b6ba7987c95d0442dfe1a2a615))

### [11.9.3](https://www.github.com/netlify/build/compare/build-v11.9.2...build-v11.9.3) (2021-05-06)


### Bug Fixes

* simplify version pinning logic ([#2753](https://www.github.com/netlify/build/issues/2753)) ([c0c34c0](https://www.github.com/netlify/build/commit/c0c34c062349ccec92163586a69ea112f8d461e8))

### [11.9.2](https://www.github.com/netlify/build/compare/build-v11.9.1...build-v11.9.2) (2021-05-06)


### Bug Fixes

* 404 in production with `updatePlugin` ([#2749](https://www.github.com/netlify/build/issues/2749)) ([6ed8ab9](https://www.github.com/netlify/build/commit/6ed8ab9f55690981d8f6c1216ebb1b5bc0efd8c4))

### [11.9.1](https://www.github.com/netlify/build/compare/build-v11.9.0...build-v11.9.1) (2021-05-05)


### Bug Fixes

* **deps:** lock file maintenance ([#2744](https://www.github.com/netlify/build/issues/2744)) ([52f47a4](https://www.github.com/netlify/build/commit/52f47a4ff2787c5b8256bbe89e572c12c8912f84))

## [11.9.0](https://www.github.com/netlify/build/compare/build-v11.8.0...build-v11.9.0) (2021-05-05)


### Features

* pin `netlify.toml`-installed plugins versions ([#2740](https://www.github.com/netlify/build/issues/2740)) ([7ebab6b](https://www.github.com/netlify/build/commit/7ebab6bd89506d7fb0c60e8f698d07367e02822c))

## [11.8.0](https://www.github.com/netlify/build/compare/build-v11.7.3...build-v11.8.0) (2021-05-05)


### Features

* add more plugin metrics ([#2732](https://www.github.com/netlify/build/issues/2732)) ([77efcaa](https://www.github.com/netlify/build/commit/77efcaabedb0f6866dcbffc95d84d8f200942233))

### [11.7.3](https://www.github.com/netlify/build/compare/build-v11.7.2...build-v11.7.3) (2021-05-04)


### Bug Fixes

* **deps:** update netlify packages ([#2735](https://www.github.com/netlify/build/issues/2735)) ([6060bab](https://www.github.com/netlify/build/commit/6060babcee003881df46f45eda1118b7737cc4e1))

### [11.7.2](https://www.github.com/netlify/build/compare/build-v11.7.1...build-v11.7.2) (2021-05-03)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.9.0 ([#2729](https://www.github.com/netlify/build/issues/2729)) ([a0cbfdc](https://www.github.com/netlify/build/commit/a0cbfdcccb122549ba1efb576d3c0431e8370a6f))

### [11.7.1](https://www.github.com/netlify/build/compare/build-v11.7.0...build-v11.7.1) (2021-05-03)


### Bug Fixes

* **deps:** update dependency map-obj to v4 ([#2721](https://www.github.com/netlify/build/issues/2721)) ([17559dc](https://www.github.com/netlify/build/commit/17559dcc75dd9f9a73f2a604c9f8ef3140a91b42))

## [11.7.0](https://www.github.com/netlify/build/compare/build-v11.6.0...build-v11.7.0) (2021-05-03)


### Features

* add support for `functions.included_files` config property ([#2681](https://www.github.com/netlify/build/issues/2681)) ([d75dc74](https://www.github.com/netlify/build/commit/d75dc74d9bbe9b542b17afce37419bed575c8651))

## [11.6.0](https://www.github.com/netlify/build/compare/build-v11.5.1...build-v11.6.0) (2021-04-30)


### Features

* pin plugins versions ([#2714](https://www.github.com/netlify/build/issues/2714)) ([0857f65](https://www.github.com/netlify/build/commit/0857f652ccaa8f38f5af68e7e65348e7a8e25fd8))

### [11.5.1](https://www.github.com/netlify/build/compare/build-v11.5.0...build-v11.5.1) (2021-04-30)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.7 ([#2711](https://www.github.com/netlify/build/issues/2711)) ([66d9f53](https://www.github.com/netlify/build/commit/66d9f538dc226e569424d7c72f26c808e54e6987))

## [11.5.0](https://www.github.com/netlify/build/compare/build-v11.4.4...build-v11.5.0) (2021-04-30)


### Features

* **plugins:** expose NETLIFY_API_HOST constant to plugins ([#2709](https://www.github.com/netlify/build/issues/2709)) ([8b56399](https://www.github.com/netlify/build/commit/8b5639916f7dffba4bb74e776db060f2cc4e0993))

### [11.4.4](https://www.github.com/netlify/build/compare/build-v11.4.3...build-v11.4.4) (2021-04-29)


### Bug Fixes

* re-enable `updateSite` endpoint ([#2704](https://www.github.com/netlify/build/issues/2704)) ([aa704af](https://www.github.com/netlify/build/commit/aa704af603b21fec4d99d2163f884e0a6f776761))

### [11.4.3](https://www.github.com/netlify/build/compare/build-v11.4.2...build-v11.4.3) (2021-04-29)


### Bug Fixes

* do not run `updateSite` for `netlify.toml`-only plugins ([#2703](https://www.github.com/netlify/build/issues/2703)) ([0580c8f](https://www.github.com/netlify/build/commit/0580c8fa0b1dfcd9fe8eaac6596e84d3ab38b980))
* percent-encode the `package` parameter of the `updatePlugin` endpoint ([#2702](https://www.github.com/netlify/build/issues/2702)) ([d2edef2](https://www.github.com/netlify/build/commit/d2edef2a8ca27dc996a2c7db50d66a623fcb1d08))

### [11.4.2](https://www.github.com/netlify/build/compare/build-v11.4.1...build-v11.4.2) (2021-04-29)


### Bug Fixes

* improve temporary fix for the `updatePlugin` bug ([#2696](https://www.github.com/netlify/build/issues/2696)) ([87fde4a](https://www.github.com/netlify/build/commit/87fde4accae7dc6d4ab8a1b09ef2c4c3a7152f25))

### [11.4.1](https://www.github.com/netlify/build/compare/build-v11.4.0...build-v11.4.1) (2021-04-29)


### Bug Fixes

* use the proper conventional commit in PR title ([#2694](https://www.github.com/netlify/build/issues/2694)) ([6829fe4](https://www.github.com/netlify/build/commit/6829fe432d9a2e1288c7eb931e052c12b302b703))

## [11.4.0](https://www.github.com/netlify/build/compare/build-v11.3.2...build-v11.4.0) (2021-04-29)


### Features

* call `updatePlugin` to pin plugins' versions ([#2683](https://www.github.com/netlify/build/issues/2683)) ([1d0ce63](https://www.github.com/netlify/build/commit/1d0ce6342f6e00376be51a05d906b7867fc8f9a0))
* improve debugging of plugins versioning ([#2691](https://www.github.com/netlify/build/issues/2691)) ([4659410](https://www.github.com/netlify/build/commit/46594109dcbc713d9ba3041e7a2a1013b4e406df))

### [11.3.2](https://www.github.com/netlify/build/compare/build-v11.3.1...build-v11.3.2) (2021-04-28)


### Bug Fixes

* **telemetry:** fwd relevant `nodeVersion` information ([#2634](https://www.github.com/netlify/build/issues/2634)) ([caec0d6](https://www.github.com/netlify/build/commit/caec0d66f7649856cdad749545fdbe084b1549e8))

### [11.3.1](https://www.github.com/netlify/build/compare/build-v11.3.0...build-v11.3.1) (2021-04-27)


### Bug Fixes

* do not fail when plugin error has `toJSON()` method ([#2677](https://www.github.com/netlify/build/issues/2677)) ([6363758](https://www.github.com/netlify/build/commit/6363758cb4cc2ef232ac5ff21298126ab7318e30))

## [11.3.0](https://www.github.com/netlify/build/compare/build-v11.2.6...build-v11.3.0) (2021-04-27)


### Features

* remove `--ui-plugins` CLI flag ([#2673](https://www.github.com/netlify/build/issues/2673)) ([a1cbf78](https://www.github.com/netlify/build/commit/a1cbf789bac18a83232a29c70390691442527693))

### [11.2.6](https://www.github.com/netlify/build/compare/build-v11.2.5...build-v11.2.6) (2021-04-26)


### Bug Fixes

* **deps:** update dependency map-obj to v3.1.0 ([#2656](https://www.github.com/netlify/build/issues/2656)) ([89e497a](https://www.github.com/netlify/build/commit/89e497a37a892f203a601a510e0e24ae037ad146))
* **deps:** update dependency statsd-client to v0.4.6 ([#2658](https://www.github.com/netlify/build/issues/2658)) ([be366a2](https://www.github.com/netlify/build/commit/be366a264d1e4db2a71ee8b233d65889cee3992c))
* **deps:** update dependency uuid to v7.0.3 ([#2659](https://www.github.com/netlify/build/issues/2659)) ([e7e9ea8](https://www.github.com/netlify/build/commit/e7e9ea8d0cb0a9c3cd9e16aeda2bd300c7057509))

### [11.2.5](https://www.github.com/netlify/build/compare/build-v11.2.4...build-v11.2.5) (2021-04-24)


### Bug Fixes

* **deps:** memoize-one breaking change in exports ([#2653](https://www.github.com/netlify/build/issues/2653)) ([7a10098](https://www.github.com/netlify/build/commit/7a10098382f3a35bbe1a0dc62a6d7b7416479d53))

### [11.2.4](https://www.github.com/netlify/build/compare/build-v11.2.3...build-v11.2.4) (2021-04-23)


### Bug Fixes

* **deps:** memoize-one cjs exports breaking changes ([#2643](https://www.github.com/netlify/build/issues/2643)) ([eafdaa0](https://www.github.com/netlify/build/commit/eafdaa04b60ae1753e3752748aaa4d2b6a5994e7))

### [11.2.3](https://www.github.com/netlify/build/compare/build-v11.2.2...build-v11.2.3) (2021-04-22)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.8.0 ([#2631](https://www.github.com/netlify/build/issues/2631)) ([fbc235e](https://www.github.com/netlify/build/commit/fbc235e407ac100957a53fe5a151c02bde58bb7f))
* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.7.0 ([#2633](https://www.github.com/netlify/build/issues/2633)) ([4938a1c](https://www.github.com/netlify/build/commit/4938a1ca36a8dffcec5fb2b10a4e08ac451a8ba7))

### [11.2.2](https://www.github.com/netlify/build/compare/build-v11.2.1...build-v11.2.2) (2021-04-21)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.6.0 ([#2626](https://www.github.com/netlify/build/issues/2626)) ([63e0330](https://www.github.com/netlify/build/commit/63e033014a78229daa9b11360abd24944561ec12))

### [11.2.1](https://www.github.com/netlify/build/compare/build-v11.2.0...build-v11.2.1) (2021-04-20)


### Bug Fixes

* **deps:** update netlify packages ([#2622](https://www.github.com/netlify/build/issues/2622)) ([4d35de4](https://www.github.com/netlify/build/commit/4d35de4d4d8d49b460080480c6e5b3610e6ef023))

## [11.2.0](https://www.github.com/netlify/build/compare/build-v11.1.0...build-v11.2.0) (2021-04-19)


### Features

* split `compatibleVersion` and `expectedVersion` ([#2613](https://www.github.com/netlify/build/issues/2613)) ([ffaf4a4](https://www.github.com/netlify/build/commit/ffaf4a477ef7e88a8af55dd6070b8e939e89c740))
* start pinning plugin versions ([#2617](https://www.github.com/netlify/build/issues/2617)) ([2c8a9cb](https://www.github.com/netlify/build/commit/2c8a9cb676e92411aa709a0aeb23394c30c7e3a1))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.7.0 ([#2619](https://www.github.com/netlify/build/issues/2619)) ([ae1e4ae](https://www.github.com/netlify/build/commit/ae1e4ae4624d8510f8838d6f3a190bc515d92925))
* failing esbuild tests ([#2615](https://www.github.com/netlify/build/issues/2615)) ([6f50566](https://www.github.com/netlify/build/commit/6f505662083672975eff9f745a68c7ec6702fd6d))

## [11.1.0](https://www.github.com/netlify/build/compare/build-v11.0.2...build-v11.1.0) (2021-04-16)


### Features

* refactor incompatible/outdated plugins warnings ([#2612](https://www.github.com/netlify/build/issues/2612)) ([d2777e9](https://www.github.com/netlify/build/commit/d2777e9b97d8b509c0fd6121e0ae4c6a89a0c408))

### [11.0.2](https://www.github.com/netlify/build/compare/build-v11.0.1...build-v11.0.2) (2021-04-15)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.4.0 ([#2609](https://www.github.com/netlify/build/issues/2609)) ([83da9dc](https://www.github.com/netlify/build/commit/83da9dc609296f4cd7409c923e14e6772c2e4463))

### [11.0.1](https://www.github.com/netlify/build/compare/build-v11.0.0...build-v11.0.1) (2021-04-14)


### Bug Fixes

* `@netlify/config` major release ([#2603](https://www.github.com/netlify/build/issues/2603)) ([5c53aa8](https://www.github.com/netlify/build/commit/5c53aa895d51a0b99ac8638f54b326fb7ae1a395))

## [11.0.0](https://www.github.com/netlify/build/compare/build-v10.3.0...build-v11.0.0) (2021-04-14)


### ⚠ BREAKING CHANGES

* simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags (#2595)

### Features

* simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags ([#2595](https://www.github.com/netlify/build/issues/2595)) ([c272632](https://www.github.com/netlify/build/commit/c272632db8825f85c07bb05cd90eacb1c8ea2544))

## [10.3.0](https://www.github.com/netlify/build/compare/build-v10.2.7...build-v10.3.0) (2021-04-14)


### Features

* add `--ui-plugins` CLI flag ([#2597](https://www.github.com/netlify/build/issues/2597)) ([7c9273b](https://www.github.com/netlify/build/commit/7c9273b2ed1e2e47b25c6eed0851bc26b1da037a))


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.2.1 ([#2592](https://www.github.com/netlify/build/issues/2592)) ([3fae367](https://www.github.com/netlify/build/commit/3fae3679e78734d2dad9e199870419f22cffd9c9))
* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.3.0 ([#2598](https://www.github.com/netlify/build/issues/2598)) ([5eeed10](https://www.github.com/netlify/build/commit/5eeed1075e0b65aa656be065558668b451896ac7))

### [10.2.7](https://www.github.com/netlify/build/compare/build-v10.2.6...build-v10.2.7) (2021-04-09)


### Bug Fixes

* warning message link ([#2576](https://www.github.com/netlify/build/issues/2576)) ([19a6ba3](https://www.github.com/netlify/build/commit/19a6ba31bc6b2fdce96dc6b48adfc7b8489a18a9))

### [10.2.6](https://www.github.com/netlify/build/compare/build-v10.2.5...build-v10.2.6) (2021-04-09)


### Bug Fixes

* improve lingering processes warning message ([#2467](https://www.github.com/netlify/build/issues/2467)) ([d62099b](https://www.github.com/netlify/build/commit/d62099ba424a70bbcb0b7d239d94f63cc03826b5))

### [10.2.5](https://www.github.com/netlify/build/compare/build-v10.2.4...build-v10.2.5) (2021-04-07)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.2.0 ([#2552](https://www.github.com/netlify/build/issues/2552)) ([26b379e](https://www.github.com/netlify/build/commit/26b379e10feb5ee26c3fd426df05a21c0eafb4f1))

### [10.2.4](https://www.github.com/netlify/build/compare/build-v10.2.3...build-v10.2.4) (2021-04-06)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.1.0 ([#2536](https://www.github.com/netlify/build/issues/2536)) ([fc694be](https://www.github.com/netlify/build/commit/fc694be35a186ef362c3e1e541d0e4c65af7109d))

### [10.2.3](https://www.github.com/netlify/build/compare/build-v10.2.2...build-v10.2.3) (2021-04-06)


### Bug Fixes

* **feature_flag:** remove telemetry feature flag code ([#2535](https://www.github.com/netlify/build/issues/2535)) ([69a48b6](https://www.github.com/netlify/build/commit/69a48b669a38c5492cbd7abed13f5d3bcd832dcd))

### [10.2.2](https://www.github.com/netlify/build/compare/build-v10.2.1...build-v10.2.2) (2021-04-02)


### Bug Fixes

* do not print internal information in the build logs ([#2527](https://www.github.com/netlify/build/issues/2527)) ([8c2ca4a](https://www.github.com/netlify/build/commit/8c2ca4aa406bd7d16ecb2b9d4aabed95c22dceb3))

### [10.2.1](https://www.github.com/netlify/build/compare/build-v10.2.0...build-v10.2.1) (2021-04-01)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.6.0 ([#2167](https://www.github.com/netlify/build/issues/2167)) ([342cc55](https://www.github.com/netlify/build/commit/342cc55e4dd559c4db41f8e475425aef225523a1))
* remove some code ([#2524](https://www.github.com/netlify/build/issues/2524)) ([536b89b](https://www.github.com/netlify/build/commit/536b89bf4f82bf4ffe3155847ef824e56b35a82d))

## [10.2.0](https://www.github.com/netlify/build/compare/build-v10.1.0...build-v10.2.0) (2021-04-01)


### Features

* improve lingering processes warning message, comments and logic ([#2514](https://www.github.com/netlify/build/issues/2514)) ([e619528](https://www.github.com/netlify/build/commit/e61952833dd27fc2bb711505f820dc54248a29b9))

## [10.1.0](https://www.github.com/netlify/build/compare/build-v10.0.0...build-v10.1.0) (2021-04-01)


### Features

* add functions config object to build output ([#2518](https://www.github.com/netlify/build/issues/2518)) ([280834c](https://www.github.com/netlify/build/commit/280834c079995ad3c3b5607f983198fba6b3ac13))

## [10.0.0](https://www.github.com/netlify/build/compare/build-v9.19.1...build-v10.0.0) (2021-03-30)


### ⚠ BREAKING CHANGES

* add functions.directory property (#2496)

### Features

* add functions.directory property ([#2496](https://www.github.com/netlify/build/issues/2496)) ([d72b1d1](https://www.github.com/netlify/build/commit/d72b1d1fb91de3fa23310ed477a6658c5492aed0))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.5.1 ([#2510](https://www.github.com/netlify/build/issues/2510)) ([8614122](https://www.github.com/netlify/build/commit/8614122b8c4cb676cece0780e390ef2b98dc08a1))
* disable 2 Yarn-related tests on Node <14 ([#2511](https://www.github.com/netlify/build/issues/2511)) ([f3b3db2](https://www.github.com/netlify/build/commit/f3b3db254c6c3826ac91b68e284b403cb5bfeedb))

### [9.19.1](https://www.github.com/netlify/build/compare/build-v9.19.0...build-v9.19.1) (2021-03-30)


### Bug Fixes

* **telemetry:** report telemetry errors without impacting builds ([#2501](https://www.github.com/netlify/build/issues/2501)) ([9bc15fe](https://www.github.com/netlify/build/commit/9bc15fec1f66e30a1980e52c55701d32ecc08b2f))

## [9.19.0](https://www.github.com/netlify/build/compare/build-v9.18.0...build-v9.19.0) (2021-03-29)


### Features

* make lingering processes logic work on Windows ([#2500](https://www.github.com/netlify/build/issues/2500)) ([a23f12c](https://www.github.com/netlify/build/commit/a23f12cd25f327f2c757148195dba371702060f3))

## [9.18.0](https://www.github.com/netlify/build/compare/build-v9.17.1...build-v9.18.0) (2021-03-29)


### Features

* improve how lingering processes are filtered out ([#2488](https://www.github.com/netlify/build/issues/2488)) ([4cc25e0](https://www.github.com/netlify/build/commit/4cc25e07d48c6edc2138a2d53cb4d39f0a9f93e1))

### [9.17.1](https://www.github.com/netlify/build/compare/build-v9.17.0...build-v9.17.1) (2021-03-26)


### Bug Fixes

* do not show an empty list of lingering processes ([#2486](https://www.github.com/netlify/build/issues/2486)) ([692a043](https://www.github.com/netlify/build/commit/692a043dbfd966e9f806521a33966025bf745337))

## [9.17.0](https://www.github.com/netlify/build/compare/build-v9.16.0...build-v9.17.0) (2021-03-26)


### Features

* distinguish between warnings and errors in build logs ([#2470](https://www.github.com/netlify/build/issues/2470)) ([73e4998](https://www.github.com/netlify/build/commit/73e4998218d0c243d47e98d2856486466631062c))

## [9.16.0](https://www.github.com/netlify/build/compare/build-v9.15.1...build-v9.16.0) (2021-03-26)


### Features

* improve lingering process message to add bullet points ([#2479](https://www.github.com/netlify/build/issues/2479)) ([9376e26](https://www.github.com/netlify/build/commit/9376e2615f7dcf9db556e8305a076ee477fc5387))

### [9.15.1](https://www.github.com/netlify/build/compare/build-v9.15.0...build-v9.15.1) (2021-03-26)


### Bug Fixes

* do not fail when there are no lingering processes ([#2480](https://www.github.com/netlify/build/issues/2480)) ([0c1eff1](https://www.github.com/netlify/build/commit/0c1eff1d004feab6dbdebb000e38dc49d0093176))

## [9.15.0](https://www.github.com/netlify/build/compare/build-v9.14.1...build-v9.15.0) (2021-03-26)


### Features

* improve lingering processes list ([#2475](https://www.github.com/netlify/build/issues/2475)) ([d805361](https://www.github.com/netlify/build/commit/d805361b505d130acd7b00b3ab3bb70ba29a0ccd))

### [9.14.1](https://www.github.com/netlify/build/compare/build-v9.14.0...build-v9.14.1) (2021-03-26)


### Bug Fixes

* improve lingering processes query ([#2473](https://www.github.com/netlify/build/issues/2473)) ([c7e1c58](https://www.github.com/netlify/build/commit/c7e1c5866a56ce00c47efbc4d8a5cbd3ed896343))

## [9.14.0](https://www.github.com/netlify/build/compare/build-v9.13.2...build-v9.14.0) (2021-03-25)


### Features

* remove legacy code related to netlify-automatic-functions ([#2469](https://www.github.com/netlify/build/issues/2469)) ([88b841a](https://www.github.com/netlify/build/commit/88b841ad02bf48f000b6d6250fb519630db1a23c))
* remove unused warning message ([#2468](https://www.github.com/netlify/build/issues/2468)) ([46a4cba](https://www.github.com/netlify/build/commit/46a4cba90a67d1848655f4e27153e520a513b33f))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.5.0 ([#2465](https://www.github.com/netlify/build/issues/2465)) ([cdd82f3](https://www.github.com/netlify/build/commit/cdd82f31cf2cf7e43ba6fd0faabcccf1e454ccf1))

### [9.13.2](https://www.github.com/netlify/build/compare/v9.13.1...v9.13.2) (2021-03-24)


### Bug Fixes

* **telemetry:** s/user_id/userId/ ([#2463](https://www.github.com/netlify/build/issues/2463)) ([7793424](https://www.github.com/netlify/build/commit/77934242d563af480121372b533c8cb7de278dc7))

### [9.13.1](https://www.github.com/netlify/build/compare/v9.13.0...v9.13.1) (2021-03-23)


### Bug Fixes

* **telemetry:** set a default user_id for production builds ([#2458](https://www.github.com/netlify/build/issues/2458)) ([50bd881](https://www.github.com/netlify/build/commit/50bd881b1805bce9cda7cc676f7231f4675fd906))

## [9.13.0](https://www.github.com/netlify/build/compare/v9.12.0...v9.13.0) (2021-03-23)


### Features

* add skipped plugin_runs ([#2457](https://www.github.com/netlify/build/issues/2457)) ([0d4f3fc](https://www.github.com/netlify/build/commit/0d4f3fc2d0f961651c6671739436ea97b9d831fd))

## [9.12.0](https://www.github.com/netlify/build/compare/v9.11.4...v9.12.0) (2021-03-23)


### Features

* move core plugins logic ([#2454](https://www.github.com/netlify/build/issues/2454)) ([35e7fa2](https://www.github.com/netlify/build/commit/35e7fa26b4d4280e53dc97b35a520ed4c0219fec))
* move plugins initialization code ([#2451](https://www.github.com/netlify/build/issues/2451)) ([ffc4a8b](https://www.github.com/netlify/build/commit/ffc4a8bd23b05d6150af90b4811fabed61466a01))

### [9.11.4](https://www.github.com/netlify/build/compare/v9.11.3...v9.11.4) (2021-03-22)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.6 ([#2449](https://www.github.com/netlify/build/issues/2449)) ([f7613c3](https://www.github.com/netlify/build/commit/f7613c320d223833d853c511a7d8ea3de8bdcc83))

### [9.11.3](https://www.github.com/netlify/build/compare/v9.11.2...v9.11.3) (2021-03-22)


### Bug Fixes

* **telemetry:** wait for telemetry completion ([#2438](https://www.github.com/netlify/build/issues/2438)) ([ae0b3d5](https://www.github.com/netlify/build/commit/ae0b3d5236a0b4ab341e357d8ddd47ac3491474b))

### [9.11.2](https://www.github.com/netlify/build/compare/v9.11.1...v9.11.2) (2021-03-19)


### Bug Fixes

* add exit event handler to prevent invalid exit code 0 ([#2432](https://www.github.com/netlify/build/issues/2432)) ([361ed2d](https://www.github.com/netlify/build/commit/361ed2d67b0ae05a5e71692da388f68518188b92))

### [9.11.1](https://www.github.com/netlify/build/compare/v9.11.0...v9.11.1) (2021-03-19)


### Bug Fixes

* reinstate notice about bundling errors and warnings ([#2437](https://www.github.com/netlify/build/issues/2437)) ([b8571d8](https://www.github.com/netlify/build/commit/b8571d8dd0122a90edd7f0f512c3d77505cb42ca))

## [9.11.0](https://www.github.com/netlify/build/compare/v9.10.2...v9.11.0) (2021-03-18)


### Features

* add functions configuration API to @netlify/build ([#2414](https://www.github.com/netlify/build/issues/2414)) ([7aa8173](https://www.github.com/netlify/build/commit/7aa8173f9d0bf7553ed3326c5b4aca1ba34d5cda))
* add functions configuration API to @netlify/config ([#2390](https://www.github.com/netlify/build/issues/2390)) ([654d32e](https://www.github.com/netlify/build/commit/654d32eb49bea33816b1adde02f13f0843db9cdd))


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.4.3 ([#2436](https://www.github.com/netlify/build/issues/2436)) ([1d96d65](https://www.github.com/netlify/build/commit/1d96d65c073439b5e349963e357780ced48ec59a))

### [9.10.2](https://www.github.com/netlify/build/compare/v9.10.1...v9.10.2) (2021-03-17)


### Bug Fixes

* rename internal variable ([#2425](https://www.github.com/netlify/build/issues/2425)) ([614b5c7](https://www.github.com/netlify/build/commit/614b5c73422b0ad780038c09410f5e17242d1922))

### [9.10.1](https://www.github.com/netlify/build/compare/v9.10.0...v9.10.1) (2021-03-16)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.4.2 ([#2423](https://www.github.com/netlify/build/issues/2423)) ([475ad30](https://www.github.com/netlify/build/commit/475ad302370777741675bb31b7aaa8c62aa58a49))

## [9.10.0](https://www.github.com/netlify/build/compare/v9.9.7...v9.10.0) (2021-03-16)


### Features

* add an error type for Functions bundling user errors ([#2420](https://www.github.com/netlify/build/issues/2420)) ([9fe8911](https://www.github.com/netlify/build/commit/9fe8911f22ad88ed38e22734cbcf687b9663fa49))
* add warning messages when using plugins that are too recent and incompatible ([#2422](https://www.github.com/netlify/build/issues/2422)) ([30bc126](https://www.github.com/netlify/build/commit/30bc1264e590b25a13cb2c53133589721fe45127))

### [9.9.7](https://www.github.com/netlify/build/compare/v9.9.6...v9.9.7) (2021-03-16)


### Bug Fixes

* build process never exits ([#2415](https://www.github.com/netlify/build/issues/2415)) ([d394b24](https://www.github.com/netlify/build/commit/d394b2410bb4d52053b8a922dfc8075933a3da62))

### [9.9.7](https://www.github.com/netlify/build/compare/v9.9.6...v9.9.7) (2021-03-15)


### Bug Fixes

* fix build process never exits ([#2415](https://www.github.com/netlify/build/issues/2415)) ([d394b2410](https://www.github.com/netlify/build/commit/d394b2410bb4d52053b8a922dfc8075933a3da62))

### [9.9.6](https://www.github.com/netlify/build/compare/v9.9.5...v9.9.6) (2021-03-15)


### Bug Fixes

* **compatibility:** properly handle dependency ranges ([#2408](https://www.github.com/netlify/build/issues/2408)) ([0d14572](https://www.github.com/netlify/build/commit/0d14572d4a6c826b4289b4630b8b04507075d3f4))
* **deps:** update dependency @netlify/plugins-list to ^2.4.1 ([#2404](https://www.github.com/netlify/build/issues/2404)) ([14cee2d](https://www.github.com/netlify/build/commit/14cee2d4075c998bf41697655ac572d4e1191b14))

### [9.9.5](https://www.github.com/netlify/build/compare/v9.9.4...v9.9.5) (2021-03-12)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.7.1 ([#2396](https://www.github.com/netlify/build/issues/2396)) ([b4c070f](https://www.github.com/netlify/build/commit/b4c070fa8ac1406b3f489e5ddb038e4ecbe1f68c))

### [9.9.4](https://www.github.com/netlify/build/compare/v9.9.3...v9.9.4) (2021-03-11)


### Bug Fixes

* fix error handling when importing a non-existing local file ([#2394](https://www.github.com/netlify/build/issues/2394)) ([881448b](https://www.github.com/netlify/build/commit/881448b9ba6460086c653e7de40e6866f709b979))

### [9.9.3](https://www.github.com/netlify/build/compare/v9.9.2...v9.9.3) (2021-03-11)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.7.0 ([#2391](https://www.github.com/netlify/build/issues/2391)) ([0c1c1dc](https://www.github.com/netlify/build/commit/0c1c1dcce06fc511ba2c26bf2fb52b91e202b670))

### [9.9.2](https://www.github.com/netlify/build/compare/v9.9.1...v9.9.2) (2021-03-10)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.6.0 ([#2384](https://www.github.com/netlify/build/issues/2384)) ([4311b02](https://www.github.com/netlify/build/commit/4311b02530807eee9b83f063923f0d1932c9ec85))

### [9.9.1](https://www.github.com/netlify/build/compare/v9.9.0...v9.9.1) (2021-03-09)


### Bug Fixes

* fix `host` option in `@netlify/config` ([#2379](https://www.github.com/netlify/build/issues/2379)) ([64d8386](https://www.github.com/netlify/build/commit/64d8386daf5f1f069ea95fb655a593b05f8f8107))
* fix `semver` version with Node 8 ([#2362](https://www.github.com/netlify/build/issues/2362)) ([c72ecd8](https://www.github.com/netlify/build/commit/c72ecd8c8525e269180b427489991d9ec3238022))

## [9.9.0](https://www.github.com/netlify/build/compare/v9.8.6...v9.9.0) (2021-03-08)


### Features

* allow passing Netlify API host to Netlify API client ([#2288](https://www.github.com/netlify/build/issues/2288)) ([5529b1d](https://www.github.com/netlify/build/commit/5529b1dc92eccb6a932f80b006e83acfa0034413))

### [9.8.6](https://www.github.com/netlify/build/compare/v9.8.5...v9.8.6) (2021-03-08)


### Bug Fixes

* telemetry ([#2349](https://www.github.com/netlify/build/issues/2349)) ([3ee7ebf](https://www.github.com/netlify/build/commit/3ee7ebf08a2ac9e21d19f64ff63d7ce20ec031b9))

### [9.8.5](https://www.github.com/netlify/build/compare/v9.8.4...v9.8.5) (2021-03-08)


### Bug Fixes

* add dependency error messages for esbuild ([#2361](https://www.github.com/netlify/build/issues/2361)) ([9df783a](https://www.github.com/netlify/build/commit/9df783ace59371e3ada566e713aaabe05afff733))

### [9.8.4](https://www.github.com/netlify/build/compare/v9.8.3...v9.8.4) (2021-03-05)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.4.0 ([#2363](https://www.github.com/netlify/build/issues/2363)) ([2e5286d](https://www.github.com/netlify/build/commit/2e5286d4b68a76d4cc4235c1f8337372521ec3ef))

### [9.8.3](https://www.github.com/netlify/build/compare/v9.8.2...v9.8.3) (2021-03-04)


### Bug Fixes

* fix esbuild error reporting ([#2358](https://www.github.com/netlify/build/issues/2358)) ([348d43b](https://www.github.com/netlify/build/commit/348d43bda2698dbdbb2a441a08038e48fadf6715))

### [9.8.2](https://www.github.com/netlify/build/compare/v9.8.1...v9.8.2) (2021-03-04)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^2.3.0 ([#2356](https://www.github.com/netlify/build/issues/2356)) ([e4f79e6](https://www.github.com/netlify/build/commit/e4f79e63e786db9e6a511bb4f24297dfc3e0f29d))

### [9.8.1](https://www.github.com/netlify/build/compare/v9.8.0...v9.8.1) (2021-03-04)


### Bug Fixes

* **deps:** update netlify packages ([#2352](https://www.github.com/netlify/build/issues/2352)) ([c45bdc8](https://www.github.com/netlify/build/commit/c45bdc8e6165751b4294993426ff32e366f0c55a))

## [9.8.0](https://www.github.com/netlify/build/compare/v9.7.1...v9.8.0) (2021-03-04)


### Features

* stop printing output from esbuild ([#2350](https://www.github.com/netlify/build/issues/2350)) ([d225592](https://www.github.com/netlify/build/commit/d225592203a0ebdd8e48ad54ed9da5087991f888))

### [9.7.1](https://www.github.com/netlify/build/compare/v9.7.0...v9.7.1) (2021-03-03)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.4.3 ([#2346](https://www.github.com/netlify/build/issues/2346)) ([76607df](https://www.github.com/netlify/build/commit/76607dff6de5594d2ebbabfb824737d2ce92e902))

## [9.7.0](https://www.github.com/netlify/build/compare/v9.6.0...v9.7.0) (2021-03-03)


### Features

* add `compatibility[*].siteDependencies` ([#2322](https://www.github.com/netlify/build/issues/2322)) ([9b1bc5d](https://www.github.com/netlify/build/commit/9b1bc5d4883a5301803cc69f863f1491e92857ed))
* do not sort `compatibility` field ([#2336](https://www.github.com/netlify/build/issues/2336)) ([455477f](https://www.github.com/netlify/build/commit/455477fc4af7b9d720588d4e4b601e388303a15b))
* improve `migrationGuide` test ([#2337](https://www.github.com/netlify/build/issues/2337)) ([9776923](https://www.github.com/netlify/build/commit/9776923855ae0baa767ac92ae39786ce77d3e92b))


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.4.2 ([#2341](https://www.github.com/netlify/build/issues/2341)) ([cbba54d](https://www.github.com/netlify/build/commit/cbba54dea815e61fe40e048de664035fd06df36d))

## [9.6.0](https://www.github.com/netlify/build/compare/build-v9.5.0...v9.6.0) (2021-03-01)


### Features

* improve tests related to `compatibility` ([#2321](https://www.github.com/netlify/build/issues/2321)) ([a5bfb6b](https://www.github.com/netlify/build/commit/a5bfb6b526a4155c5d6f912b03dfff845f5cb4ab))
* print migration guides ([#2320](https://www.github.com/netlify/build/issues/2320)) ([a701222](https://www.github.com/netlify/build/commit/a7012223a0e45373cfbdb278180c88a7971324a5))

## [9.5.0](https://www.github.com/netlify/build/compare/v9.4.0...v9.5.0) (2021-02-26)


### Features

* add `compatibility[*].nodeVersion` ([#2315](https://www.github.com/netlify/build/issues/2315)) ([8df8c34](https://www.github.com/netlify/build/commit/8df8c3481b8b7009e4ed367844106913463dd0a0))
* add feature flag for esbuild rollout ([#2308](https://www.github.com/netlify/build/issues/2308)) ([eef6428](https://www.github.com/netlify/build/commit/eef64288fed481c6940dc86fec5a61cbd953d5de))
* print warnings when using `compatibility` versions ([#2319](https://www.github.com/netlify/build/issues/2319)) ([9beea68](https://www.github.com/netlify/build/commit/9beea68ad168a454b214a149a466d71fe403b74a))
* turn `compatibility` field into an array ([#2318](https://www.github.com/netlify/build/issues/2318)) ([77243ef](https://www.github.com/netlify/build/commit/77243efaf93924501d2e986267b3b53aa5475153))

### [9.4.0](https://www.github.com/netlify/build/compare/v9.3.0...v9.4.0) (2021-02-25)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.4.0 ([#2312](https://www.github.com/netlify/build/issues/2312)) ([1dbf0a1](https://www.github.com/netlify/build/commit/1dbf0a1463e33fee4a69e90fbf5d128bfdc22081))

## [9.3.0](https://www.github.com/netlify/build/compare/v9.2.0...v9.3.0) (2021-02-25)


### Features

* add `plugin.compatibility` field ([#2310](https://www.github.com/netlify/build/issues/2310)) ([80525cb](https://www.github.com/netlify/build/commit/80525cbbc8ba38fc46daad0d40703d5a69c27dbc))
* allow `version` in `plugins.json` to be an object ([#2307](https://www.github.com/netlify/build/issues/2307)) ([ce56878](https://www.github.com/netlify/build/commit/ce5687804759539ec43840089822fb9629fbc1fd))
* move where the plugin Node.js version is resolved ([#2311](https://www.github.com/netlify/build/issues/2311)) ([5ada384](https://www.github.com/netlify/build/commit/5ada384d644661dca9b481d91b7f829acc9b7b00))

## [9.2.0](https://www.github.com/netlify/build/compare/v9.1.4...v9.2.0) (2021-02-23)


### Features

* print warnings for outdated plugins ([#2289](https://www.github.com/netlify/build/issues/2289)) ([d8fb63d](https://www.github.com/netlify/build/commit/d8fb63d73881ba5ae2e21961f07ce8e3228e7382))

### [9.1.4](https://www.github.com/netlify/build/compare/v9.1.3...v9.1.4) (2021-02-22)


### Bug Fixes

* **deps:** update netlify packages ([#2302](https://www.github.com/netlify/build/issues/2302)) ([dbbbeea](https://www.github.com/netlify/build/commit/dbbbeea693c2353d8014a3a74d6b69abfabcebe2))

### [9.1.3](https://www.github.com/netlify/build/compare/v9.1.2...v9.1.3) (2021-02-18)


### Bug Fixes

* fix `files` in `package.json` with `npm@7` ([#2278](https://www.github.com/netlify/build/issues/2278)) ([e9df064](https://www.github.com/netlify/build/commit/e9df0645f3083a0bb141c8b5b6e474ed4e27dbe9))

### [9.1.2](https://www.github.com/netlify/build/compare/v9.1.1...v9.1.2) (2021-02-11)


### Bug Fixes

* improve Bugsnag reporting of upload errors ([#2267](https://www.github.com/netlify/build/issues/2267)) ([c03985c](https://www.github.com/netlify/build/commit/c03985c83ff0f426f59a85a42f039e0522bc83d5))

### [9.1.1](https://www.github.com/netlify/build/compare/v9.1.0...v9.1.1) (2021-02-10)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v2.3.0 ([#2264](https://www.github.com/netlify/build/issues/2264)) ([40d122d](https://www.github.com/netlify/build/commit/40d122d6e722e55f1925f4179999d0d7ad065999))

## [9.1.0](https://www.github.com/netlify/build/compare/v9.0.1...v9.1.0) (2021-02-09)


### Features

* pass esbuild parameters to ZISI ([#2256](https://www.github.com/netlify/build/issues/2256)) ([2483f72](https://www.github.com/netlify/build/commit/2483f72660ac2306fd817b6fa330e28e6709dfbb))

### [9.0.1](https://www.github.com/netlify/build/compare/v9.0.0...v9.0.1) (2021-02-09)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v2.2.0 ([#2258](https://www.github.com/netlify/build/issues/2258)) ([6faf36b](https://www.github.com/netlify/build/commit/6faf36b24d66f88f93dc96d0190a80af459ad5f4))

## [9.0.0](https://www.github.com/netlify/build/compare/v8.4.0...v9.0.0) (2021-02-04)


### ⚠ BREAKING CHANGES

* use netlify/functions as the default functions directory (#2188)

### Features

* use netlify/functions as the default functions directory ([#2188](https://www.github.com/netlify/build/issues/2188)) ([84e1e07](https://www.github.com/netlify/build/commit/84e1e075b5efd7ca26ccaf2531511e7737d97f1f))

## [8.4.0](https://www.github.com/netlify/build/compare/v8.3.5...v8.4.0) (2021-02-03)


### Features

* remove deploy feature flag ([#2246](https://www.github.com/netlify/build/issues/2246)) ([cbeac56](https://www.github.com/netlify/build/commit/cbeac5653c924265a61d84485e41c0e76427db31))

### [8.3.5](https://www.github.com/netlify/build/compare/v8.3.4...v8.3.5) (2021-02-03)


### Bug Fixes

* **deps:** force a release for [#2244](https://www.github.com/netlify/build/issues/2244) and bump zip-it-and-ship-it ([#2245](https://www.github.com/netlify/build/issues/2245)) ([25787c2](https://www.github.com/netlify/build/commit/25787c2cf134fbbd8029a142512ff314cbab1951))

### [8.3.4](https://www.github.com/netlify/build/compare/v8.3.3...v8.3.4) (2021-02-01)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to v1.11.3 ([#2235](https://www.github.com/netlify/build/issues/2235)) ([27e2a7f](https://www.github.com/netlify/build/commit/27e2a7faf95262198ec1ae9ad2e1c14f5b5b5561))
* **deps:** update dependency moize to v6 ([#2231](https://www.github.com/netlify/build/issues/2231)) ([e34454c](https://www.github.com/netlify/build/commit/e34454c633bbc541c4074bdaa15361c84f0c8f04))

### [8.3.3](https://www.github.com/netlify/build/compare/v8.3.2...v8.3.3) (2021-01-29)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.3 ([#2227](https://www.github.com/netlify/build/issues/2227)) ([301fe88](https://www.github.com/netlify/build/commit/301fe885ed1a896e7b0766fcc85386510ff9f670))

### [8.3.2](https://www.github.com/netlify/build/compare/v8.3.1...v8.3.2) (2021-01-29)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.2 ([#2222](https://www.github.com/netlify/build/issues/2222)) ([47adf7a](https://www.github.com/netlify/build/commit/47adf7af089f308b9abe7709675bc84b8f179809))

### [8.3.1](https://www.github.com/netlify/build/compare/v8.3.0...v8.3.1) (2021-01-26)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.1 ([#2215](https://www.github.com/netlify/build/issues/2215)) ([f6e191e](https://www.github.com/netlify/build/commit/f6e191edbb3bf43ac1b9d75b7e0ab62fabd2062f))

## [8.3.0](https://www.github.com/netlify/build/compare/v8.2.0...v8.3.0) (2021-01-26)


### Features

* add back `process.env` plugins communication ([#2212](https://www.github.com/netlify/build/issues/2212)) ([d815ef9](https://www.github.com/netlify/build/commit/d815ef9cfb68af90691f705b0c21abb7415fd5b9))

## [8.2.0](https://www.github.com/netlify/build/compare/v8.1.1...v8.2.0) (2021-01-25)


### Features

* run deploy logic as core instead of plugin ([#2192](https://www.github.com/netlify/build/issues/2192)) ([157767b](https://www.github.com/netlify/build/commit/157767b9e5e3857344efd16def9495e7d8bff939))

### [8.1.1](https://www.github.com/netlify/build/compare/build-v8.1.0...v8.1.1) (2021-01-25)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.0 ([#2197](https://www.github.com/netlify/build/issues/2197)) ([8ed28f9](https://www.github.com/netlify/build/commit/8ed28f9ccbe991f98cf8dcf2acde4c19f01c246d))

### [8.0.6](https://www.github.com/netlify/build/compare/build-v8.0.5...v8.0.6) (2021-01-15)


### Bug Fixes

* **deps:** update dependency @netlify/plugin-edge-handlers to v1.11.1 ([#2178](https://www.github.com/netlify/build/issues/2178)) ([5941943](https://www.github.com/netlify/build/commit/594194390aae7e43b21e437ddd735ed9b0df55e1))
* **windows:** show windows path separator in netlify dir warning message ([#2182](https://www.github.com/netlify/build/issues/2182)) ([02b497f](https://www.github.com/netlify/build/commit/02b497fb75a1d3b4c3d10df4cbc3c137c711b5bd))
