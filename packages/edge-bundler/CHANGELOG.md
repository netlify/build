# Changelog

## [4.1.0](https://github.com/netlify/edge-bundler/compare/v4.0.2...v4.1.0) (2022-11-16)


### Features

* add support for custom layers ([#198](https://github.com/netlify/edge-bundler/issues/198)) ([ec3848b](https://github.com/netlify/edge-bundler/commit/ec3848be0851f75ebddc78d952469fb752ecbeee))

## [4.0.2](https://github.com/netlify/edge-bundler/compare/v4.0.1...v4.0.2) (2022-11-15)


### Bug Fixes

* update to newer version of bootstrap: 636e17c6f5c1ed0008150054 ([#196](https://github.com/netlify/edge-bundler/issues/196)) ([aa980a0](https://github.com/netlify/edge-bundler/commit/aa980a06130bfa9e9423b1a2f76baadba05fc628))

## [4.0.1](https://github.com/netlify/edge-bundler/compare/v4.0.0...v4.0.1) (2022-11-14)


### Bug Fixes

* log when module loading fails after max tries ([#193](https://github.com/netlify/edge-bundler/issues/193)) ([b25b4db](https://github.com/netlify/edge-bundler/commit/b25b4dbc0e59aade01fd74b23daf633acce3e476))

## [4.0.0](https://github.com/netlify/edge-bundler/compare/v3.1.1...v4.0.0) (2022-11-10)


### ⚠ BREAKING CHANGES

* replace `mode` property with `cache` (#190)

### Features

* replace `mode` property with `cache` ([#190](https://github.com/netlify/edge-bundler/issues/190)) ([5ca08c2](https://github.com/netlify/edge-bundler/commit/5ca08c278d27e77679b98562e6fb5cefc3901791))

## [3.1.1](https://github.com/netlify/edge-bundler/compare/v3.1.0...v3.1.1) (2022-11-04)


### Bug Fixes

* remove disallow-code-generation-from-strings flag ([#177](https://github.com/netlify/edge-bundler/issues/177)) ([d344992](https://github.com/netlify/edge-bundler/commit/d34499214be4311e28b9b2292b9ba714cd01c06b))

## [3.1.0](https://github.com/netlify/edge-bundler/compare/v3.0.1...v3.1.0) (2022-10-28)


### Features

* get config in server mode ([#175](https://github.com/netlify/edge-bundler/issues/175)) ([ea47d4e](https://github.com/netlify/edge-bundler/commit/ea47d4e569faf8bb5c9b3afedb4eab403b1ba598))

## [3.0.1](https://github.com/netlify/edge-bundler/compare/v3.0.0...v3.0.1) (2022-10-26)


### Bug Fixes

* **deps:** update dependency del to v7 ([#172](https://github.com/netlify/edge-bundler/issues/172)) ([6e12a4a](https://github.com/netlify/edge-bundler/commit/6e12a4ac87077e09a95dd92f20057d80eb33429a))
* run `config` export with `--allow-env` ([#174](https://github.com/netlify/edge-bundler/issues/174)) ([6020add](https://github.com/netlify/edge-bundler/commit/6020add051349ef086f1833ec2a7242c037bbb32))

## [3.0.0](https://github.com/netlify/edge-bundler/compare/v2.9.0...v3.0.0) (2022-10-24)


### ⚠ BREAKING CHANGES

* drop support for Node.js 12 and remove auto-labeling (#167)

### Bug Fixes

* drop support for Node.js 12 and remove auto-labeling ([#167](https://github.com/netlify/edge-bundler/issues/167)) ([53a6029](https://github.com/netlify/edge-bundler/commit/53a60290ac11308c640ac2e180c98b19a346a3e0))

## [2.9.0](https://github.com/netlify/edge-bundler/compare/v2.8.0...v2.9.0) (2022-10-20)


### Features

* add support for post-cache routes ([#165](https://github.com/netlify/edge-bundler/issues/165)) ([c7e530b](https://github.com/netlify/edge-bundler/commit/c7e530b910ba15e982fe5d8d1dd4324890687f24))


### Bug Fixes

* use import maps in config evaluation ([#166](https://github.com/netlify/edge-bundler/issues/166)) ([8e5ab76](https://github.com/netlify/edge-bundler/commit/8e5ab76ff01217068668e9c65d6cd9f6d2936029))

## [2.8.0](https://github.com/netlify/edge-bundler/compare/v2.7.0...v2.8.0) (2022-10-17)


### Features

* support JSX and TSX in edge functions ([#161](https://github.com/netlify/edge-bundler/issues/161)) ([f1a9abb](https://github.com/netlify/edge-bundler/commit/f1a9abbb156ce45f784d2ce4bf7af3dc42daf21c))


### Bug Fixes

* **deps:** update dependency semver to v7.3.8 ([#155](https://github.com/netlify/edge-bundler/issues/155)) ([74b6afe](https://github.com/netlify/edge-bundler/commit/74b6afeb6604cb39c7d3a6e19b36c77fced335e4))

## [2.7.0](https://github.com/netlify/edge-bundler/compare/v2.6.0...v2.7.0) (2022-10-07)


### Features

* vendor eszip Deno module ([#141](https://github.com/netlify/edge-bundler/issues/141)) ([cdec76c](https://github.com/netlify/edge-bundler/commit/cdec76c3faa65cfcbb8ea133fd7d3efc2fa8dd62))

## [2.6.0](https://github.com/netlify/edge-bundler/compare/v2.5.0...v2.6.0) (2022-10-03)


### Features

* Update bootstrap url to latest version ([#149](https://github.com/netlify/edge-bundler/issues/149)) ([04cce91](https://github.com/netlify/edge-bundler/commit/04cce91414af11aa7480096c3de56605ece305ab))

## [2.5.0](https://github.com/netlify/edge-bundler/compare/v2.4.0...v2.5.0) (2022-10-03)


### Features

* allow display name in manifest ([#140](https://github.com/netlify/edge-bundler/issues/140)) ([0fc04e9](https://github.com/netlify/edge-bundler/commit/0fc04e9dcd3fc2e41e15b1e178d2209d658e7dfc))

## [2.4.0](https://github.com/netlify/edge-bundler/compare/v2.3.1...v2.4.0) (2022-10-03)


### Features

* update bootstrap latest to use latest version of bootstrap ([#146](https://github.com/netlify/edge-bundler/issues/146)) ([9aef2f7](https://github.com/netlify/edge-bundler/commit/9aef2f7a1791d83617dddc6c6ff37b44b3e2ef78))

## [2.3.1](https://github.com/netlify/edge-bundler/compare/v2.3.0...v2.3.1) (2022-10-03)


### Bug Fixes

* use `allow-net` flag to run `config` function ([#144](https://github.com/netlify/edge-bundler/issues/144)) ([57d0edb](https://github.com/netlify/edge-bundler/commit/57d0edb52a63537b8dbdd0eaf50ef88689c6387f))

## [2.3.0](https://github.com/netlify/edge-bundler/compare/v2.2.0...v2.3.0) (2022-09-30)


### Features

* add support for `config` export ([#133](https://github.com/netlify/edge-bundler/issues/133)) ([adb4f82](https://github.com/netlify/edge-bundler/commit/adb4f829d57e9a7d39741444b7f214f96d739f2b))

## [2.2.0](https://github.com/netlify/edge-bundler/compare/v2.1.0...v2.2.0) (2022-09-20)


### Features

* add tests for `serve` functionality ([#116](https://github.com/netlify/edge-bundler/issues/116)) ([ed001bc](https://github.com/netlify/edge-bundler/commit/ed001bcc643f249976dcf8a1d8ff1bba14619f6c))


### Bug Fixes

* require version 1.22.0 of the Deno CLI ([#132](https://github.com/netlify/edge-bundler/issues/132)) ([8c15ca7](https://github.com/netlify/edge-bundler/commit/8c15ca72427e26d46b9c6c19de8429fda2dccc4c))

## [2.1.0](https://github.com/netlify/edge-bundler/compare/v2.0.5...v2.1.0) (2022-09-19)


### Features

* add `functions` level to `metadata` object ([#129](https://github.com/netlify/edge-bundler/issues/129)) ([45cf3b2](https://github.com/netlify/edge-bundler/commit/45cf3b2ee2b70c2e1a97f589e99ed1fdb4644312))
* export `metadata` object in local stage 2 ([#126](https://github.com/netlify/edge-bundler/issues/126)) ([ed7503a](https://github.com/netlify/edge-bundler/commit/ed7503a2a16540db9e8cc378c8e628f883d36077))
* export `metadata` object in stage 2 ([#122](https://github.com/netlify/edge-bundler/issues/122)) ([99214c7](https://github.com/netlify/edge-bundler/commit/99214c7e49d2819c19c3b324083640bd240b22d7))


### Bug Fixes

* run `deno` with `--no-config` ([#128](https://github.com/netlify/edge-bundler/issues/128)) ([c5ee57c](https://github.com/netlify/edge-bundler/commit/c5ee57c55dfffd85c28930937418aceaf0104ad5))

## [2.0.5](https://github.com/netlify/edge-bundler/compare/v2.0.4...v2.0.5) (2022-09-14)


### Bug Fixes

* convert file URL to path ([#123](https://github.com/netlify/edge-bundler/issues/123)) ([ff78c96](https://github.com/netlify/edge-bundler/commit/ff78c9637c3279d3a339abda82cc5a30ae3b452a))

## [2.0.4](https://github.com/netlify/edge-bundler/compare/v2.0.3...v2.0.4) (2022-09-14)


### Bug Fixes

* use right location for Deno bundler ([#120](https://github.com/netlify/edge-bundler/issues/120)) ([a8a9f5d](https://github.com/netlify/edge-bundler/commit/a8a9f5d213d45ab8200e08ee6b2159a8b2c2351f))

## [2.0.3](https://github.com/netlify/edge-bundler/compare/v2.0.2...v2.0.3) (2022-09-14)


### Bug Fixes

* fix `getPackageVersion` ([#118](https://github.com/netlify/edge-bundler/issues/118)) ([d57335a](https://github.com/netlify/edge-bundler/commit/d57335a1f91289bc4b18881b50f1fab705b68ae2))

## [2.0.2](https://github.com/netlify/edge-bundler/compare/v2.0.1...v2.0.2) (2022-09-14)


### Bug Fixes

* create shared directory ([#117](https://github.com/netlify/edge-bundler/issues/117)) ([9a21c18](https://github.com/netlify/edge-bundler/commit/9a21c1826395fe42e8e443931773a4c7f0b17108))
* **deps:** update dependency uuid to v9 ([#111](https://github.com/netlify/edge-bundler/issues/111)) ([0525b27](https://github.com/netlify/edge-bundler/commit/0525b27743f5203cd274890e02718a8eda0dd93f))

## [2.0.1](https://github.com/netlify/edge-bundler/compare/v2.0.0...v2.0.1) (2022-09-13)


### Bug Fixes

* move `stage2.ts` to `src` ([#113](https://github.com/netlify/edge-bundler/issues/113)) ([0d14125](https://github.com/netlify/edge-bundler/commit/0d141253bdda65ba9bc31f5452b4c0a915f14416))

## [2.0.0](https://github.com/netlify/edge-bundler/compare/v1.14.1...v2.0.0) (2022-09-13)


### ⚠ BREAKING CHANGES

* `importMaps` now expects a `baseURL` containing the URL of the import map file

### Features

* add support for import maps with ESZIP ([#109](https://github.com/netlify/edge-bundler/issues/109)) ([19031eb](https://github.com/netlify/edge-bundler/commit/19031eb4923fd37de0c004b67c542ea8b1aff374))

## [1.14.1](https://github.com/netlify/edge-bundler/compare/v1.14.0...v1.14.1) (2022-08-26)


### Bug Fixes

* fix deno download retry logic ([#104](https://github.com/netlify/edge-bundler/issues/104)) ([270290c](https://github.com/netlify/edge-bundler/commit/270290c9bd4ec1734522f24f3c17db93d83ecc48))

## [1.14.0](https://github.com/netlify/edge-bundler/compare/v1.13.0...v1.14.0) (2022-08-22)


### Features

* inline stage 2 ESZIP bundler ([#102](https://github.com/netlify/edge-bundler/issues/102)) ([5df5291](https://github.com/netlify/edge-bundler/commit/5df529197e7feea8b5fb80658f002ad267d74da3))

## [1.13.0](https://github.com/netlify/edge-bundler/compare/v1.12.1...v1.13.0) (2022-08-18)


### Features

* update edge-bundler-bootstrap ([#96](https://github.com/netlify/edge-bundler/issues/96)) ([5bc3973](https://github.com/netlify/edge-bundler/commit/5bc39734d63eed506c07fab83f821c526b06b61c))


### Bug Fixes

* implement retries for Deno CLI download and additional logging ([#100](https://github.com/netlify/edge-bundler/issues/100)) ([489cbd3](https://github.com/netlify/edge-bundler/commit/489cbd3fbc1cadaa0aa1da288204b6534705ed3a))

## [1.12.1](https://github.com/netlify/edge-bundler/compare/v1.12.0...v1.12.1) (2022-08-10)


### Bug Fixes

* ensure PATH is always set ([#93](https://github.com/netlify/edge-bundler/issues/93)) ([2f71c57](https://github.com/netlify/edge-bundler/commit/2f71c5752d7ef869d3bf106b78c26bebfd9e32b2))

## [1.12.0](https://github.com/netlify/edge-bundler/compare/v1.11.0...v1.12.0) (2022-08-09)


### Features

* update bootstrap url ([#84](https://github.com/netlify/edge-bundler/issues/84)) ([af95e7d](https://github.com/netlify/edge-bundler/commit/af95e7d55979984eccb15a5e1497ae738ad71a1c))

## [1.11.0](https://github.com/netlify/edge-bundler/compare/v1.10.0...v1.11.0) (2022-08-09)


### Features

* allow setting environment variables and disable extending in DenoServer ([#82](https://github.com/netlify/edge-bundler/issues/82)) ([3b9af3d](https://github.com/netlify/edge-bundler/commit/3b9af3dc0bf39a74adad1d96574aae8ba0adb2e8))

## [1.10.0](https://github.com/netlify/edge-bundler/compare/v1.9.0...v1.10.0) (2022-08-08)


### Features

* use default logger in DenoBridge ([#89](https://github.com/netlify/edge-bundler/issues/89)) ([50b91e7](https://github.com/netlify/edge-bundler/commit/50b91e7298f0a9fddff4bb9d662e3fa1b1fd81f9))

## [1.9.0](https://github.com/netlify/edge-bundler/compare/v1.8.0...v1.9.0) (2022-08-04)


### Features

* add support for system logger ([#85](https://github.com/netlify/edge-bundler/issues/85)) ([9188bd7](https://github.com/netlify/edge-bundler/commit/9188bd70887d0abb868cca03f18cdd538d8ba7a2))

## [1.8.0](https://github.com/netlify/edge-bundler/compare/v1.7.0...v1.8.0) (2022-07-29)


### Features

* add support for `denoDir` parameter ([#80](https://github.com/netlify/edge-bundler/issues/80)) ([b5dd4a7](https://github.com/netlify/edge-bundler/commit/b5dd4a71ccddefff5cf7c7d69ee71128f5d9e6ee))

## [1.7.0](https://github.com/netlify/edge-bundler/compare/v1.6.0...v1.7.0) (2022-07-22)


### Features

* accept `basePath` parameter ([#76](https://github.com/netlify/edge-bundler/issues/76)) ([a1c95cc](https://github.com/netlify/edge-bundler/commit/a1c95cc1e8013f9f37a11db40ed937e58897264f))

## [1.6.0](https://github.com/netlify/edge-bundler/compare/v1.5.0...v1.6.0) (2022-07-15)


### Features

* add support for import maps when bundling ESZIP ([#72](https://github.com/netlify/edge-bundler/issues/72)) ([47c618c](https://github.com/netlify/edge-bundler/commit/47c618cba7514224c777cfe4408f120721612adc))

## [1.5.0](https://github.com/netlify/edge-bundler/compare/v1.4.3...v1.5.0) (2022-07-01)


### Features

* refresh types on Deno CLI cache ([#66](https://github.com/netlify/edge-bundler/issues/66)) ([534ea80](https://github.com/netlify/edge-bundler/commit/534ea8022289d3ca4861931659bfa4f6d4a552ca))

## [1.4.3](https://github.com/netlify/edge-bundler/compare/v1.4.2...v1.4.3) (2022-06-30)


### Bug Fixes

* improve user/system error boundaries ([#63](https://github.com/netlify/edge-bundler/issues/63)) ([a7ac87a](https://github.com/netlify/edge-bundler/commit/a7ac87a4f29964097dd0489b0d5c636530d71fda))

## [1.4.2](https://github.com/netlify/edge-bundler/compare/v1.4.1...v1.4.2) (2022-06-30)


### Bug Fixes

* await lifecycle hooks as they might return promises ([#56](https://github.com/netlify/edge-bundler/issues/56)) ([01b53c6](https://github.com/netlify/edge-bundler/commit/01b53c600d26ae62bd996a3b707a3a0f6c668744))

## [1.4.1](https://github.com/netlify/edge-bundler/compare/v1.4.0...v1.4.1) (2022-06-22)


### Bug Fixes

* add error state to onAfterDownload ([#42](https://github.com/netlify/edge-bundler/issues/42)) ([2cb24ac](https://github.com/netlify/edge-bundler/commit/2cb24ac72568f119ac4b1497bd732d76a99905a0))

## [1.4.0](https://github.com/netlify/edge-bundler/compare/v1.3.0...v1.4.0) (2022-06-21)


### Features

* return generated manifest object ([#48](https://github.com/netlify/edge-bundler/issues/48)) ([a9eadcf](https://github.com/netlify/edge-bundler/commit/a9eadcf74b3baef606afb0ab43535fe4368d3b58))

## [1.3.0](https://github.com/netlify/edge-bundler/compare/v1.2.1...v1.3.0) (2022-06-21)


### Features

* remove feature flag eszip ([#50](https://github.com/netlify/edge-bundler/issues/50)) ([da6377b](https://github.com/netlify/edge-bundler/commit/da6377bd6b2ed57215c64f185526e8b881522b1b))

## [1.2.1](https://github.com/netlify/edge-bundler/compare/v1.2.0...v1.2.1) (2022-06-13)

- updated edge-functions-bootstrap version (https://github.com/netlify/edge-bundler/pull/43)

### Bug Fixes

* **deps:** update dependency del to v6.1.1 ([#38](https://github.com/netlify/edge-bundler/issues/38)) ([e16b8a3](https://github.com/netlify/edge-bundler/commit/e16b8a3320043a2693092b6917955ad0010dddb0))

### [1.2.0](https://github.com/netlify/edge-bundler/compare/v1.1.0...v1.2.0) (2022-05-25)


### Features

* support for Edge Functions debugging ([#31](https://github.com/netlify/edge-bundler/issues/31)) ([d69c79e](https://github.com/netlify/edge-bundler/commit/d69c79edb75f0bd1cf177c8c2e7fde0d20f923c2))


### Bug Fixes

* **deps:** update dependency del to v6.1.0 ([#35](https://github.com/netlify/edge-bundler/issues/35)) ([0c4ff08](https://github.com/netlify/edge-bundler/commit/0c4ff08cf5ccbe629e579ac00458db9227ef26f5))


### Miscellaneous Chores

* release 1.1.1 ([#33](https://github.com/netlify/edge-bundler/issues/33)) ([6c25ee7](https://github.com/netlify/edge-bundler/commit/6c25ee742f4f8993f0dd10418f555ce6cf63afc5))

## [1.1.0](https://github.com/netlify/edge-bundler/compare/v1.0.0...v1.1.0) (2022-05-05)


### Features

* add trailing slash to regular expressions ([#22](https://github.com/netlify/edge-bundler/issues/22)) ([ffc12a4](https://github.com/netlify/edge-bundler/commit/ffc12a4e9b909a1278bc04d5fd590eb8087cd04b))

## 1.0.0 (2022-05-03)


### Features

* add `debug` parameter to `serve` ([#8](https://github.com/netlify/edge-bundler/issues/8)) ([95beffe](https://github.com/netlify/edge-bundler/commit/95beffef2a8b2c5c6bb31b40db74f0e69eb8e506))
* add ability to restart isolate ([#20](https://github.com/netlify/edge-bundler/issues/20)) ([ec29efb](https://github.com/netlify/edge-bundler/commit/ec29efb47153ff4e4e8f5efc3d3b2afe8acc88db))
* add bundler ([#10](https://github.com/netlify/edge-bundler/issues/10)) ([0e367b6](https://github.com/netlify/edge-bundler/commit/0e367b6aaa9ed2fd59d5f4ef0155297a3e7e9a8c))
* add customErrorInfo property to user errors ([#25](https://github.com/netlify/edge-bundler/issues/25)) ([4a191df](https://github.com/netlify/edge-bundler/commit/4a191dfaf3ad1c38cbe7e4f123624ba88007ce9c))
* add feature flags and debug mode ([#21](https://github.com/netlify/edge-bundler/issues/21)) ([392b5fe](https://github.com/netlify/edge-bundler/commit/392b5fe1d84207820b1ec2b1240f9ff32fc5c5b7))
* add server ([36a89f5](https://github.com/netlify/edge-bundler/commit/36a89f55a3425701f537eb28e6985ea58daaa785))
* add support for multi-stage ESZIPs ([#19](https://github.com/netlify/edge-bundler/issues/19)) ([2d78f5b](https://github.com/netlify/edge-bundler/commit/2d78f5b64aa00bf968ed8ecb68163507162868f8))
* add support for user import maps ([#6](https://github.com/netlify/edge-bundler/issues/6)) ([9067956](https://github.com/netlify/edge-bundler/commit/9067956704b2c7a31368c8188b899a158878f3b8))
* allow certificate to be supplied to `serve` ([#7](https://github.com/netlify/edge-bundler/issues/7)) ([51eabf7](https://github.com/netlify/edge-bundler/commit/51eabf76b02231e1261f7360492c334b4422fefd))
* cache download Promise ([#23](https://github.com/netlify/edge-bundler/issues/23)) ([96fbb2a](https://github.com/netlify/edge-bundler/commit/96fbb2a8836117724feb7129728c3fc14a16bf66))
* download Deno CLI from Deno repository ([#17](https://github.com/netlify/edge-bundler/issues/17)) ([68c9d30](https://github.com/netlify/edge-bundler/commit/68c9d30df10bb28db66879c48b68228619b54d23))
* export function finder + `debug` property ([#16](https://github.com/netlify/edge-bundler/issues/16)) ([569399f](https://github.com/netlify/edge-bundler/commit/569399f5d2554789f1d4bf9aaf7ecc830df44cb6))
* expprt `DenoBridge` ([#15](https://github.com/netlify/edge-bundler/issues/15)) ([66a4f4f](https://github.com/netlify/edge-bundler/commit/66a4f4ffd4fd18838be53662642125458b21e421))
* gate ESZIP bundling with environment variable ([#3](https://github.com/netlify/edge-bundler/issues/3)) ([3556f60](https://github.com/netlify/edge-bundler/commit/3556f6092fe40c4f8fcf605304ca5dda13ffa765))
* generate ESZIP and JS bundles ([#1](https://github.com/netlify/edge-bundler/issues/1)) ([8aff828](https://github.com/netlify/edge-bundler/commit/8aff828f411cbe0671b373124581111ed89031e7))
* initial commit ([a031485](https://github.com/netlify/edge-bundler/commit/a031485a88957e95fbbadeade18e69b624c82cdb))
* load bootstrap from deploy URL ([#7](https://github.com/netlify/edge-bundler/issues/7)) ([01f1285](https://github.com/netlify/edge-bundler/commit/01f128583653439d5757e07eb9b463fbd4006c7a))
* pipe stdout ([b75374c](https://github.com/netlify/edge-bundler/commit/b75374ca28f2e7c72733a5df17d24231e3730f93))
* rename Edge Handlers to Edge Functions ([#9](https://github.com/netlify/edge-bundler/issues/9)) ([a3906d4](https://github.com/netlify/edge-bundler/commit/a3906d4ee5451b47090a9b85b8d6850e227054f7))
* rename package ([d60c568](https://github.com/netlify/edge-bundler/commit/d60c568713de4b0554582bf76014978d8a60a5ec))
* update bootstrap layer ([#18](https://github.com/netlify/edge-bundler/issues/18)) ([d9ce983](https://github.com/netlify/edge-bundler/commit/d9ce98366e30f8d3c4356267139a0190d504a4ea))
* update bootstrap layer to 6256b369f54728000a74a8d5 ([#22](https://github.com/netlify/edge-bundler/issues/22)) ([e243837](https://github.com/netlify/edge-bundler/commit/e243837a4a397dbb4ed6cf5e7bb4639c2b991fa3))
* update bootstrap to 6270f39aacac8b000a2f84f4 ([#21](https://github.com/netlify/edge-bundler/issues/21)) ([ff702bf](https://github.com/netlify/edge-bundler/commit/ff702bff5d5cab278f970a1e04494349696b5dc6))
* upgrade bootstrap to `625844cdcdd28b0008829757` ([#26](https://github.com/netlify/edge-bundler/issues/26)) ([9fdc1f8](https://github.com/netlify/edge-bundler/commit/9fdc1f89ef92f3ae855c8d1bcb7fb81abc61a203))
* upgrade bootstrap to `625d32be1b90870009edfc99` ([#27](https://github.com/netlify/edge-bundler/issues/27)) ([648f99b](https://github.com/netlify/edge-bundler/commit/648f99b47f93f9b77dd862b8b7fa467dcf513136))
* upgrade Deno to 1.20.3 ([#14](https://github.com/netlify/edge-bundler/issues/14)) ([54de383](https://github.com/netlify/edge-bundler/commit/54de38341cad18ac094a42e70632c6516968f3ca))
* use `del` package ([#10](https://github.com/netlify/edge-bundler/issues/10)) ([ff68b19](https://github.com/netlify/edge-bundler/commit/ff68b19f589435de1d040a87689a7822ba3f6372))
* use bootstrap layer ([fb6e1be](https://github.com/netlify/edge-bundler/commit/fb6e1be8fc5c740e4aba4846779ea0d324a3f139))
* use import maps for internal Netlify identifier ([#5](https://github.com/netlify/edge-bundler/issues/5)) ([c5fa05e](https://github.com/netlify/edge-bundler/commit/c5fa05eb8797d7fcef7d33a111a0eb3b9e8ab6a7))
* use new manifest format ([#11](https://github.com/netlify/edge-bundler/issues/11)) ([7bee912](https://github.com/netlify/edge-bundler/commit/7bee91209401a6a5d8c6628996c29329ba9b9674))


### Bug Fixes

* avoid clearing screen when starting server ([015b3fd](https://github.com/netlify/edge-bundler/commit/015b3fdad1a6408b57b35e3ce62ee20690d635e5))
* **deps:** update dependency semver to v7.3.7 ([#9](https://github.com/netlify/edge-bundler/issues/9)) ([3ba4482](https://github.com/netlify/edge-bundler/commit/3ba44826c20878e6ca4a4db73996d80d749a03fb))
* fix import ([81adcae](https://github.com/netlify/edge-bundler/commit/81adcae95b58462f13b7d1b1ba6198262c58ff07))
* generate hash of final bundle file ([#4](https://github.com/netlify/edge-bundler/issues/4)) ([d27184a](https://github.com/netlify/edge-bundler/commit/d27184ab578736823010fc1740dcfb78a1196bf9))
* publish `deno` directory ([#24](https://github.com/netlify/edge-bundler/issues/24)) ([86b9176](https://github.com/netlify/edge-bundler/commit/86b91769589425acd087da0b7b04ada524763402))
* serialise RegExp ([5546370](https://github.com/netlify/edge-bundler/commit/5546370db2138109973ac5b3437083a2a38e5539))
* use absolute file URLs in entry point file ([#12](https://github.com/netlify/edge-bundler/issues/12)) ([e4bcfb0](https://github.com/netlify/edge-bundler/commit/e4bcfb0dfaab65b4265fb63e9c360b8d0ecd9faf))
* use declaration order when generating manifest ([#2](https://github.com/netlify/edge-bundler/issues/2)) ([f3b6405](https://github.com/netlify/edge-bundler/commit/f3b640584d1e0d8b1f27f42a3b53b322f179b023))
