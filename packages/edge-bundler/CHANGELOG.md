# Changelog

## [9.2.0](https://github.com/netlify/edge-bundler/compare/v9.1.0...v9.2.0) (2023-10-09)


### Features

* allow injecting user-facing logger ([#493](https://github.com/netlify/edge-bundler/issues/493)) ([95b4131](https://github.com/netlify/edge-bundler/commit/95b4131cccc42f9af6e1d904720cf9c3c926af8c))


### Bug Fixes

* **deps:** update dependency esbuild to v0.19.4 ([#487](https://github.com/netlify/edge-bundler/issues/487)) ([b54d948](https://github.com/netlify/edge-bundler/commit/b54d948df15be90abfe2425e4320e4aaaf9eef75))
* **deps:** update dependency uuid to v9.0.1 ([#489](https://github.com/netlify/edge-bundler/issues/489)) ([58e2ce9](https://github.com/netlify/edge-bundler/commit/58e2ce92f0f513ab8ab7aca3b3fc06bf73846fd3))
* detect .mjs files ([#483](https://github.com/netlify/edge-bundler/issues/483)) ([2a9024c](https://github.com/netlify/edge-bundler/commit/2a9024cb8a108b6f50f17db874b3ac82c1325111))
* NPM bundling should use ESM format ([#494](https://github.com/netlify/edge-bundler/issues/494)) ([6bb800f](https://github.com/netlify/edge-bundler/commit/6bb800f0b66f3d78a06ea9314b525da509c45385))

## [9.1.0](https://github.com/netlify/edge-bundler/compare/v9.0.0...v9.1.0) (2023-09-26)


### Features

* return `features` from server ([#481](https://github.com/netlify/edge-bundler/issues/481)) ([e135bb9](https://github.com/netlify/edge-bundler/commit/e135bb925d5af142dea3465813d1b8c6ccf5d4f8))

## [9.0.0](https://github.com/netlify/edge-bundler/compare/v8.20.0...v9.0.0) (2023-09-20)


### ⚠ BREAKING CHANGES

* support npm modules when serving ([#475](https://github.com/netlify/edge-bundler/issues/475))

### Features

* remove support for `npm:` prefix ([#472](https://github.com/netlify/edge-bundler/issues/472)) ([87478f0](https://github.com/netlify/edge-bundler/commit/87478f0300577b97da14c05a09e6b02d64c350a3))
* support npm modules when serving ([#475](https://github.com/netlify/edge-bundler/issues/475)) ([ec33cd7](https://github.com/netlify/edge-bundler/commit/ec33cd70b1c2b1fa29dcf183e6fa7ebf1825f685))

## [8.20.0](https://github.com/netlify/edge-bundler/compare/v8.19.1...v8.20.0) (2023-09-07)


### Features

* add support for npm modules ([#454](https://github.com/netlify/edge-bundler/issues/454)) ([3d8b3f3](https://github.com/netlify/edge-bundler/commit/3d8b3f342e9f075bbb17fe7fb80602ed377d1a46))


### Bug Fixes

* support import maps in npm module resolution ([#471](https://github.com/netlify/edge-bundler/issues/471)) ([3f4975e](https://github.com/netlify/edge-bundler/commit/3f4975e465a098e1699ab5e35f13524f9bbbd1c2))

## [8.19.1](https://github.com/netlify/edge-bundler/compare/v8.19.0...v8.19.1) (2023-09-06)


### Bug Fixes

* hide stack trace on syntax errors ([#464](https://github.com/netlify/edge-bundler/issues/464)) ([9261b8c](https://github.com/netlify/edge-bundler/commit/9261b8c13a07970be0e177aa6f1c4358ac862110))
* pin bootstrap version used in config extraction ([#469](https://github.com/netlify/edge-bundler/issues/469)) ([19d142d](https://github.com/netlify/edge-bundler/commit/19d142dcb17953e4c598626709662a2ddb6cf506))
* remap `netlify:edge` specifier ([#467](https://github.com/netlify/edge-bundler/issues/467)) ([9728d1a](https://github.com/netlify/edge-bundler/commit/9728d1a067cd791226eae2110e03897d2e0ac97b))

## [8.19.0](https://github.com/netlify/edge-bundler/compare/v8.18.0...v8.19.0) (2023-08-28)


### Features

* match on http methods ([#458](https://github.com/netlify/edge-bundler/issues/458)) ([72e8453](https://github.com/netlify/edge-bundler/commit/72e8453fe70f1b0d2e566b0faf58ccdecbe65518))
* remove `URLPattern` feature flag ([#460](https://github.com/netlify/edge-bundler/issues/460)) ([aa4d4ab](https://github.com/netlify/edge-bundler/commit/aa4d4abdd2458cfd7bd6d31d5ccb604815d642e6))
* support `@netlify/edge-functions` specifier ([#459](https://github.com/netlify/edge-bundler/issues/459)) ([3340ac6](https://github.com/netlify/edge-bundler/commit/3340ac64d9ced1a1bba638f40b053e290e580a8a))

## [8.18.0](https://github.com/netlify/edge-bundler/compare/v8.17.1...v8.18.0) (2023-08-17)


### Features

* add `path` to manifest ([#455](https://github.com/netlify/edge-bundler/issues/455)) ([fdbc09d](https://github.com/netlify/edge-bundler/commit/fdbc09de991638e5b452331416390cf219402ae2))
* simplify `ImportMap` ([#453](https://github.com/netlify/edge-bundler/issues/453)) ([12a1d45](https://github.com/netlify/edge-bundler/commit/12a1d45f9fa7d59b2259161aee23ef564b036fad))


### Bug Fixes

* **deps:** update dependency semver to v7.5.4 ([#445](https://github.com/netlify/edge-bundler/issues/445)) ([f1011af](https://github.com/netlify/edge-bundler/commit/f1011af32dd0ad9a394bddc4a6499c49a373bd7f))
* mark invalid url patterns as user error ([#450](https://github.com/netlify/edge-bundler/issues/450)) ([4363322](https://github.com/netlify/edge-bundler/commit/436332297ca31e8ab4ccb23b229729a67f21006a))

## [8.17.1](https://github.com/netlify/edge-bundler/compare/v8.17.0...v8.17.1) (2023-07-27)


### Bug Fixes

* ensure patterns match on whole path ([#442](https://github.com/netlify/edge-bundler/issues/442)) ([a9e1e11](https://github.com/netlify/edge-bundler/commit/a9e1e117f417894c9da21115674f6550872b3d10))
* parseConfig stumbling over `globalThis.Netlify` usage in global scope ([#427](https://github.com/netlify/edge-bundler/issues/427)) ([d829e70](https://github.com/netlify/edge-bundler/commit/d829e70e9c8220ee4d3013f6ee631a204bccb341))

## [8.17.0](https://github.com/netlify/edge-bundler/compare/v8.16.4...v8.17.0) (2023-07-26)


### Features

* replace `glob-to-regexp` with `URLPattern` ([#392](https://github.com/netlify/edge-bundler/issues/392)) ([ca6962d](https://github.com/netlify/edge-bundler/commit/ca6962daa37b2f2af44dd7d5f007efaec49dd8ba))

## [8.16.4](https://github.com/netlify/edge-bundler/compare/v8.16.3...v8.16.4) (2023-07-12)


### Bug Fixes

* set minimum deno version to `1.32.5` to support latest features in netlify bootstrap ([140b46d](https://github.com/netlify/edge-bundler/commit/140b46d4868a76645017264e3e1b74c646abe0d6))

## [8.16.3](https://github.com/netlify/edge-bundler/compare/v8.16.2...v8.16.3) (2023-07-10)


### Bug Fixes

* **deps:** update dependency semver to v7.5.3 ([#424](https://github.com/netlify/edge-bundler/issues/424)) ([364eefe](https://github.com/netlify/edge-bundler/commit/364eefeb7eff5dd76e613d553c4cb6e0b1410489))
* **deps:** update dependency semver to v7.5.4 ([#430](https://github.com/netlify/edge-bundler/issues/430)) ([30bd647](https://github.com/netlify/edge-bundler/commit/30bd647fade7407adbcb80aa65741a5c159a4e07))

## [8.16.2](https://github.com/netlify/edge-bundler/compare/v8.16.1...v8.16.2) (2023-06-07)


### Bug Fixes

* improvements to download process of deno ([#414](https://github.com/netlify/edge-bundler/issues/414)) ([8e1ecec](https://github.com/netlify/edge-bundler/commit/8e1ecec398f6588d6e6ede042168fc4df62cf0fd))

## [8.16.1](https://github.com/netlify/edge-bundler/compare/v8.16.0...v8.16.1) (2023-06-05)


### Bug Fixes

* update minimum version of semver to be ESM compatible ([#412](https://github.com/netlify/edge-bundler/issues/412)) ([f5f2695](https://github.com/netlify/edge-bundler/commit/f5f269552804b07754b1cb97d0f348d2a334f614))

## [8.16.0](https://github.com/netlify/edge-bundler/compare/v8.15.0...v8.16.0) (2023-05-30)


### Features

* support `node:` prefix ([#406](https://github.com/netlify/edge-bundler/issues/406)) ([0f7413f](https://github.com/netlify/edge-bundler/commit/0f7413f3e4921922ba82d1331cfb6d50ccafc2a6))

## [8.15.0](https://github.com/netlify/edge-bundler/compare/v8.14.2...v8.15.0) (2023-05-24)


### Features

* add support for excludedPattern ([#403](https://github.com/netlify/edge-bundler/issues/403)) ([39b29d5](https://github.com/netlify/edge-bundler/commit/39b29d5676432786dd83971fcc8e7cff00bea649))


### Bug Fixes

* **deps:** update dependency semver to v7.5.1 ([#397](https://github.com/netlify/edge-bundler/issues/397)) ([0858b14](https://github.com/netlify/edge-bundler/commit/0858b14c49fa958935e20284dda46f4f0c3fc795))

## [8.14.2](https://github.com/netlify/edge-bundler/compare/v8.14.1...v8.14.2) (2023-05-12)


### Bug Fixes

* remove del package ([e913e46](https://github.com/netlify/edge-bundler/commit/e913e4602cc3fa8d6931159280a24bf6986b782c))

## [8.14.1](https://github.com/netlify/edge-bundler/compare/v8.14.0...v8.14.1) (2023-05-05)


### Bug Fixes

* **deps:** update dependency regexp-tree to v0.1.27 ([#383](https://github.com/netlify/edge-bundler/issues/383)) ([0bec897](https://github.com/netlify/edge-bundler/commit/0bec897b48e96bf8da0a4374d95e6d7b66d5460c))
* **deps:** update dependency semver to v7.5.0 ([#385](https://github.com/netlify/edge-bundler/issues/385)) ([4c4e2df](https://github.com/netlify/edge-bundler/commit/4c4e2dfe14ecfb0fb2244dc0093cd2a9d1777c93))
* remove feature flag for execution order ([#381](https://github.com/netlify/edge-bundler/issues/381)) ([125c82c](https://github.com/netlify/edge-bundler/commit/125c82c56380bcdf36094408fa5b42da5698ebaa))
* remove FF edge_functions_invalid_config_throw ([#374](https://github.com/netlify/edge-bundler/issues/374)) ([8b4e65e](https://github.com/netlify/edge-bundler/commit/8b4e65e52ad24c75398050ac041f0a03b2b721a5))

## [8.14.0](https://github.com/netlify/edge-bundler/compare/v8.13.2...v8.14.0) (2023-05-02)


### Features

* add npm provenance ([#373](https://github.com/netlify/edge-bundler/issues/373)) ([9d798de](https://github.com/netlify/edge-bundler/commit/9d798de1bc646e64770c98e8c1720ba13b886e15))


### Bug Fixes

* add repro for customer case ([#366](https://github.com/netlify/edge-bundler/issues/366)) ([c91593f](https://github.com/netlify/edge-bundler/commit/c91593f5e7f0831e4cfe3c69d240d6044c8869c8))
* **deps:** update dependency regexp-tree to v0.1.25 ([#370](https://github.com/netlify/edge-bundler/issues/370)) ([29f8a89](https://github.com/netlify/edge-bundler/commit/29f8a89976263138e7ed42a4f192dd476f027557))
* ensure regular expressions are properly escaped ([#378](https://github.com/netlify/edge-bundler/issues/378)) ([214c3fb](https://github.com/netlify/edge-bundler/commit/214c3fbce7f425ad866f0ef737ea92eccc993aa2))
* types ([c91593f](https://github.com/netlify/edge-bundler/commit/c91593f5e7f0831e4cfe3c69d240d6044c8869c8))

## [8.13.2](https://github.com/netlify/edge-bundler/compare/v8.13.1...v8.13.2) (2023-04-12)


### Bug Fixes

* update eszip + std ([#364](https://github.com/netlify/edge-bundler/issues/364)) ([4b78e4c](https://github.com/netlify/edge-bundler/commit/4b78e4c5de8c3ec236a21afe5f14522fc11e1708))

## [8.13.1](https://github.com/netlify/edge-bundler/compare/v8.13.0...v8.13.1) (2023-04-10)


### Bug Fixes

* change the order of how edge functions are written to the manifest ([#357](https://github.com/netlify/edge-bundler/issues/357)) ([59d1c8c](https://github.com/netlify/edge-bundler/commit/59d1c8c38dd8858a00b9c033588e1be80c0a5515))
* remove duplicate functions and let .js take precedence ([#359](https://github.com/netlify/edge-bundler/issues/359)) ([bc52282](https://github.com/netlify/edge-bundler/commit/bc52282cda391bdfcb95798c1283041430a28482))
* revert slash validation and change validation message ([#343](https://github.com/netlify/edge-bundler/issues/343)) ([d032496](https://github.com/netlify/edge-bundler/commit/d0324960e241f02b39966ed14e9f7be9c089800f))

## [8.13.0](https://github.com/netlify/edge-bundler/compare/v8.12.3...v8.13.0) (2023-03-24)


### Features

* move non-route related ef configs to function_config in manifest ([#348](https://github.com/netlify/edge-bundler/issues/348)) ([c7b7042](https://github.com/netlify/edge-bundler/commit/c7b704212e4660ad90e6f1f5236db2eb9883b5c8))
* split user and internal ISC function configs ([#347](https://github.com/netlify/edge-bundler/issues/347)) ([c85a861](https://github.com/netlify/edge-bundler/commit/c85a861eff2b54d6447db522f209d59871e60ab1))

## [8.12.3](https://github.com/netlify/edge-bundler/compare/v8.12.2...v8.12.3) (2023-03-20)


### Bug Fixes

* mark validation error as user error ([4dec1b9](https://github.com/netlify/edge-bundler/commit/4dec1b961f5256fd63a220680d938d8f37567bd2))

## [8.12.2](https://github.com/netlify/edge-bundler/compare/v8.12.1...v8.12.2) (2023-03-17)


### Bug Fixes

* enforce leading slash in path and pattern ([#339](https://github.com/netlify/edge-bundler/issues/339)) ([5b1daf9](https://github.com/netlify/edge-bundler/commit/5b1daf94f6526c8eb465d406ae272c746cc2522a))

## [8.12.1](https://github.com/netlify/edge-bundler/compare/v8.12.0...v8.12.1) (2023-03-14)


### Bug Fixes

* ignore config blocks for undefined functions ([#337](https://github.com/netlify/edge-bundler/issues/337)) ([599c677](https://github.com/netlify/edge-bundler/commit/599c677689b9598ca1b69665e8b8fada5822f4a1))

## [8.12.0](https://github.com/netlify/edge-bundler/compare/v8.11.1...v8.12.0) (2023-03-13)


### Features

* export `mergeDeclarations` function ([#334](https://github.com/netlify/edge-bundler/issues/334)) ([a3b01c0](https://github.com/netlify/edge-bundler/commit/a3b01c08c5bcb734d7b66eedcdf45598abd87640))

## [8.11.1](https://github.com/netlify/edge-bundler/compare/v8.11.0...v8.11.1) (2023-03-10)


### Bug Fixes

* Updated bootstrap to the latest version ([#332](https://github.com/netlify/edge-bundler/issues/332)) ([614102d](https://github.com/netlify/edge-bundler/commit/614102d3e4d30b2c9e1cb83fdb894e14c5f334c4))

## [8.11.0](https://github.com/netlify/edge-bundler/compare/v8.10.0...v8.11.0) (2023-03-08)


### Features

* propagate onError config property to manifest ([#328](https://github.com/netlify/edge-bundler/issues/328)) ([bd804b2](https://github.com/netlify/edge-bundler/commit/bd804b214b0aa4cb44437a4b87e6a21b3bad602b))

## [8.10.0](https://github.com/netlify/edge-bundler/compare/v8.9.0...v8.10.0) (2023-03-08)


### Features

* populate generator field if edge function is from a config file ([#312](https://github.com/netlify/edge-bundler/issues/312)) ([0ee2e1d](https://github.com/netlify/edge-bundler/commit/0ee2e1d79596d0f3b71c455c329cf81c9da84f92))
* update bootstrap URL ([#329](https://github.com/netlify/edge-bundler/issues/329)) ([8b5dc3b](https://github.com/netlify/edge-bundler/commit/8b5dc3ba7a322bac53f820f4fbff82180af5337f))


### Bug Fixes

* throw errors when function or isc-config cannot be loaded ([#327](https://github.com/netlify/edge-bundler/issues/327)) ([cdac30d](https://github.com/netlify/edge-bundler/commit/cdac30d861b3bedd371c95e2914bee944777779d))

## [8.9.0](https://github.com/netlify/edge-bundler/compare/v8.8.1...v8.9.0) (2023-03-03)


### Features

* update bootstrap version ([#321](https://github.com/netlify/edge-bundler/issues/321)) ([88928c7](https://github.com/netlify/edge-bundler/commit/88928c7214012a6fd4ecf7641fb52fad8fa20d44))

## [8.8.1](https://github.com/netlify/edge-bundler/compare/v8.8.0...v8.8.1) (2023-03-02)


### Bug Fixes

* update std and eszip deps ([#316](https://github.com/netlify/edge-bundler/issues/316)) ([90a8a1d](https://github.com/netlify/edge-bundler/commit/90a8a1d2d34b31c48ad87dbf3f85da954f906289))

## [8.8.0](https://github.com/netlify/edge-bundler/compare/v8.7.0...v8.8.0) (2023-03-01)


### Features

* update bootstrap ([#303](https://github.com/netlify/edge-bundler/issues/303)) ([05feca7](https://github.com/netlify/edge-bundler/commit/05feca7100f9e80c3437df3ff313b81f23308886))

## [8.7.0](https://github.com/netlify/edge-bundler/compare/v8.6.0...v8.7.0) (2023-02-17)


### Features

* add generator field to edge function manifest ([#304](https://github.com/netlify/edge-bundler/issues/304)) ([5a59fcc](https://github.com/netlify/edge-bundler/commit/5a59fcca588ec77a9613047943601a2641b4fc88))

## [8.6.0](https://github.com/netlify/edge-bundler/compare/v8.5.0...v8.6.0) (2023-02-14)


### Features

* wrap regex validation in feature flag ([#302](https://github.com/netlify/edge-bundler/issues/302)) ([862994b](https://github.com/netlify/edge-bundler/commit/862994b3e6047b5a80d3fdc4c2663566a965cf5c))


### Bug Fixes

* migrate to Github Action's output files ([#300](https://github.com/netlify/edge-bundler/issues/300)) ([bf54378](https://github.com/netlify/edge-bundler/commit/bf54378dd05fd9ef4f3eda4a796a0b6cafc7fb4b))

## [8.5.0](https://github.com/netlify/edge-bundler/compare/v8.4.0...v8.5.0) (2023-02-10)


### Features

* validate pattern declarations ([#298](https://github.com/netlify/edge-bundler/issues/298)) ([d8c44a3](https://github.com/netlify/edge-bundler/commit/d8c44a363a6794950bf4d50cb691f0d6e6808a53))

## [8.4.0](https://github.com/netlify/edge-bundler/compare/v8.3.0...v8.4.0) (2023-01-18)


### Features

* update bootstrap version ([#296](https://github.com/netlify/edge-bundler/issues/296)) ([3bab80b](https://github.com/netlify/edge-bundler/commit/3bab80bc8b932c2e906d25c19874b5a11fa8a271))

## [8.3.0](https://github.com/netlify/edge-bundler/compare/v8.2.1...v8.3.0) (2023-01-18)


### Features

* remove `--unstable` flag from `serve` flags ([#294](https://github.com/netlify/edge-bundler/issues/294)) ([cb4c75d](https://github.com/netlify/edge-bundler/commit/cb4c75d27303fcec207ade5fb51c740940b574f5))

## [8.2.1](https://github.com/netlify/edge-bundler/compare/v8.2.0...v8.2.1) (2023-01-17)


### Bug Fixes

* trigger another release, 8.2.0 didnt work ([#292](https://github.com/netlify/edge-bundler/issues/292)) ([1fcb47a](https://github.com/netlify/edge-bundler/commit/1fcb47ad95b2448f1a79b6f580e90fe4cb71b37d))

## [8.2.0](https://github.com/netlify/edge-bundler/compare/v8.1.2...v8.2.0) (2023-01-17)


### Features

* rename x-deno- to x-nf- headers ([#290](https://github.com/netlify/edge-bundler/issues/290)) ([c6d8ae0](https://github.com/netlify/edge-bundler/commit/c6d8ae03e7773f16543935685ef32f9105071119))

## [8.1.2](https://github.com/netlify/edge-bundler/compare/v8.1.1...v8.1.2) (2023-01-11)


### Bug Fixes

* replace "items" with "additionalProperties" ([#284](https://github.com/netlify/edge-bundler/issues/284)) ([0fc76b7](https://github.com/netlify/edge-bundler/commit/0fc76b78ef9faf0b5c99ecdec4b7ef6910949a38))

## [8.1.1](https://github.com/netlify/edge-bundler/compare/v8.1.0...v8.1.1) (2023-01-09)


### Bug Fixes

* **deps:** update dependency ajv to v8.12.0 ([#282](https://github.com/netlify/edge-bundler/issues/282)) ([2b7c766](https://github.com/netlify/edge-bundler/commit/2b7c7667dc84df47002c055ad8a30b5a5c2acdf6))

## [8.1.0](https://github.com/netlify/edge-bundler/compare/v8.0.0...v8.1.0) (2023-01-06)


### Features

* move excluded_patterns into function_config ([#274](https://github.com/netlify/edge-bundler/issues/274)) ([98ccb6f](https://github.com/netlify/edge-bundler/commit/98ccb6f2535f470cae7436b2f175d53eb8b9ef78))

## [8.0.0](https://github.com/netlify/edge-bundler/compare/v7.1.0...v8.0.0) (2022-12-21)


### ⚠ BREAKING CHANGES

* make `config` export a plain object ([#273](https://github.com/netlify/edge-bundler/issues/273))

### Features

* make `config` export a plain object ([#273](https://github.com/netlify/edge-bundler/issues/273)) ([a6a48cf](https://github.com/netlify/edge-bundler/commit/a6a48cf1b64ff00e022e797e57c3bde89258a3a6))


### Bug Fixes

* print nice npm error message for npm: specifier as well ([#271](https://github.com/netlify/edge-bundler/issues/271)) ([70071de](https://github.com/netlify/edge-bundler/commit/70071de9ff6f0d89e455d868fd43e05ff83a3bfc))

## [7.1.0](https://github.com/netlify/edge-bundler/compare/v7.0.1...v7.1.0) (2022-12-20)


### Features

* add support for negative patterns ([#261](https://github.com/netlify/edge-bundler/issues/261)) ([646631a](https://github.com/netlify/edge-bundler/commit/646631af4593285ca8f081bd7581e5ecf0fe7de3))

## [7.0.1](https://github.com/netlify/edge-bundler/compare/v7.0.0...v7.0.1) (2022-12-19)


### Bug Fixes

* read other import map paths when one doesn't exist ([#268](https://github.com/netlify/edge-bundler/issues/268)) ([8410c1c](https://github.com/netlify/edge-bundler/commit/8410c1caf9c57edf9ebb6874dd06750626d94a8d))

## [7.0.0](https://github.com/netlify/edge-bundler/compare/v6.1.0...v7.0.0) (2022-12-19)


### ⚠ BREAKING CHANGES

* Both `bundle` and `serve` now expect an `importMapPaths` array containing a list of paths to any user-defined import map files

### Features

* add `importMapPaths` to `bundle` and `serve` ([#265](https://github.com/netlify/edge-bundler/issues/265)) ([dcbd7f7](https://github.com/netlify/edge-bundler/commit/dcbd7f7681f8971bd88e251669b7f09602ee0b9c))
* log failures when loading import map files ([#267](https://github.com/netlify/edge-bundler/issues/267)) ([138690b](https://github.com/netlify/edge-bundler/commit/138690b5e490b5d577f07c529bcbfb1379be4811))

## [6.1.0](https://github.com/netlify/edge-bundler/compare/v6.0.0...v6.1.0) (2022-12-14)


### Features

* add system logging for Deno config file ([#259](https://github.com/netlify/edge-bundler/issues/259)) ([27a628c](https://github.com/netlify/edge-bundler/commit/27a628c544514598f03247ceeb136d6e4667b0c2))

## [6.0.0](https://github.com/netlify/edge-bundler/compare/v5.5.0...v6.0.0) (2022-12-13)


### ⚠ BREAKING CHANGES

* The `serve` export now requires a `basePath` parameter

### Features

* add support for user-defined import maps ([#256](https://github.com/netlify/edge-bundler/issues/256)) ([436e10e](https://github.com/netlify/edge-bundler/commit/436e10ecf3f8df3cd8da6d8b2d8d78110668c82d))
* read Deno config behind feature flag ([#258](https://github.com/netlify/edge-bundler/issues/258)) ([5dc562a](https://github.com/netlify/edge-bundler/commit/5dc562a9a65081253c2702a890b0d01077e45fbe))

## [5.5.0](https://github.com/netlify/edge-bundler/compare/v5.4.0...v5.5.0) (2022-12-12)


### Features

* Update BOOTSTRAP_LATEST ([#254](https://github.com/netlify/edge-bundler/issues/254)) ([0f9e79a](https://github.com/netlify/edge-bundler/commit/0f9e79aca610141292707f75872b669ac9095eba))


### Bug Fixes

* do not transform paths when writing import map to disk ([#253](https://github.com/netlify/edge-bundler/issues/253)) ([277dc30](https://github.com/netlify/edge-bundler/commit/277dc3016490ab38525c0a67d750256e7c465da3))

## [5.4.0](https://github.com/netlify/edge-bundler/compare/v5.3.3...v5.4.0) (2022-12-09)


### Features

* use `netlify:import-map` specifier ([#246](https://github.com/netlify/edge-bundler/issues/246)) ([9f2a947](https://github.com/netlify/edge-bundler/commit/9f2a9473c77727671f3bc2fd9c8d31058848dece))

## [5.3.3](https://github.com/netlify/edge-bundler/compare/v5.3.2...v5.3.3) (2022-12-07)


### Bug Fixes

* add guard for import map with extraneous dist directory ([#243](https://github.com/netlify/edge-bundler/issues/243)) ([f0ac6d0](https://github.com/netlify/edge-bundler/commit/f0ac6d050ce31566045cbf8339b6f2a556b484df))
* generate valid file URL on Windows ([#245](https://github.com/netlify/edge-bundler/issues/245)) ([6a8a00b](https://github.com/netlify/edge-bundler/commit/6a8a00b0db5b82738774aec84336fc50326cc068))

## [5.3.2](https://github.com/netlify/edge-bundler/compare/v5.3.1...v5.3.2) (2022-12-06)


### Bug Fixes

* correct import_map attribute name in validation ([#241](https://github.com/netlify/edge-bundler/issues/241)) ([dfcd90f](https://github.com/netlify/edge-bundler/commit/dfcd90fc74a53112800c2db8c73e1cef374010ed))

## [5.3.1](https://github.com/netlify/edge-bundler/compare/v5.3.0...v5.3.1) (2022-12-06)


### Bug Fixes

* add `importMapURL` to manifest validation ([#239](https://github.com/netlify/edge-bundler/issues/239)) ([2ba1878](https://github.com/netlify/edge-bundler/commit/2ba1878765e219ba291bceb648bc50ee9bdb55c5))

## [5.3.0](https://github.com/netlify/edge-bundler/compare/v5.2.0...v5.3.0) (2022-12-06)


### Features

* save import map URL to manifest ([#235](https://github.com/netlify/edge-bundler/issues/235)) ([94c6ec6](https://github.com/netlify/edge-bundler/commit/94c6ec61fb3663790d4b2561794f4bdf25f2264c))
* support for multiple paths in in source configuration ([#230](https://github.com/netlify/edge-bundler/issues/230)) ([d4ec906](https://github.com/netlify/edge-bundler/commit/d4ec906edd311c4b5b137c6f2d3e4b564190d835))

## [5.2.0](https://github.com/netlify/edge-bundler/compare/v5.1.0...v5.2.0) (2022-12-06)


### Features

* update bootstrap_url ([#236](https://github.com/netlify/edge-bundler/issues/236)) ([d1f44d6](https://github.com/netlify/edge-bundler/commit/d1f44d6fd970d51b79ae57f57f906c34c58e5b54))

## [5.1.0](https://github.com/netlify/edge-bundler/compare/v5.0.0...v5.1.0) (2022-12-05)


### Features

* Update BOOTSTRAP_URL ([#233](https://github.com/netlify/edge-bundler/issues/233)) ([078009d](https://github.com/netlify/edge-bundler/commit/078009dca1828df177429d5f9a506c8e7106c86e))

## [5.0.0](https://github.com/netlify/edge-bundler/compare/v4.4.3...v5.0.0) (2022-11-28)


### ⚠ BREAKING CHANGES

* remove support for JavaScript bundles ([#224](https://github.com/netlify/edge-bundler/issues/224))
* move internal config file to Edge Bundler ([#219](https://github.com/netlify/edge-bundler/issues/219))

### Features

* mark custom layers as `externals` ([#225](https://github.com/netlify/edge-bundler/issues/225)) ([a68607b](https://github.com/netlify/edge-bundler/commit/a68607bd5a5e83e4b62ec483e1ce3e7fd33f1ba1))
* move internal config file to Edge Bundler ([#219](https://github.com/netlify/edge-bundler/issues/219)) ([08ce8a5](https://github.com/netlify/edge-bundler/commit/08ce8a591b105897f73a6e5c24d3d372e04ed574))
* remove support for JavaScript bundles ([#224](https://github.com/netlify/edge-bundler/issues/224)) ([d8f45b1](https://github.com/netlify/edge-bundler/commit/d8f45b16ce4739b9f6938421098646d970ac5ad8))


### Bug Fixes

* **deps:** update dependency p-retry to v5.1.2 ([#228](https://github.com/netlify/edge-bundler/issues/228)) ([e8a54e1](https://github.com/netlify/edge-bundler/commit/e8a54e11ea0c4c3468a9cacc8bea032407b647f3))

## [4.4.3](https://github.com/netlify/edge-bundler/compare/v4.4.2...v4.4.3) (2022-11-23)


### Bug Fixes

* deep merge in source and toml config ([#220](https://github.com/netlify/edge-bundler/issues/220)) ([e2789e3](https://github.com/netlify/edge-bundler/commit/e2789e3639fc92766efe8196aaa84366c54e84e9))

## [4.4.2](https://github.com/netlify/edge-bundler/compare/v4.4.1...v4.4.2) (2022-11-23)


### Bug Fixes

* update bootstrap to 637cf7ce9214b300099b3aa8 ([#217](https://github.com/netlify/edge-bundler/issues/217)) ([dfc4b24](https://github.com/netlify/edge-bundler/commit/dfc4b240550dc726fe52eb3fa4dba15fe1953166))

## [4.4.1](https://github.com/netlify/edge-bundler/compare/v4.4.0...v4.4.1) (2022-11-21)


### Bug Fixes

* update bootstrap to 637b7052e167bb00082f54f1 ([#215](https://github.com/netlify/edge-bundler/issues/215)) ([94ddc22](https://github.com/netlify/edge-bundler/commit/94ddc22ec4ae1f086be34a5babd413d0a8ba0ea6))

## [4.4.0](https://github.com/netlify/edge-bundler/compare/v4.3.2...v4.4.0) (2022-11-21)


### Features

* add manifest validation ([#208](https://github.com/netlify/edge-bundler/issues/208)) ([17ee035](https://github.com/netlify/edge-bundler/commit/17ee035f949db06d1c4c229e454fe553eae71ae0))

## [4.3.2](https://github.com/netlify/edge-bundler/compare/v4.3.1...v4.3.2) (2022-11-18)


### Bug Fixes

* tag edge function signature errors as user errors ([#209](https://github.com/netlify/edge-bundler/issues/209)) ([5d5a50f](https://github.com/netlify/edge-bundler/commit/5d5a50f08e2c926ad5ab7cc75dd3c879cd91f91c))

## [4.3.1](https://github.com/netlify/edge-bundler/compare/v4.3.0...v4.3.1) (2022-11-18)


### Bug Fixes

* update bootstrap version ([#206](https://github.com/netlify/edge-bundler/issues/206)) ([47c9510](https://github.com/netlify/edge-bundler/commit/47c95109a48d34302092a4bb4c1cdfc161ddf637))

## [4.3.0](https://github.com/netlify/edge-bundler/compare/v4.2.0...v4.3.0) (2022-11-18)


### Features

* validate edge function signature at build time ([#200](https://github.com/netlify/edge-bundler/issues/200)) ([2f81b01](https://github.com/netlify/edge-bundler/commit/2f81b019aa6df4f08bd3a450938880fc185ccc3d))

## [4.2.0](https://github.com/netlify/edge-bundler/compare/v4.1.0...v4.2.0) (2022-11-17)


### Features

* add `layer:` prefix to ESZIP loader ([#201](https://github.com/netlify/edge-bundler/issues/201)) ([4d0e8dd](https://github.com/netlify/edge-bundler/commit/4d0e8dd31ae2c764cf12a318e8dc25ea7ccebc0b))
* add detection + nice error message for npm import errors ([#195](https://github.com/netlify/edge-bundler/issues/195)) ([1389373](https://github.com/netlify/edge-bundler/commit/138937346db460bc90788049713a8f598bc196d2))


### Bug Fixes

* update bootstrap ([#202](https://github.com/netlify/edge-bundler/issues/202)) ([a314063](https://github.com/netlify/edge-bundler/commit/a314063469f966c8237cae808f1423e82e623d6a))

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
