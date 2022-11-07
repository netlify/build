# Changelog

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.0.2 to ^18.1.0

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.1.0 to ^18.1.1

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.1.3 to ^18.1.4

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.2.0 to ^18.2.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/functions-utils bumped from ^4.2.10 to ^4.2.11
    * @netlify/git-utils bumped from ^4.1.2 to ^4.1.3

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/config bumped from ^18.2.5 to ^18.2.6
  * devDependencies
    * @netlify/nock-udp bumped from ^1.0.0 to ^2.0.0

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/config bumped from ^19.1.0 to ^19.1.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/config bumped from ^19.1.1 to ^19.1.2

## [28.1.9](https://github.com/netlify/build/compare/build-v28.1.8...build-v28.1.9) (2022-11-04)


### Bug Fixes

* fix unsupported plugin version error message formatting ([#4674](https://github.com/netlify/build/issues/4674)) ([3733885](https://github.com/netlify/build/commit/3733885ffa192966ca74e601cf4634b84e098228))

## [28.1.8](https://github.com/netlify/build/compare/build-v28.1.7...build-v28.1.8) (2022-11-04)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v8 ([#4662](https://github.com/netlify/build/issues/4662)) ([764faf3](https://github.com/netlify/build/commit/764faf37778331042abede5d00efb8b8a2e37b1b))
* fail builds if the Next.js Runtime version is &gt;= 4.0.0 && &lt; 4.26.0  ([#4672](https://github.com/netlify/build/issues/4672)) ([7ade56d](https://github.com/netlify/build/commit/7ade56d1aa11ed3c01a48bbf1ce3f21babc82790))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/functions-utils bumped from ^5.0.1 to ^5.0.2

## [28.1.7](https://github.com/netlify/build/compare/build-v28.1.6...build-v28.1.7) (2022-11-02)


### Bug Fixes

* change minimum required node versions from plugins to not read from @netlify/build package.json ([#4665](https://github.com/netlify/build/issues/4665)) ([9eab1c3](https://github.com/netlify/build/commit/9eab1c3bc5a55bec9f42c0bc4d68075de3de94d5))

## [28.1.4](https://github.com/netlify/build/compare/build-v28.1.3...build-v28.1.4) (2022-10-26)


### Bug Fixes

* **deps:** update dependency @netlify/edge-bundler to v3 ([#4656](https://github.com/netlify/build/issues/4656)) ([a8f1f6b](https://github.com/netlify/build/commit/a8f1f6b23789f91df7910d4aae7c93dd8e992e5d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/config bumped from ^19.0.2 to ^19.1.0

## [28.1.3](https://github.com/netlify/build/compare/build-v28.1.2...build-v28.1.3) (2022-10-21)


### Bug Fixes

* **build:** add post_cache_routes to edge validation schema ([#4649](https://github.com/netlify/build/issues/4649)) ([ab03fe2](https://github.com/netlify/build/commit/ab03fe2df96898cf3b39e47d4b419a316b94a695))

## [28.1.2](https://github.com/netlify/build/compare/build-v28.1.1...build-v28.1.2) (2022-10-20)


### Bug Fixes

* **deps:** update dependency @netlify/edge-bundler to ^2.9.0 ([#4645](https://github.com/netlify/build/issues/4645)) ([9aff7c1](https://github.com/netlify/build/commit/9aff7c100fd7d5678cf7be2001421db0ee5f99cf))

## [28.1.1](https://github.com/netlify/build/compare/build-v28.1.0...build-v28.1.1) (2022-10-19)


### Bug Fixes

* **build,build-info,config:** enforce yargs version 17.6.0 as prior version do not support ESM ([#4641](https://github.com/netlify/build/issues/4641)) ([80c8558](https://github.com/netlify/build/commit/80c85581bd2bcc4a0dc05f8eeb1ffe77733fdf27))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/config bumped from ^19.0.1 to ^19.0.2

## [28.1.0](https://github.com/netlify/build/compare/build-v28.0.1...build-v28.1.0) (2022-10-18)


### Features

* report errors in stages to statsd ([#4613](https://github.com/netlify/build/issues/4613)) ([3a0b2f1](https://github.com/netlify/build/commit/3a0b2f1836299b7b45fc7a28c1a6ba2215ed5c23))

## [28.0.1](https://github.com/netlify/build/compare/build-v28.0.0...build-v28.0.1) (2022-10-18)


### Bug Fixes

* **@netlify/build:** improve cli types for build cli ([#4610](https://github.com/netlify/build/issues/4610)) ([cf295a6](https://github.com/netlify/build/commit/cf295a60ca0d815870f6aa4573ee8d150c1b472f))
* **build:** improve core step types ([#4612](https://github.com/netlify/build/issues/4612)) ([3a44a70](https://github.com/netlify/build/commit/3a44a70680387cad2a66eb6fa5da583431cb2413))
* **deps:** update dependency @netlify/edge-bundler to ^2.8.0 ([#4630](https://github.com/netlify/build/issues/4630)) ([73f519e](https://github.com/netlify/build/commit/73f519e5fbe0dc0897c400b5a0c798621a295500))
* **deps:** update dependency @netlify/plugins-list to ^6.50.0 ([#4631](https://github.com/netlify/build/issues/4631)) ([d771a3b](https://github.com/netlify/build/commit/d771a3b59946bf93314e8886df789bdcc4710a6e))
* run tsc -w if user runs ava -w ([#4601](https://github.com/netlify/build/issues/4601)) ([ebcc8a8](https://github.com/netlify/build/commit/ebcc8a86bc5324ab6c5450fbe396073215aaac6c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/cache-utils bumped from ^5.0.0 to ^5.0.1
    * @netlify/config bumped from ^19.0.0 to ^19.0.1
    * @netlify/functions-utils bumped from ^5.0.0 to ^5.0.1
    * @netlify/git-utils bumped from ^5.0.0 to ^5.0.1
    * @netlify/run-utils bumped from ^5.0.0 to ^5.0.1

## [28.0.0](https://github.com/netlify/build/compare/build-v27.20.6...build-v28.0.0) (2022-10-11)


### ⚠ BREAKING CHANGES

* drop node 12 support as it already reached EOL (#4599)

### Bug Fixes

* drop node 12 support as it already reached EOL ([#4599](https://github.com/netlify/build/issues/4599)) ([98d0d1e](https://github.com/netlify/build/commit/98d0d1e4db479fb9bb3a529de590f89aef7dd223))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/cache-utils bumped from ^4.1.6 to ^5.0.0
    * @netlify/config bumped from ^18.2.6 to ^19.0.0
    * @netlify/functions-utils bumped from ^4.2.11 to ^5.0.0
    * @netlify/git-utils bumped from ^4.1.4 to ^5.0.0
    * @netlify/run-utils bumped from ^4.0.2 to ^5.0.0
  * devDependencies
    * @netlify/nock-udp bumped from ^2.0.0 to ^3.0.0

## [27.20.5](https://github.com/netlify/build/compare/build-v27.20.4...build-v27.20.5) (2022-10-10)


### Bug Fixes

* migrate build package to Typescript ([#4565](https://github.com/netlify/build/issues/4565)) ([8e26956](https://github.com/netlify/build/commit/8e26956ba602a3b869489ed7375c3788ef101bc1))
* move js-client to mono repository and add types ([#4592](https://github.com/netlify/build/issues/4592)) ([7b7c926](https://github.com/netlify/build/commit/7b7c926390c4cb58f8d48688f7a8b928287a3184))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/config bumped from ^18.2.4 to ^18.2.5
    * @netlify/git-utils bumped from ^4.1.3 to ^4.1.4

## [27.20.4](https://github.com/netlify/build/compare/build-v27.20.3...build-v27.20.4) (2022-10-10)


### Bug Fixes

* **deps:** update dependency @netlify/edge-bundler to ^2.7.0 ([#4581](https://github.com/netlify/build/issues/4581)) ([cdfb574](https://github.com/netlify/build/commit/cdfb5747cfc012d997b3329536f48cc34c32690e))
* **deps:** update dependency @netlify/plugins-list to ^6.49.1 ([#4579](https://github.com/netlify/build/issues/4579)) ([33109e1](https://github.com/netlify/build/commit/33109e1527234168659c59e76a699fc047a1b46b))

## [27.20.2](https://github.com/netlify/build/compare/build-v27.20.1...build-v27.20.2) (2022-10-06)


### Bug Fixes

* **deps:** update dependency @netlify/plugins-list to ^6.48.0 ([#4567](https://github.com/netlify/build/issues/4567)) ([9a2964c](https://github.com/netlify/build/commit/9a2964cf1689bfd9754ecfcb6944ddfb4ec8e19c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/cache-utils bumped from ^4.1.5 to ^4.1.6

## [27.20.1](https://github.com/netlify/build/compare/build-v27.20.0...build-v27.20.1) (2022-10-03)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^2.6.0 ([#4563](https://github.com/netlify/build/issues/4563))
  ([ef21ea3](https://github.com/netlify/build/commit/ef21ea337ca20d158aa81767f3ac365e449b5966))

## [27.20.0](https://github.com/netlify/build/compare/build-v27.19.1...build-v27.20.0) (2022-10-03)

### Features

- allow edge function schema to have a display name ([#4549](https://github.com/netlify/build/issues/4549))
  ([f737c39](https://github.com/netlify/build/commit/f737c390d58f3e16695f692a05113412f1eed25c))

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^2.5.0 ([#4562](https://github.com/netlify/build/issues/4562))
  ([3d525f9](https://github.com/netlify/build/commit/3d525f918cf416247ff555033fdd5462697ed29a))

## [27.19.1](https://github.com/netlify/build/compare/build-v27.19.0...build-v27.19.1) (2022-10-03)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^2.4.0 ([#4554](https://github.com/netlify/build/issues/4554))
  ([196a5cf](https://github.com/netlify/build/commit/196a5cfce4a1665e49387900652f0a36ad184ead))

## [27.19.0](https://github.com/netlify/build/compare/build-v27.18.6...build-v27.19.0) (2022-10-03)

### Features

- add optional errorMetadata to error utils ([#4552](https://github.com/netlify/build/issues/4552))
  ([5ccaa05](https://github.com/netlify/build/commit/5ccaa0588f81314b41617b158b562d50983a6951))

## [27.18.6](https://github.com/netlify/build/compare/build-v27.18.5...build-v27.18.6) (2022-09-26)

### Bug Fixes

- build packages with lerna ([#4524](https://github.com/netlify/build/issues/4524))
  ([f74e385](https://github.com/netlify/build/commit/f74e385ffb7ffe7f3bfd5c3f80edc1b3249ca343))
- lerna caching ([#4533](https://github.com/netlify/build/issues/4533))
  ([4af0e1a](https://github.com/netlify/build/commit/4af0e1a9e0e5851e1d25b4acf41d1c4a98322019))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/cache-utils bumped from ^4.0.0 to ^4.1.5
    - @netlify/config bumped from ^18.2.3 to ^18.2.4
    - @netlify/functions-utils bumped from ^4.2.9 to ^4.2.10
    - @netlify/git-utils bumped from ^4.0.0 to ^4.1.2
    - @netlify/run-utils bumped from ^4.0.0 to ^4.0.2

## [27.18.5](https://github.com/netlify/build/compare/build-v27.18.4...build-v27.18.5) (2022-09-22)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.46.0 ([#4526](https://github.com/netlify/build/issues/4526))
  ([2c5a9d0](https://github.com/netlify/build/commit/2c5a9d065a9aa19f93f8030800e48f12e1c03c7a))

## [27.18.4](https://github.com/netlify/build/compare/build-v27.18.3...build-v27.18.4) (2022-09-20)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^2.2.0 ([#4522](https://github.com/netlify/build/issues/4522))
  ([9bfbe81](https://github.com/netlify/build/commit/9bfbe81db254752a12563e3329eae93d0bc120c0))
- **deps:** update dependency @netlify/plugins-list to ^6.45.0 ([#4518](https://github.com/netlify/build/issues/4518))
  ([69b76b3](https://github.com/netlify/build/commit/69b76b3fe6ec3fdd4ade6cbd34022414987efb27))

## [27.18.3](https://github.com/netlify/build/compare/build-v27.18.2...build-v27.18.3) (2022-09-19)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^2.1.0 ([#4516](https://github.com/netlify/build/issues/4516))
  ([0075544](https://github.com/netlify/build/commit/00755440b6ae905baeaa2a3d3af99ddbba4ebf42))

## [27.18.2](https://github.com/netlify/build/compare/build-v27.18.1...build-v27.18.2) (2022-09-16)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^7.1.2
  ([#4512](https://github.com/netlify/build/issues/4512))
  ([521c96d](https://github.com/netlify/build/commit/521c96d87cf49e87f22982bd61223a35401067e4))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.8 to ^4.2.9

## [27.18.1](https://github.com/netlify/build/compare/build-v27.18.0...build-v27.18.1) (2022-09-14)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^2.0.5 ([#4507](https://github.com/netlify/build/issues/4507))
  ([b3442f7](https://github.com/netlify/build/commit/b3442f7dc7659966f745d1f011c1017a22004e6d))

## [27.18.0](https://github.com/netlify/build/compare/build-v27.17.2...build-v27.18.0) (2022-09-13)

### Features

- add support for edge functions import maps with ESZIP ([#4508](https://github.com/netlify/build/issues/4508))
  ([ef794b4](https://github.com/netlify/build/commit/ef794b4372c1d89e3e008d57354cb582b56ebc7e))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.43.0 ([#4497](https://github.com/netlify/build/issues/4497))
  ([2ab7070](https://github.com/netlify/build/commit/2ab7070d02753dc28ddb237c5ec9e9235ce5172d))
- **deps:** update dependency @netlify/plugins-list to ^6.44.0 ([#4499](https://github.com/netlify/build/issues/4499))
  ([3a9554a](https://github.com/netlify/build/commit/3a9554a0a45f35c6c42dc9af6d287937e20c6309))

## [27.17.2](https://github.com/netlify/build/compare/build-v27.17.1...build-v27.17.2) (2022-09-08)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.42.0 ([#4496](https://github.com/netlify/build/issues/4496))
  ([f4c3294](https://github.com/netlify/build/commit/f4c3294f721f6d658b48c16ffd694f3481ff4105))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^7.1.1
  ([#4494](https://github.com/netlify/build/issues/4494))
  ([7a5dbd7](https://github.com/netlify/build/commit/7a5dbd71b3354089695472c5ecacd62cd00ea28a))
- rename edge functions constants types ([#4481](https://github.com/netlify/build/issues/4481))
  ([c85b462](https://github.com/netlify/build/commit/c85b462ec6c7417800b1f111c0445b080ad7c333))
- update check determining if runtime is being used ([#4492](https://github.com/netlify/build/issues/4492))
  ([a8ac291](https://github.com/netlify/build/commit/a8ac29130dc241ffb5034f0093d3eba995040319))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.7 to ^4.2.8

## [27.17.1](https://github.com/netlify/build/compare/build-v27.17.0...build-v27.17.1) (2022-09-06)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^7.1.0
  ([#4488](https://github.com/netlify/build/issues/4488))
  ([baccfe9](https://github.com/netlify/build/commit/baccfe931012e48449607407f180ddf2c960a53a))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.6 to ^4.2.7

## [27.17.0](https://github.com/netlify/build/compare/build-v27.16.2...build-v27.17.0) (2022-09-06)

### Features

- activate deployment configuration API ([#4449](https://github.com/netlify/build/issues/4449))
  ([85b13b9](https://github.com/netlify/build/commit/85b13b914cbe232764e069e98e56542c7a93b552))

## [27.16.2](https://github.com/netlify/build/compare/build-v27.16.1...build-v27.16.2) (2022-09-06)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v7 ([#4485](https://github.com/netlify/build/issues/4485))
  ([e885c87](https://github.com/netlify/build/commit/e885c87e0423655c6b68b5170ed17eb8d10c5c59))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.5 to ^4.2.6

## [27.16.1](https://github.com/netlify/build/compare/build-v27.16.0...build-v27.16.1) (2022-08-29)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.14.1 ([#4473](https://github.com/netlify/build/issues/4473))
  ([21e2ca0](https://github.com/netlify/build/commit/21e2ca087b0e5f678f088d5ee4b757bb653fd0f9))

## [27.16.0](https://github.com/netlify/build/compare/build-v27.15.7...build-v27.16.0) (2022-08-25)

### Features

- add reference to runtime when installing missing packages ([#4464](https://github.com/netlify/build/issues/4464))
  ([3517670](https://github.com/netlify/build/commit/3517670bee6d657f0f01a97414eee7b0cb0f3443))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.40.0 ([#4468](https://github.com/netlify/build/issues/4468))
  ([461e529](https://github.com/netlify/build/commit/461e529e54a496ab1c894e7b145266e5cc6b997e))
- **deps:** update dependency @netlify/plugins-list to ^6.41.0 ([#4471](https://github.com/netlify/build/issues/4471))
  ([6d554f2](https://github.com/netlify/build/commit/6d554f25ff3b34014c0f29f6cbafbe0c28e1b67d))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v6 ([#4469](https://github.com/netlify/build/issues/4469))
  ([a2c787d](https://github.com/netlify/build/commit/a2c787d5af504bba876ab905fad8af59881b94f0))
- length check for runtimes used ([#4466](https://github.com/netlify/build/issues/4466))
  ([90fb0b8](https://github.com/netlify/build/commit/90fb0b819a9e9cb9ede8002cbfc0ab4989256689))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.2.2 to ^18.2.3
    - @netlify/functions-utils bumped from ^4.2.4 to ^4.2.5

## [27.15.7](https://github.com/netlify/build/compare/build-v27.15.6...build-v27.15.7) (2022-08-23)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.14.0 ([#4463](https://github.com/netlify/build/issues/4463))
  ([4b1811b](https://github.com/netlify/build/commit/4b1811b0f12bfae9a7c3919ee3b7793d0e100559))
- improve prerelease matching in plugin list ([#4461](https://github.com/netlify/build/issues/4461))
  ([33a3bf6](https://github.com/netlify/build/commit/33a3bf67cef33b3bab83a780a64ccc84c18a21e2))

## [27.15.6](https://github.com/netlify/build/compare/build-v27.15.5...build-v27.15.6) (2022-08-19)

### Bug Fixes

- update semver logic ([#4459](https://github.com/netlify/build/issues/4459))
  ([3b191c8](https://github.com/netlify/build/commit/3b191c86eaedb733d8fdde4c7982fd4a3883047a))

## [27.15.5](https://github.com/netlify/build/compare/build-v27.15.4...build-v27.15.5) (2022-08-19)

### Bug Fixes

- include next runtime version in subheader ([#4457](https://github.com/netlify/build/issues/4457))
  ([faefd17](https://github.com/netlify/build/commit/faefd174da25726011580ed9e6747de51c3af9bd))

## [27.15.4](https://github.com/netlify/build/compare/build-v27.15.3...build-v27.15.4) (2022-08-19)

### Bug Fixes

- don't create context specific redirects ([#4446](https://github.com/netlify/build/issues/4446))
  ([3d6d811](https://github.com/netlify/build/commit/3d6d811f788771f2a2fbd05289f11f8ec27cf389))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.2.1 to ^18.2.2

## [27.15.2](https://github.com/netlify/build/compare/build-v27.15.1...build-v27.15.2) (2022-08-19)

### Bug Fixes

- revert feat: use utils.status.show to add no of edge functions to deploy summary
  ([#4443](https://github.com/netlify/build/issues/4443)) ([#4452](https://github.com/netlify/build/issues/4452))
  ([856e361](https://github.com/netlify/build/commit/856e361f9b6646469ca8752598f0e486fc3c5b4a))

## [27.15.1](https://github.com/netlify/build/compare/build-v27.15.0...build-v27.15.1) (2022-08-18)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.13.0 ([#4450](https://github.com/netlify/build/issues/4450))
  ([2b5a306](https://github.com/netlify/build/commit/2b5a306ac11d3769792ba138053da26565cba7fb))

## [27.15.0](https://github.com/netlify/build/compare/build-v27.14.0...build-v27.15.0) (2022-08-18)

### Features

- add existing nextjs plugin as a runtime ([#4447](https://github.com/netlify/build/issues/4447))
  ([3850ef0](https://github.com/netlify/build/commit/3850ef0e93295b2386c5037d56e08bc45269ed4f))
- use utils.status.show to add no of edge functions to deploy summary
  ([#4443](https://github.com/netlify/build/issues/4443))
  ([b662da0](https://github.com/netlify/build/commit/b662da04715b560a52d9fa79bdeeb4feb32a58ce))

## [27.14.0](https://github.com/netlify/build/compare/build-v27.13.0...build-v27.14.0) (2022-08-17)

### Features

- don't stop child processes of plugins in dev timeline ([#4444](https://github.com/netlify/build/issues/4444))
  ([a5c5934](https://github.com/netlify/build/commit/a5c593451fe47d7e4ffa86357af8124f9e2a1efb))
- pass metadata object to dynamic plugins ([#4442](https://github.com/netlify/build/issues/4442))
  ([d7a2194](https://github.com/netlify/build/commit/d7a2194734f809aa290e186d9488d2d42b43f59c))

## [27.13.0](https://github.com/netlify/build/compare/build-v27.12.0...build-v27.13.0) (2022-08-16)

### Features

- add `onPreDev` and `onDev` events ([#4431](https://github.com/netlify/build/issues/4431))
  ([0f03fee](https://github.com/netlify/build/commit/0f03fee82241223a897e87d9c840909781fed288))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.1.4 to ^18.2.0

## [27.12.0](https://github.com/netlify/build/compare/build-v27.11.5...build-v27.12.0) (2022-08-16)

### Features

- improve messaging around runtimes in log outputs ([#4436](https://github.com/netlify/build/issues/4436))
  ([3e391e7](https://github.com/netlify/build/commit/3e391e7b5983d17345c8aa13e3835f7530e55cde))

### Bug Fixes

- handle 422 ([#4418](https://github.com/netlify/build/issues/4418))
  ([1bb9c69](https://github.com/netlify/build/commit/1bb9c6981f9c91b0bd35163f89c41b39c1d7c195))

## [27.11.5](https://github.com/netlify/build/compare/build-v27.11.4...build-v27.11.5) (2022-08-16)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.13.5
  ([#4432](https://github.com/netlify/build/issues/4432))
  ([5ac5cd7](https://github.com/netlify/build/commit/5ac5cd7ad3b518580ea5a871eeeab5e72737c011))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.3 to ^4.2.4

## [27.11.3](https://github.com/netlify/build/compare/build-v27.11.2...build-v27.11.3) (2022-08-12)

### Bug Fixes

- hide `systemLogFile` flag from output ([#4427](https://github.com/netlify/build/issues/4427))
  ([1337b1b](https://github.com/netlify/build/commit/1337b1b3d43bc1dce7d1e82a10159cfcd4f72c15))
- pass system log to runCoreSteps ([#4429](https://github.com/netlify/build/issues/4429))
  ([9a42605](https://github.com/netlify/build/commit/9a4260543464201210a1cfc143bc6d4411ef2d82))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.1.2 to ^18.1.3

## [27.11.2](https://github.com/netlify/build/compare/build-v27.11.1...build-v27.11.2) (2022-08-10)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.12.1 ([#4425](https://github.com/netlify/build/issues/4425))
  ([b1daaa7](https://github.com/netlify/build/commit/b1daaa79a6420c56858ee0f8a664ede6858e4fa0))

## [27.11.1](https://github.com/netlify/build/compare/build-v27.11.0...build-v27.11.1) (2022-08-09)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.12.0 ([#4421](https://github.com/netlify/build/issues/4421))
  ([e6ea3cd](https://github.com/netlify/build/commit/e6ea3cd3896388783852b3bd2f3282955aff32ea))
- **deps:** update dependency @netlify/plugins-list to ^6.36.0 ([#4423](https://github.com/netlify/build/issues/4423))
  ([af20e88](https://github.com/netlify/build/commit/af20e8832b42025ff9575f05961e358aa4515527))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.13.4
  ([#4420](https://github.com/netlify/build/issues/4420))
  ([4e65d86](https://github.com/netlify/build/commit/4e65d86259396c0967f670b40d357227fd5c8890))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.2 to ^4.2.3

## [27.11.0](https://github.com/netlify/build/compare/build-v27.10.0...build-v27.11.0) (2022-08-08)

### Features

- improve serialization of system log input ([#4414](https://github.com/netlify/build/issues/4414))
  ([a873036](https://github.com/netlify/build/commit/a8730361b0da842351bb7586f858c85465f5f8c2))
- set Edge Bundler system logger behind feature flag ([#4415](https://github.com/netlify/build/issues/4415))
  ([390c989](https://github.com/netlify/build/commit/390c989a87207b1316dd5b70544b3b40f50b6fd9))

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.10.0 ([#4417](https://github.com/netlify/build/issues/4417))
  ([e1a806a](https://github.com/netlify/build/commit/e1a806a078f35eae9bce04d45cef232dc2ae8a73))

## [27.10.0](https://github.com/netlify/build/compare/build-v27.9.1...build-v27.10.0) (2022-08-08)

### Features

- pass system logger to Edge Bundler ([#4410](https://github.com/netlify/build/issues/4410))
  ([86fbb13](https://github.com/netlify/build/commit/86fbb13b2ac3be9b9702b482fe7359a234bee43d))

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.9.0 ([#4411](https://github.com/netlify/build/issues/4411))
  ([ad01334](https://github.com/netlify/build/commit/ad0133457a09466e02efccfbee87905d7e2ca62e))

## [27.9.1](https://github.com/netlify/build/compare/build-v27.9.0...build-v27.9.1) (2022-08-04)

### Bug Fixes

- do not print system logs to stdout when debug mode is off ([#4408](https://github.com/netlify/build/issues/4408))
  ([33fdac2](https://github.com/netlify/build/commit/33fdac28231fc708f2b0d9e2bc3a4a8990b7c644))

## [27.9.0](https://github.com/netlify/build/compare/build-v27.8.1...build-v27.9.0) (2022-08-03)

### Features

- add support for system logger ([#4406](https://github.com/netlify/build/issues/4406))
  ([6f89dcf](https://github.com/netlify/build/commit/6f89dcf83a772f69884d1d4faf4bdd597a76246b))

## [27.8.1](https://github.com/netlify/build/compare/build-v27.8.0...build-v27.8.1) (2022-08-01)

### Bug Fixes

- remove extraneous character from error group ([#4403](https://github.com/netlify/build/issues/4403))
  ([2cde5d3](https://github.com/netlify/build/commit/2cde5d3c1953c7277052c3ba24ebcca6f0adf4a9))

## [27.8.0](https://github.com/netlify/build/compare/build-v27.7.0...build-v27.8.0) (2022-08-01)

### Features

- improve normalization of function bundling errors ([#4400](https://github.com/netlify/build/issues/4400))
  ([5481309](https://github.com/netlify/build/commit/548130957f46814cca16df556bbca386b921a4ef))

### Bug Fixes

- group function bundling errors ([#4398](https://github.com/netlify/build/issues/4398))
  ([1bbb3e2](https://github.com/netlify/build/commit/1bbb3e2147be30b7fe0d146b5a16f5ffd44a74b8))

## [27.7.0](https://github.com/netlify/build/compare/build-v27.6.0...build-v27.7.0) (2022-07-29)

### Features

- add support for custom hashing group in errors ([#4394](https://github.com/netlify/build/issues/4394))
  ([531bc4a](https://github.com/netlify/build/commit/531bc4a1c4e44687493dca8717eb8ed6f383a740))
- improve error normalisation logic ([#4396](https://github.com/netlify/build/issues/4396))
  ([f829af1](https://github.com/netlify/build/commit/f829af1dd05159d8f5dbde54fb453e5a49b4db9b))

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.8.0 ([#4397](https://github.com/netlify/build/issues/4397))
  ([b94a59e](https://github.com/netlify/build/commit/b94a59e286be1cff6f769055cd87e1c06bd1b52e))

## [27.6.0](https://github.com/netlify/build/compare/build-v27.5.0...build-v27.6.0) (2022-07-28)

### Features

- pass build dir to edge functions bundling ([#4392](https://github.com/netlify/build/issues/4392))
  ([13a5de7](https://github.com/netlify/build/commit/13a5de705bc46d5b7812e92aaa87e7f90f30f7c9))
- validate Edge Functions manifest ([#4319](https://github.com/netlify/build/issues/4319))
  ([f3942ea](https://github.com/netlify/build/commit/f3942eac3e6c020fa52f60661f5300a0a0f45d27))

### Bug Fixes

- fix error message for edge function bundling errors ([#4393](https://github.com/netlify/build/issues/4393))
  ([28e584c](https://github.com/netlify/build/commit/28e584c71190fab4e092d4d9553041951b13a799))

## [27.5.0](https://github.com/netlify/build/compare/build-v27.4.2...build-v27.5.0) (2022-07-25)

### Features

- Add a way to pass extra data to the show util ([#4386](https://github.com/netlify/build/issues/4386))
  ([9722e36](https://github.com/netlify/build/commit/9722e36e9d9557e42ac33d1a7e31e55c9f7c1ae4))

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.7.0 ([#4387](https://github.com/netlify/build/issues/4387))
  ([6c42e43](https://github.com/netlify/build/commit/6c42e434a0f15e954073dc225d2c54afb50abc79))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.1.1 to ^18.1.2

## [27.4.2](https://github.com/netlify/build/compare/build-v27.4.1...build-v27.4.2) (2022-07-19)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.35.0 ([#4380](https://github.com/netlify/build/issues/4380))
  ([76aee64](https://github.com/netlify/build/commit/76aee64bf5ae192f3c7bd41c9c5a4b9f7d4ed8e3))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.13.2
  ([#4379](https://github.com/netlify/build/issues/4379))
  ([238d4f0](https://github.com/netlify/build/commit/238d4f095498b12b8c8abaaf9021e0405e4189cd))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.1 to ^4.2.2

## [27.4.1](https://github.com/netlify/build/compare/build-v27.4.0...build-v27.4.1) (2022-07-15)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.6.0 ([#4377](https://github.com/netlify/build/issues/4377))
  ([8f43342](https://github.com/netlify/build/commit/8f43342eb3d37e7e0a98926b31372caac7e2cd2a))
- **deps:** update dependency @netlify/plugins-list to ^6.34.0 ([#4373](https://github.com/netlify/build/issues/4373))
  ([f2e834e](https://github.com/netlify/build/commit/f2e834ed57acd48e471af765e6747b948838115b))

## [27.4.0](https://github.com/netlify/build/compare/build-v27.3.4...build-v27.4.0) (2022-07-14)

### Features

- log manifest out whilst in debug mode ([#4331](https://github.com/netlify/build/issues/4331))
  ([9639b5c](https://github.com/netlify/build/commit/9639b5c71e10e83a63f2fed3be6f7a3d2d5620d6))

## [27.3.4](https://github.com/netlify/build/compare/build-v27.3.3...build-v27.3.4) (2022-07-13)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.5.0 ([#4358](https://github.com/netlify/build/issues/4358))
  ([059d756](https://github.com/netlify/build/commit/059d756cf2c454b5f5dae505078c97bd2eae72ff))
- **deps:** update dependency @netlify/plugins-list to ^6.30.0 ([#4359](https://github.com/netlify/build/issues/4359))
  ([d409024](https://github.com/netlify/build/commit/d409024891a51a5b2570848f5c7ffa407ada12b6))
- **deps:** update dependency @netlify/plugins-list to ^6.32.0 ([#4369](https://github.com/netlify/build/issues/4369))
  ([0722a8e](https://github.com/netlify/build/commit/0722a8e23fa6d87d84c9e8cb49a5c98ba5a6e09b))
- **deps:** update dependency @netlify/plugins-list to ^6.33.0 ([#4371](https://github.com/netlify/build/issues/4371))
  ([6f6dad2](https://github.com/netlify/build/commit/6f6dad28fdf5be7251329ac4ff3e5428aea5af1c))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.12.0
  ([#4366](https://github.com/netlify/build/issues/4366))
  ([09195fc](https://github.com/netlify/build/commit/09195fcbe010cb410f56c7fdd408aa411bd4cdc2))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.13.0
  ([#4370](https://github.com/netlify/build/issues/4370))
  ([3cc5209](https://github.com/netlify/build/commit/3cc5209cd4f6f9273a534591d92b55ed9935f8f1))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.2.0 to ^4.2.1

## [27.3.3](https://github.com/netlify/build/compare/build-v27.3.2...build-v27.3.3) (2022-07-01)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.4.2 ([#4356](https://github.com/netlify/build/issues/4356))
  ([cd8d141](https://github.com/netlify/build/commit/cd8d141ee190faa725edbc785814f81f57fb62cd))

## [27.3.0](https://github.com/netlify/build/compare/build-v27.2.0...build-v27.3.0) (2022-06-24)

### Features

- cleanup `buildbot_build_go_functions, `zisi_parse_isc`and`buildbot_nft_transpile_esm` feature flags
  ([#4325](https://github.com/netlify/build/issues/4325))
  ([9a25714](https://github.com/netlify/build/commit/9a2571472902b300803f583701c86a941eb3b532))

### Bug Fixes

- **deps:** update @netlify/zip-it-and-ship-it to 5.11.0
  ([9a25714](https://github.com/netlify/build/commit/9a2571472902b300803f583701c86a941eb3b532))
- **deps:** update dependency @netlify/edge-bundler to ^1.4.1 ([#4333](https://github.com/netlify/build/issues/4333))
  ([e1768e1](https://github.com/netlify/build/commit/e1768e1a25bb1f9213f228990a7a357c29cc4099))
- **deps:** update dependency @netlify/plugins-list to ^6.29.0 ([#4339](https://github.com/netlify/build/issues/4339))
  ([306bde7](https://github.com/netlify/build/commit/306bde78057bb6798ca3c1bb32a4fff307c24110))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.11.1
  ([#4326](https://github.com/netlify/build/issues/4326))
  ([26f919a](https://github.com/netlify/build/commit/26f919a050354088a322e3a304379fce4aac97d6))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.1.15 to ^4.2.0

## [27.2.0](https://github.com/netlify/build/compare/build-v27.1.6...build-v27.2.0) (2022-06-22)

### Features

- ensure edge functions dist directory exists ([#4335](https://github.com/netlify/build/issues/4335))
  ([dc950d2](https://github.com/netlify/build/commit/dc950d27adfa39106fbc89c802f4ec5ffc36c976))

## [27.1.6](https://github.com/netlify/build/compare/build-v27.1.5...build-v27.1.6) (2022-06-21)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.3.0 ([#4332](https://github.com/netlify/build/issues/4332))
  ([f0e2b64](https://github.com/netlify/build/commit/f0e2b6407840a30611cb424db028b428d5ec814c))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/config bumped from ^18.0.0 to ^18.0.2

## [27.1.5](https://github.com/netlify/build/compare/build-v27.1.4...build-v27.1.5) (2022-06-15)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.2.1 ([#4324](https://github.com/netlify/build/issues/4324))
  ([d74da8f](https://github.com/netlify/build/commit/d74da8f3bc7c5d66e6091d6b1184ef1cf094be1a))
- **deps:** update dependency @netlify/plugins-list to ^6.28.0 ([#4322](https://github.com/netlify/build/issues/4322))
  ([24561cc](https://github.com/netlify/build/commit/24561cc94ea9bb0ba44ae88c48799a542911546d))

## [27.1.4](https://github.com/netlify/build/compare/build-v27.1.3...build-v27.1.4) (2022-06-14)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.2.0 ([#4307](https://github.com/netlify/build/issues/4307))
  ([62dd1f2](https://github.com/netlify/build/commit/62dd1f212ae0635deb73b6ea712ad10125c301c0))
- **deps:** update dependency @netlify/plugins-list to ^6.27.0 ([#4308](https://github.com/netlify/build/issues/4308))
  ([4b8e83b](https://github.com/netlify/build/commit/4b8e83b7a751a7ea7bc4972cf208ba4999bdb683))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.10.0
  ([#4311](https://github.com/netlify/build/issues/4311))
  ([741b113](https://github.com/netlify/build/commit/741b11387c5a8b2d8b5d3d79778234c1f3b64763))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.10.2
  ([#4316](https://github.com/netlify/build/issues/4316))
  ([1453ead](https://github.com/netlify/build/commit/1453ead32e4498eb2cd78238f6fe3d459184d727))
- fix compatibility with latest versions of ts-node ([#4314](https://github.com/netlify/build/issues/4314))
  ([cedb140](https://github.com/netlify/build/commit/cedb140b182f54ff2cec0cb78567e61d634d7e11))

### Dependencies

- The following workspace dependencies were updated
  - dependencies
    - @netlify/functions-utils bumped from ^4.0.0 to ^4.1.15

### [27.1.3](https://github.com/netlify/build/compare/build-v27.1.2...build-v27.1.3) (2022-05-19)

### Bug Fixes

- validate edge_functions in config
  ([24c8d27](https://github.com/netlify/build/commit/24c8d27479aec574380fd12ca2d8b578d56da702))
- validate edge_functions in config ([#4291](https://github.com/netlify/build/issues/4291))
  ([24c8d27](https://github.com/netlify/build/commit/24c8d27479aec574380fd12ca2d8b578d56da702))

### [27.1.2](https://github.com/netlify/build/compare/build-v27.1.1...build-v27.1.2) (2022-05-18)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.25.0 ([#4292](https://github.com/netlify/build/issues/4292))
  ([d0e5f13](https://github.com/netlify/build/commit/d0e5f133025735dcf0a2a49d584136b323738f1b))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.9.2
  ([#4295](https://github.com/netlify/build/issues/4295))
  ([b24094f](https://github.com/netlify/build/commit/b24094f24e0754d3b988eb1c786190815c253dc2))

### [27.1.1](https://github.com/netlify/build/compare/build-v27.1.0...build-v27.1.1) (2022-05-06)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to ^1.1.0 ([#4286](https://github.com/netlify/build/issues/4286))
  ([415ef80](https://github.com/netlify/build/commit/415ef8074393b8d28621381879a8d22bf77c91b4))
- **deps:** update dependency @netlify/plugins-list to ^6.23.0 ([#4283](https://github.com/netlify/build/issues/4283))
  ([44877e2](https://github.com/netlify/build/commit/44877e2e848acae6b9d51f09f51c64e124f404be))
- **deps:** update dependency @netlify/plugins-list to ^6.24.0 ([#4285](https://github.com/netlify/build/issues/4285))
  ([3f3f1d5](https://github.com/netlify/build/commit/3f3f1d5a4a3bd3f90326356c0750912293d126f5))
- fix report errors in runCoreSteps ([#4287](https://github.com/netlify/build/issues/4287))
  ([2b685ea](https://github.com/netlify/build/commit/2b685eae7b4dba5899bb7e7f65a1f5a50fc99307))

## [27.1.0](https://github.com/netlify/build/compare/build-v27.0.3...build-v27.1.0) (2022-05-04)

### Features

- export function to bundle edge functions ([#4271](https://github.com/netlify/build/issues/4271))
  ([704438f](https://github.com/netlify/build/commit/704438ffa2289eb0d898992af34e8f9ae7099f6c))

### [27.0.3](https://github.com/netlify/build/compare/build-v27.0.2...build-v27.0.3) (2022-05-04)

### Bug Fixes

- **deps:** update dependency @netlify/edge-bundler to v1 ([#4280](https://github.com/netlify/build/issues/4280))
  ([b840344](https://github.com/netlify/build/commit/b840344f8a74fd486a2754828c1d9eca957d3132))

### [27.0.2](https://github.com/netlify/build/compare/build-v27.0.1...build-v27.0.2) (2022-05-02)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.20.0 ([#4268](https://github.com/netlify/build/issues/4268))
  ([7f8324b](https://github.com/netlify/build/commit/7f8324be1bb1dc905b605526d2f3f30a9b607305))
- **deps:** update dependency @netlify/plugins-list to ^6.21.0 ([#4272](https://github.com/netlify/build/issues/4272))
  ([73bfde0](https://github.com/netlify/build/commit/73bfde0c99e641ab05bf5bdeb73b433ddac9121e))
- **deps:** update dependency @netlify/plugins-list to ^6.22.0 ([#4273](https://github.com/netlify/build/issues/4273))
  ([4ed357f](https://github.com/netlify/build/commit/4ed357f6a81b0e761b54a2dac08e0ea69f0b8dca))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.9.1
  ([#4267](https://github.com/netlify/build/issues/4267))
  ([e2447bf](https://github.com/netlify/build/commit/e2447bf44c4e60e629e4061cb5dcf7d127f60b33))

### [27.0.1](https://github.com/netlify/build/compare/build-v27.0.0...build-v27.0.1) (2022-04-19)

### Bug Fixes

- update `@netlify/config` to 18.0.0 ([#4265](https://github.com/netlify/build/issues/4265))
  ([a262044](https://github.com/netlify/build/commit/a2620440f9eb39f5db6c8fa238cc22aa6b2c377f))

## [27.0.0](https://github.com/netlify/build/compare/build-v26.5.3...build-v27.0.0) (2022-04-18)

### ⚠ BREAKING CHANGES

- rename Edge Handlers (#4263)

### Features

- rename Edge Handlers ([#4263](https://github.com/netlify/build/issues/4263))
  ([49c2805](https://github.com/netlify/build/commit/49c28057b671aefcc66e76840b44f469aa293ae6))

### [26.5.3](https://github.com/netlify/build/compare/build-v26.5.2...build-v26.5.3) (2022-04-11)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.19.0 ([#4255](https://github.com/netlify/build/issues/4255))
  ([0ed0111](https://github.com/netlify/build/commit/0ed011118cd7cb3cb796dfb3c4357e55cfd41252))

### [26.5.2](https://github.com/netlify/build/compare/build-v26.5.1...build-v26.5.2) (2022-04-04)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.18.0 ([#4245](https://github.com/netlify/build/issues/4245))
  ([57a56ff](https://github.com/netlify/build/commit/57a56ff37cbf668f5ce4784a0684fddc348af347))
- **deps:** update dependency @netlify/plugins-list to ^6.18.1 ([#4247](https://github.com/netlify/build/issues/4247))
  ([0011a47](https://github.com/netlify/build/commit/0011a47bd7148396b2ed78483f8892813b903f37))

### [26.5.1](https://github.com/netlify/build/compare/build-v26.5.0...build-v26.5.1) (2022-03-23)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.16.1 ([#4228](https://github.com/netlify/build/issues/4228))
  ([41182e0](https://github.com/netlify/build/commit/41182e027328ba4a99cf9d2f6d21e2086521b5aa))
- **deps:** update dependency @netlify/plugins-list to ^6.17.0 ([#4237](https://github.com/netlify/build/issues/4237))
  ([1ee5b47](https://github.com/netlify/build/commit/1ee5b47e54fbf709781d3a546d002f6fc95f8e43))
- non-writable `error.message` inside plugins ([#4234](https://github.com/netlify/build/issues/4234))
  ([509efdf](https://github.com/netlify/build/commit/509efdfe5fd41bdbeb3b9e930b07ac984531b785))

## [26.5.0](https://github.com/netlify/build/compare/build-v26.4.0...build-v26.5.0) (2022-03-14)

### Features

- add `INTERNAL_EDGE_HANDLERS_SRC` constant ([#4222](https://github.com/netlify/build/issues/4222))
  ([e969998](https://github.com/netlify/build/commit/e969998469e187b37d8423c809f589350dd3c158))

### Bug Fixes

- handle non-writable `error.name` ([#4227](https://github.com/netlify/build/issues/4227))
  ([2128d21](https://github.com/netlify/build/commit/2128d217825d09a16111fbf01647e87d597bd8c9))

## [26.4.0](https://github.com/netlify/build/compare/build-v26.3.14...build-v26.4.0) (2022-03-07)

### Features

- add edgeHandlersDistDir flag and EDGE_HANDLERS_DIST constant ([#4221](https://github.com/netlify/build/issues/4221))
  ([152b7d5](https://github.com/netlify/build/commit/152b7d54b81d39041c7031aa52a53f5f3ccc408a))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.16.0 ([#4211](https://github.com/netlify/build/issues/4211))
  ([273edd9](https://github.com/netlify/build/commit/273edd978f982531392a5d2e2bc45849ab72a19a))

### [26.3.14](https://github.com/netlify/build/compare/build-v26.3.13...build-v26.3.14) (2022-03-02)

### Bug Fixes

- add deploy-related environment variables to local builds ([#4209](https://github.com/netlify/build/issues/4209))
  ([a1b2133](https://github.com/netlify/build/commit/a1b21332847fc8de15bd45453eaa355347b0820b))

### [26.3.13](https://github.com/netlify/build/compare/build-v26.3.12...build-v26.3.13) (2022-03-02)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.15.0 ([#4205](https://github.com/netlify/build/issues/4205))
  ([6505597](https://github.com/netlify/build/commit/65055974766ac0761eb62b28c4f85b2b169eea8a))

### [26.3.12](https://github.com/netlify/build/compare/build-v26.3.11...build-v26.3.12) (2022-02-28)

### Bug Fixes

- remove feature flag `redirects_parser_normalize_status` ([#4190](https://github.com/netlify/build/issues/4190))
  ([29a001e](https://github.com/netlify/build/commit/29a001ea17f431d8c374057146f4272527113ce4))

### [26.3.11](https://github.com/netlify/build/compare/build-v26.3.10...build-v26.3.11) (2022-02-28)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^3.0.7
  ([#4201](https://github.com/netlify/build/issues/4201))
  ([0c99c98](https://github.com/netlify/build/commit/0c99c98f8724f4ab8d02c23bb2070c7d73d19854))

### [26.3.10](https://github.com/netlify/build/compare/build-v26.3.9...build-v26.3.10) (2022-02-25)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.14.0 ([#4193](https://github.com/netlify/build/issues/4193))
  ([a52dc78](https://github.com/netlify/build/commit/a52dc7852270f7704bb5fbe2b5798077736b06c2))

### [26.3.9](https://github.com/netlify/build/compare/build-v26.3.8...build-v26.3.9) (2022-02-25)

### Bug Fixes

- remove manifest feat flag check ([#4185](https://github.com/netlify/build/issues/4185))
  ([ed15696](https://github.com/netlify/build/commit/ed15696950c98fdeeb1897bef7b3c801ab29d6ca))

### [26.3.8](https://github.com/netlify/build/compare/build-v26.3.7...build-v26.3.8) (2022-02-24)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v13.0.4 ([#4177](https://github.com/netlify/build/issues/4177))
  ([cfebc70](https://github.com/netlify/build/commit/cfebc7027eaba58484c4d80e54c6a9c3b65369eb))

### [26.3.7](https://github.com/netlify/build/compare/build-v26.3.6...build-v26.3.7) (2022-02-24)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.9.0
  ([#4187](https://github.com/netlify/build/issues/4187))
  ([aa00e62](https://github.com/netlify/build/commit/aa00e62b1d03840d0ed91f89f98e5ee25cbb3e95))
- pass feature flags to `netlify-redirect-parser` and `netlify-headers-parser`
  ([#4184](https://github.com/netlify/build/issues/4184))
  ([ed87a71](https://github.com/netlify/build/commit/ed87a7174e4c73552a7ba8c8ae08a1075fdd433c))

### [26.3.6](https://github.com/netlify/build/compare/build-v26.3.5...build-v26.3.6) (2022-02-24)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.13.1 ([#4180](https://github.com/netlify/build/issues/4180))
  ([990f435](https://github.com/netlify/build/commit/990f435459bdc635be2c67bb03175a03f3ad1988))
- truncate headers/redirects in logs ([#4183](https://github.com/netlify/build/issues/4183))
  ([2471c49](https://github.com/netlify/build/commit/2471c49ede2aeaaaf4233c42020bc66448af8427))

### [26.3.5](https://github.com/netlify/build/compare/build-v26.3.4...build-v26.3.5) (2022-02-21)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.12.0 ([#4164](https://github.com/netlify/build/issues/4164))
  ([efdbb02](https://github.com/netlify/build/commit/efdbb027e0a321ae13b54b3d3c13432ec87df43a))

### [26.3.4](https://github.com/netlify/build/compare/build-v26.3.3...build-v26.3.4) (2022-02-21)

### Bug Fixes

- **deps:** update dependency log-process-errors to v8 ([#4169](https://github.com/netlify/build/issues/4169))
  ([1693621](https://github.com/netlify/build/commit/1693621caeccc8367ec3290d50e0f6d39d764843))
- truncate long headers and redirects in build logs ([#4172](https://github.com/netlify/build/issues/4172))
  ([216213f](https://github.com/netlify/build/commit/216213fc2f6f5ff9b61c3bb3a71afac7d7099ebf))

### [26.3.3](https://github.com/netlify/build/compare/build-v26.3.2...build-v26.3.3) (2022-02-15)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.11.0 ([#4157](https://github.com/netlify/build/issues/4157))
  ([161c145](https://github.com/netlify/build/commit/161c14567f5c3637884d598c5877d842cccf0337))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.8.0
  ([#4160](https://github.com/netlify/build/issues/4160))
  ([1cdbab7](https://github.com/netlify/build/commit/1cdbab77884dad4c5d1f21f433bf373b59b8cce4))

### [26.3.2](https://github.com/netlify/build/compare/build-v26.3.1...build-v26.3.2) (2022-02-14)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.7.5
  ([#4154](https://github.com/netlify/build/issues/4154))
  ([e7598e9](https://github.com/netlify/build/commit/e7598e9364cd617565b71149b96c6cdf3c0ba65d))

### [26.3.1](https://github.com/netlify/build/compare/build-v26.3.0...build-v26.3.1) (2022-02-14)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.10.2 ([#4148](https://github.com/netlify/build/issues/4148))
  ([9c605b2](https://github.com/netlify/build/commit/9c605b246c9b02f4dbddf3b083147a1a78c81577))

## [26.3.0](https://github.com/netlify/build/compare/build-v26.2.7...build-v26.3.0) (2022-02-11)

### Features

- pass `nodeVersion` property to zip-it-and-ship-it ([#4146](https://github.com/netlify/build/issues/4146))
  ([23c7ffe](https://github.com/netlify/build/commit/23c7ffe6a1a8cd7aa04d087274224a8d4dc8b9c1))

### [26.2.7](https://github.com/netlify/build/compare/build-v26.2.6...build-v26.2.7) (2022-02-10)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.10.1 ([#4145](https://github.com/netlify/build/issues/4145))
  ([ecc70c6](https://github.com/netlify/build/commit/ecc70c65d36412f91ab0167298da917de41787ba))
- **deps:** update dependency @sindresorhus/slugify to v2 ([#4110](https://github.com/netlify/build/issues/4110))
  ([9fae79c](https://github.com/netlify/build/commit/9fae79c3edc6cb2d3bc272e10f2c8305df24eefb))
- **deps:** update dependency ansi-escapes to v5 ([#4111](https://github.com/netlify/build/issues/4111))
  ([177cdb8](https://github.com/netlify/build/commit/177cdb88507d32ec2e16c75042d19ddc067f7793))
- **deps:** update dependency clean-stack to v4 ([#4112](https://github.com/netlify/build/issues/4112))
  ([3a46c8b](https://github.com/netlify/build/commit/3a46c8b3100a2b43883133553dc153f8b9080bf9))
- **deps:** update dependency figures to v4 ([#4113](https://github.com/netlify/build/issues/4113))
  ([c472081](https://github.com/netlify/build/commit/c472081f053acdea3f68363c76355c6a9d0f380b))
- **deps:** update dependency indent-string to v5 ([#4116](https://github.com/netlify/build/issues/4116))
  ([7726316](https://github.com/netlify/build/commit/77263163fa3c1019301a3393a04f25311718baed))
- **deps:** update dependency keep-func-props to v4 ([#4096](https://github.com/netlify/build/issues/4096))
  ([6a426ac](https://github.com/netlify/build/commit/6a426aca1c04a0b4d4aeb979ec541ab70743f2db))
- **deps:** update dependency log-process-errors to v7 ([#4119](https://github.com/netlify/build/issues/4119))
  ([427a172](https://github.com/netlify/build/commit/427a17219d88891cb407f7ffa75fed703f9f7ec6))
- **deps:** update dependency os-name to v5 ([#4098](https://github.com/netlify/build/issues/4098))
  ([aa958d3](https://github.com/netlify/build/commit/aa958d3f6cf16f83cff9cb2989bf45c706491a94))
- **deps:** update dependency p-event to v5 ([#4099](https://github.com/netlify/build/issues/4099))
  ([795d10b](https://github.com/netlify/build/commit/795d10b6e52b5a4a963045a3c0e13c8472b0d21d))
- **deps:** update dependency p-reduce to v3 ([#4122](https://github.com/netlify/build/issues/4122))
  ([b05d8e0](https://github.com/netlify/build/commit/b05d8e0770e8ddfd55b9c110d5ed4c236a74d65a))
- **deps:** update dependency path-type to v5 ([#4123](https://github.com/netlify/build/issues/4123))
  ([c8e6eba](https://github.com/netlify/build/commit/c8e6eba2526c76325fcd20aceac1c073cb4bd37b))
- **deps:** update dependency pkg-dir to v6 ([#4124](https://github.com/netlify/build/issues/4124))
  ([05b4f7c](https://github.com/netlify/build/commit/05b4f7c58b52749abac6a23a5a0f27b497f4eb5d))
- **deps:** update dependency ps-list to v8 ([#4103](https://github.com/netlify/build/issues/4103))
  ([b50a5f4](https://github.com/netlify/build/commit/b50a5f486a068c4d279eede2665929160685ed14))
- **deps:** update dependency string-width to v5 ([#4126](https://github.com/netlify/build/issues/4126))
  ([5da575f](https://github.com/netlify/build/commit/5da575f1aa0ec68eae2681a73fdbd11c91d41c7c))
- **deps:** update dependency supports-color to v9 ([#4128](https://github.com/netlify/build/issues/4128))
  ([723ef7d](https://github.com/netlify/build/commit/723ef7db5a8fde971226233a1a64cc5a20bba717))

### [26.2.6](https://github.com/netlify/build/compare/build-v26.2.5...build-v26.2.6) (2022-02-08)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.7.4
  ([#4142](https://github.com/netlify/build/issues/4142))
  ([de8221b](https://github.com/netlify/build/commit/de8221bac66a8ae530612a4fc35ed1d15c92beb8))

### [26.2.5](https://github.com/netlify/build/compare/build-v26.2.4...build-v26.2.5) (2022-02-08)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.7.2
  ([#4140](https://github.com/netlify/build/issues/4140))
  ([a984eb0](https://github.com/netlify/build/commit/a984eb0293d6ca4150f4ba450b52dcc792462882))

### [26.2.4](https://github.com/netlify/build/compare/build-v26.2.3...build-v26.2.4) (2022-02-08)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^3.0.6
  ([#4130](https://github.com/netlify/build/issues/4130))
  ([dd4bb09](https://github.com/netlify/build/commit/dd4bb0963b9f4a47bdb4175c300a9ce4b313d52e))
- **deps:** update dependency @netlify/plugins-list to ^6.7.0 ([#4086](https://github.com/netlify/build/issues/4086))
  ([8abd92c](https://github.com/netlify/build/commit/8abd92c7d51420167dbbed54f4dec58144ae6c07))
- **deps:** update dependency @netlify/plugins-list to ^6.9.0 ([#4132](https://github.com/netlify/build/issues/4132))
  ([2662c4f](https://github.com/netlify/build/commit/2662c4f553a5d5e70820e2e1257ca78663fc7722))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.7.0
  ([#4131](https://github.com/netlify/build/issues/4131))
  ([b045f61](https://github.com/netlify/build/commit/b045f6186459f77faff1ae4ff9109761873b60ea))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.7.1
  ([#4137](https://github.com/netlify/build/issues/4137))
  ([9d1ac08](https://github.com/netlify/build/commit/9d1ac08989308f244888b70fd01591207ce146d9))
- **deps:** update dependency chalk to v5 ([#4092](https://github.com/netlify/build/issues/4092))
  ([332a533](https://github.com/netlify/build/commit/332a5333b30fa01791689f8af080cc38c147cc98))
- **deps:** update dependency execa to v6 ([#4094](https://github.com/netlify/build/issues/4094))
  ([4511447](https://github.com/netlify/build/commit/4511447230ae5b582821b40499ae29d97af0aeae))
- **deps:** update dependency filter-obj to v3 ([#4095](https://github.com/netlify/build/issues/4095))
  ([cf364ea](https://github.com/netlify/build/commit/cf364ea6f4563a0377180ddc47c24621a81423ab))
- **deps:** update dependency is-plain-obj to v4 ([#4117](https://github.com/netlify/build/issues/4117))
  ([14585b0](https://github.com/netlify/build/commit/14585b0089376bfbf04cb9746a23aec4faf925c6))
- **deps:** update dependency locate-path to v7 ([#4097](https://github.com/netlify/build/issues/4097))
  ([b4b451f](https://github.com/netlify/build/commit/b4b451f2016ce255ac6634c6ebfa9078cd5e8b3f))
- **deps:** update dependency map-obj to v5 ([#4120](https://github.com/netlify/build/issues/4120))
  ([179269f](https://github.com/netlify/build/commit/179269ffe3f8747f320c5484ed67254d493d6997))
- **deps:** update dependency netlify to v11 ([#4136](https://github.com/netlify/build/issues/4136))
  ([e26e0ae](https://github.com/netlify/build/commit/e26e0aed973ba68ec9cee6ca5c709848739d1f05))
- **deps:** update dependency p-filter to v3 ([#4100](https://github.com/netlify/build/issues/4100))
  ([098268b](https://github.com/netlify/build/commit/098268b7a2a4e9f09f86c11b2fcf0c4bc9e8cfd0))
- **deps:** update dependency p-locate to v6 ([#4101](https://github.com/netlify/build/issues/4101))
  ([fea08d3](https://github.com/netlify/build/commit/fea08d31917c04cfb645f42638a94ebc09a400e3))
- **deps:** update dependency path-exists to v5 ([#4102](https://github.com/netlify/build/issues/4102))
  ([744421d](https://github.com/netlify/build/commit/744421d89d6e773bd96d82d3ceeb561ee5d7f3db))
- **deps:** update dependency read-pkg-up to v9 ([#4125](https://github.com/netlify/build/issues/4125))
  ([c04862e](https://github.com/netlify/build/commit/c04862e711ef7366b53b175af7ed127bdf1c61b6))
- **deps:** update dependency strip-ansi to v7 ([#4127](https://github.com/netlify/build/issues/4127))
  ([87c1bc6](https://github.com/netlify/build/commit/87c1bc65c01f339895d77372037482c213840882))
- pin `ts-node` version ([#4133](https://github.com/netlify/build/issues/4133))
  ([aa461ad](https://github.com/netlify/build/commit/aa461ade5eff697559c212a65181d346e011f0ab))

### [26.2.3](https://github.com/netlify/build/compare/build-v26.2.2...build-v26.2.3) (2022-02-03)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.4.1 ([#4074](https://github.com/netlify/build/issues/4074))
  ([8358efa](https://github.com/netlify/build/commit/8358efaae8c866df656d803427855aaa444bb41a))
- **deps:** update dependency @netlify/plugins-list to ^6.5.0 ([#4080](https://github.com/netlify/build/issues/4080))
  ([bcec21d](https://github.com/netlify/build/commit/bcec21d432e68d0db9cb5a8534d1f4de22b48a83))
- **deps:** update dependency @netlify/plugins-list to ^6.6.0 ([#4085](https://github.com/netlify/build/issues/4085))
  ([7afc52b](https://github.com/netlify/build/commit/7afc52bbddac12ba326c595e678a5262cda8a6df))

### [26.2.2](https://github.com/netlify/build/compare/build-v26.2.1...build-v26.2.2) (2022-01-27)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.3.2 ([#4060](https://github.com/netlify/build/issues/4060))
  ([b7118e9](https://github.com/netlify/build/commit/b7118e9f69589075152d119303f917a62760671e))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.5.2
  ([#4073](https://github.com/netlify/build/issues/4073))
  ([eaf1360](https://github.com/netlify/build/commit/eaf1360657511c7551cc1c2866f6486e16a136ca))

### [26.2.1](https://github.com/netlify/build/compare/build-v26.2.0...build-v26.2.1) (2022-01-26)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.5.0
  ([#4068](https://github.com/netlify/build/issues/4068))
  ([9fcb419](https://github.com/netlify/build/commit/9fcb4190d482a7fc5e9f5f4e2e6be13cad6323b9))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v5.5.1
  ([#4070](https://github.com/netlify/build/issues/4070))
  ([02b3bde](https://github.com/netlify/build/commit/02b3bde678aa35bfaceebd6ca288e2221d0fdce0))
- pin zip-it-and-ship-it to v5.4.1 ([#4066](https://github.com/netlify/build/issues/4066))
  ([75819aa](https://github.com/netlify/build/commit/75819aacf554bb0c21d053365947db5fc209deea))
- pin zip-it-and-ship-it to v5.4.1 ([#4071](https://github.com/netlify/build/issues/4071))
  ([ec8a057](https://github.com/netlify/build/commit/ec8a05711a5746fb985225f59b5856c6da70f4fd))

## [26.2.0](https://github.com/netlify/build/compare/build-v26.1.7...build-v26.2.0) (2022-01-19)

### Features

- pass `zipGo` property to ZISI ([#4058](https://github.com/netlify/build/issues/4058))
  ([1f45942](https://github.com/netlify/build/commit/1f45942711ed7b1e980c80b01a66077cf57a9e63))

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^5.5.0
  ([#4055](https://github.com/netlify/build/issues/4055))
  ([63b6374](https://github.com/netlify/build/commit/63b63747094fec205416e6c505206b607dcd4912))

### [26.1.7](https://github.com/netlify/build/compare/build-v26.1.6...build-v26.1.7) (2022-01-19)

### Bug Fixes

- **deps:** add missing ts-node peer dependencies ([#4052](https://github.com/netlify/build/issues/4052))
  ([51a48e8](https://github.com/netlify/build/commit/51a48e82095f4d87064824071fee254dd1603fda))

### [26.1.6](https://github.com/netlify/build/compare/build-v26.1.5...build-v26.1.6) (2022-01-18)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^5.4.1
  ([#4050](https://github.com/netlify/build/issues/4050))
  ([2a1a4e2](https://github.com/netlify/build/commit/2a1a4e298ff0e282a772be648f01eecaa449017e))

### [26.1.5](https://github.com/netlify/build/compare/build-v26.1.4...build-v26.1.5) (2022-01-18)

### Bug Fixes

- upgrade Yargs to v17 ([#4045](https://github.com/netlify/build/issues/4045))
  ([cce8fda](https://github.com/netlify/build/commit/cce8fda7c9eb77bd607c92c1c4d3aa88496ab4d0))

### [26.1.4](https://github.com/netlify/build/compare/build-v26.1.3...build-v26.1.4) (2022-01-17)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^3.0.4
  ([#4038](https://github.com/netlify/build/issues/4038))
  ([c474463](https://github.com/netlify/build/commit/c474463c0ef1fb85ce4d6c0da81414d05fa51408))
- **deps:** update dependency @netlify/plugins-list to ^6.3.0 ([#4041](https://github.com/netlify/build/issues/4041))
  ([b8871ac](https://github.com/netlify/build/commit/b8871ac6992533688eb91063d7cbe084d5de019d))
- **deps:** update yargs to v16.0.0 ([#4037](https://github.com/netlify/build/issues/4037))
  ([3d1a433](https://github.com/netlify/build/commit/3d1a433a2b8e401a3ede6225465fa25cc82dd553))

### [26.1.3](https://github.com/netlify/build/compare/build-v26.1.2...build-v26.1.3) (2022-01-13)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^3.0.3
  ([#4032](https://github.com/netlify/build/issues/4032))
  ([ff0793a](https://github.com/netlify/build/commit/ff0793ae44493b2c6bab7b6b007bc7cc578b9bdf))

### [26.1.2](https://github.com/netlify/build/compare/build-v26.1.1...build-v26.1.2) (2022-01-13)

### Bug Fixes

- use fs promises directly ([#4030](https://github.com/netlify/build/issues/4030))
  ([02c4309](https://github.com/netlify/build/commit/02c4309a8325a7bf69f7170d2a1fe992a31edff7))

### [26.1.1](https://github.com/netlify/build/compare/build-v26.1.0...build-v26.1.1) (2022-01-12)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^3.0.1
  ([#4015](https://github.com/netlify/build/issues/4015))
  ([c1fdcb8](https://github.com/netlify/build/commit/c1fdcb881fb95d475e6258da7867a4c4afa3be19))
- **deps:** update dependency @netlify/plugin-edge-handlers to ^3.0.2
  ([#4017](https://github.com/netlify/build/issues/4017))
  ([6a72a10](https://github.com/netlify/build/commit/6a72a109701b1b70570d0f3fcb9e754ae528ddc1))
- **deps:** update dependency @netlify/plugins-list to ^6.2.1 ([#4026](https://github.com/netlify/build/issues/4026))
  ([dad851a](https://github.com/netlify/build/commit/dad851aca78444dda61b1809cda85682156f0c4d))

## [26.1.0](https://www.github.com/netlify/build/compare/build-v26.0.2...build-v26.1.0) (2022-01-03)

### Features

- remove `buildbot_scheduled_functions` feature flag ([#3997](https://www.github.com/netlify/build/issues/3997))
  ([20d8b63](https://www.github.com/netlify/build/commit/20d8b634385563810e750b1152e48fd3dea38917))

### [26.0.2](https://www.github.com/netlify/build/compare/build-v26.0.1...build-v26.0.2) (2021-12-21)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^5.4.0
  ([#3973](https://www.github.com/netlify/build/issues/3973))
  ([5ad9d82](https://www.github.com/netlify/build/commit/5ad9d8204cef3e401e09ca845a129fa73c837581))
- use pure ES modules at the monorepo top level ([#3970](https://www.github.com/netlify/build/issues/3970))
  ([922ddc5](https://www.github.com/netlify/build/commit/922ddc5a0a52bc2ae39f5ec3e1f4aee597357706))

### [26.0.1](https://www.github.com/netlify/build/compare/build-v26.0.0...build-v26.0.1) (2021-12-21)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^5.3.1
  ([#3971](https://www.github.com/netlify/build/issues/3971))
  ([7b9ca99](https://www.github.com/netlify/build/commit/7b9ca99f82bacda4c09780f1bae290da77894e17))

## [26.0.0](https://www.github.com/netlify/build/compare/build-v25.0.3...build-v26.0.0) (2021-12-20)

### ⚠ BREAKING CHANGES

- use pure ES modules with `@netlify/build` (#3967)

### Miscellaneous Chores

- use pure ES modules with `@netlify/build` ([#3967](https://www.github.com/netlify/build/issues/3967))
  ([0fd5d1f](https://www.github.com/netlify/build/commit/0fd5d1fea070a7b1af2bbe40e11093da04b2efae))

### [25.0.3](https://www.github.com/netlify/build/compare/build-v25.0.2...build-v25.0.3) (2021-12-17)

### Bug Fixes

- use ESM-compatible JSON imports ([#3964](https://www.github.com/netlify/build/issues/3964))
  ([91b9063](https://www.github.com/netlify/build/commit/91b90632d5f32e6b3e372ac10ffbadbb0c36dc87))

### [25.0.2](https://www.github.com/netlify/build/compare/build-v25.0.1...build-v25.0.2) (2021-12-16)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^5.3.0
  ([#3961](https://www.github.com/netlify/build/issues/3961))
  ([e1edaf3](https://www.github.com/netlify/build/commit/e1edaf36c325e4a0f5e3f9ef4da971544cc5e697))

### [25.0.1](https://www.github.com/netlify/build/compare/build-v25.0.0...build-v25.0.1) (2021-12-15)

### Bug Fixes

- upgrade `@netlify/config`
  ([5afa49c](https://www.github.com/netlify/build/commit/5afa49c9179bfe57678a12fc59a00e7ad583a002))

## [25.0.0](https://www.github.com/netlify/build/compare/build-v24.0.1...build-v25.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with `@netlify/config` (#3945)

### Miscellaneous Chores

- use pure ES modules with `@netlify/config` ([#3945](https://www.github.com/netlify/build/issues/3945))
  ([96a2cfd](https://www.github.com/netlify/build/commit/96a2cfd8ea8024c570dad0f74dce4ebaa7b39659))

### [24.0.1](https://www.github.com/netlify/build/compare/build-v24.0.0...build-v24.0.1) (2021-12-15)

### Bug Fixes

- upgrade `cache-utils` to `4.0.0`
  ([23915a3](https://www.github.com/netlify/build/commit/23915a37b3d4c72a2c018338a8546a9abd4eec2d))

## [24.0.0](https://www.github.com/netlify/build/compare/build-v23.0.1...build-v24.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with `cache-utils` (#3944)

### Miscellaneous Chores

- use pure ES modules with `cache-utils` ([#3944](https://www.github.com/netlify/build/issues/3944))
  ([ca0ac3b](https://www.github.com/netlify/build/commit/ca0ac3b79acd62fd8a9ee37777fdfba6851b23ce))

### [23.0.1](https://www.github.com/netlify/build/compare/build-v23.0.0...build-v23.0.1) (2021-12-15)

### Bug Fixes

- upgrade `@netlify/functions-utils` to `4.0.0`
  ([ce736f8](https://www.github.com/netlify/build/commit/ce736f80dfaedfe8fa4efac4e4dc540773b22646))

## [23.0.0](https://www.github.com/netlify/build/compare/build-v22.0.1...build-v23.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with functions-utils (#3942)

### Miscellaneous Chores

- use pure ES modules with functions-utils ([#3942](https://www.github.com/netlify/build/issues/3942))
  ([590caad](https://www.github.com/netlify/build/commit/590caadbb6eaf304ad317b10bfce92ce1b0527a2))

### [22.0.1](https://www.github.com/netlify/build/compare/build-v22.0.0...build-v22.0.1) (2021-12-15)

### Bug Fixes

- upgrade `git-utils` to `4.0.0`
  ([d298142](https://www.github.com/netlify/build/commit/d298142f3a58cb24097a66bad0460702f4182695))

## [22.0.0](https://www.github.com/netlify/build/compare/build-v21.0.1...build-v22.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with `git-utils` (#3943)

### Miscellaneous Chores

- use pure ES modules with `git-utils` ([#3943](https://www.github.com/netlify/build/issues/3943))
  ([59a9189](https://www.github.com/netlify/build/commit/59a918987c5ba9755c3e684d12e82879dbbe8b54))

### [21.0.1](https://www.github.com/netlify/build/compare/build-v21.0.0...build-v21.0.1) (2021-12-15)

### Bug Fixes

- upgrade `run-utils` to `4.0.0`
  ([d242934](https://www.github.com/netlify/build/commit/d2429342b2d02d2b92b39344c1840bdd2a1adebe))

## [21.0.0](https://www.github.com/netlify/build/compare/build-v20.3.2...build-v21.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with `run-utils` (#3936)

### Miscellaneous Chores

- use pure ES modules with `run-utils` ([#3936](https://www.github.com/netlify/build/issues/3936))
  ([d2365aa](https://www.github.com/netlify/build/commit/d2365aa096b924bb95c98fe7cfc4fbae13cee14a))

### [20.3.2](https://www.github.com/netlify/build/compare/build-v20.3.1...build-v20.3.2) (2021-12-15)

### Bug Fixes

- load plugin utilities directly ([#3937](https://www.github.com/netlify/build/issues/3937))
  ([b8c708d](https://www.github.com/netlify/build/commit/b8c708d04b6982fe06b79e6f60d27638c4a22514))

### [20.3.1](https://www.github.com/netlify/build/compare/build-v20.3.0...build-v20.3.1) (2021-12-14)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^6.1.0
  ([#3938](https://www.github.com/netlify/build/issues/3938))
  ([96a3ffd](https://www.github.com/netlify/build/commit/96a3ffdaeaf782f71d3a12a9fb7c35fc0ccb843b))
- **deps:** update dependency @netlify/plugins-list to ^6.2.0
  ([#3941](https://www.github.com/netlify/build/issues/3941))
  ([04aa29d](https://www.github.com/netlify/build/commit/04aa29d711e406ec3db3fdd9c6186301b7f4cd15))

## [20.3.0](https://www.github.com/netlify/build/compare/build-v20.2.0...build-v20.3.0) (2021-12-10)

### Features

- add a verbose flag ([#3934](https://www.github.com/netlify/build/issues/3934))
  ([d7c9fd1](https://www.github.com/netlify/build/commit/d7c9fd1dc9d566e732a94c2455e9d2a993210bc3))

## [20.2.0](https://www.github.com/netlify/build/compare/build-v20.1.0...build-v20.2.0) (2021-12-09)

### Features

- add `buildbot_create_functions_manifest` feature flag ([#3806](https://www.github.com/netlify/build/issues/3806))
  ([d6e69ad](https://www.github.com/netlify/build/commit/d6e69ad2c5d5629b4c325df65e3024afe57c1d11))

## [20.1.0](https://www.github.com/netlify/build/compare/build-v20.0.4...build-v20.1.0) (2021-12-06)

### Features

- pass additional feature flags to zip-it-and-ship-it ([#3925](https://www.github.com/netlify/build/issues/3925))
  ([96ff2a8](https://www.github.com/netlify/build/commit/96ff2a8e83d6aad7340694ff026c46574268f5ad))

### [20.0.4](https://www.github.com/netlify/build/compare/build-v20.0.3...build-v20.0.4) (2021-12-02)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to v6 ([#3916](https://www.github.com/netlify/build/issues/3916))
  ([4410ce9](https://www.github.com/netlify/build/commit/4410ce903f01beaefb8a9c188169fecd4ab08365))

### [20.0.3](https://www.github.com/netlify/build/compare/build-v20.0.2...build-v20.0.3) (2021-12-02)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to v3
  ([#3915](https://www.github.com/netlify/build/issues/3915))
  ([a1d085f](https://www.github.com/netlify/build/commit/a1d085f4c62a2dc876d0f5bdf1c5849423755287))

### [20.0.2](https://www.github.com/netlify/build/compare/build-v20.0.1...build-v20.0.2) (2021-12-02)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^5.2.0
  ([#3912](https://www.github.com/netlify/build/issues/3912))
  ([52d6ec4](https://www.github.com/netlify/build/commit/52d6ec475efaecc21b0c0b9015c1486ee99e0b31))

### [20.0.1](https://www.github.com/netlify/build/compare/build-v20.0.0...build-v20.0.1) (2021-12-01)

### Bug Fixes

- add types for `utils.functions` ([#3851](https://www.github.com/netlify/build/issues/3851))
  ([d46dfb1](https://www.github.com/netlify/build/commit/d46dfb1601a0e3278a07cdeccb4676329f4c0ba1))

## [20.0.0](https://www.github.com/netlify/build/compare/build-v19.0.8...build-v20.0.0) (2021-12-01)

### ⚠ BREAKING CHANGES

- support pure ES modules in Build plugins (#3906)

### Features

- support pure ES modules in Build plugins ([#3906](https://www.github.com/netlify/build/issues/3906))
  ([2899378](https://www.github.com/netlify/build/commit/289937848b3e4b028d8fcc69f17b197740d2d192))

### [19.0.8](https://www.github.com/netlify/build/compare/build-v19.0.7...build-v19.0.8) (2021-12-01)

### Bug Fixes

- correct redirect conditions type ([#3908](https://www.github.com/netlify/build/issues/3908))
  ([0bdb973](https://www.github.com/netlify/build/commit/0bdb973287e689866b3a32aeff2109f664b49b20))

### [19.0.7](https://www.github.com/netlify/build/compare/build-v19.0.6...build-v19.0.7) (2021-11-29)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^5.1.0
  ([#3900](https://www.github.com/netlify/build/issues/3900))
  ([5a1063e](https://www.github.com/netlify/build/commit/5a1063ebc864d8d467e7d340c6132f65d5e57fc3))

### [19.0.6](https://www.github.com/netlify/build/compare/build-v19.0.5...build-v19.0.6) (2021-11-25)

### Bug Fixes

- force release ([#3896](https://www.github.com/netlify/build/issues/3896))
  ([23e3781](https://www.github.com/netlify/build/commit/23e378177e6656ddc06be3fe76b894dcef54cc0f))

### [19.0.5](https://www.github.com/netlify/build/compare/build-v19.0.4...build-v19.0.5) (2021-11-25)

### Bug Fixes

- remove @ungap/from-entries ([#3882](https://www.github.com/netlify/build/issues/3882))
  ([56fb539](https://www.github.com/netlify/build/commit/56fb5399ac48a1889ef039318d24e0aef19126f3))
- remove `array-flat-polyfill` ([#3883](https://www.github.com/netlify/build/issues/3883))
  ([a70ee72](https://www.github.com/netlify/build/commit/a70ee72ba481e7ab15da357773ef9033d5b9ddeb))

### [19.0.4](https://www.github.com/netlify/build/compare/build-v19.0.3...build-v19.0.4) (2021-11-25)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to v2
  ([#3888](https://www.github.com/netlify/build/issues/3888))
  ([8f9ca41](https://www.github.com/netlify/build/commit/8f9ca418d4c62e94a5255e1d02601f02bfec46ad))

### [19.0.3](https://www.github.com/netlify/build/compare/build-v19.0.2...build-v19.0.3) (2021-11-24)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v5
  ([#3884](https://www.github.com/netlify/build/issues/3884))
  ([d617aa1](https://www.github.com/netlify/build/commit/d617aa1c4aeb75968392dcefcd0e15d42c2d653b))

### [19.0.2](https://www.github.com/netlify/build/compare/build-v19.0.1...build-v19.0.2) (2021-11-24)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to v5 ([#3876](https://www.github.com/netlify/build/issues/3876))
  ([ea7dfef](https://www.github.com/netlify/build/commit/ea7dfefa63a2c48b6201719b77253d45e2f3e68c))

### [19.0.1](https://www.github.com/netlify/build/compare/build-v19.0.0...build-v19.0.1) (2021-11-24)

### Bug Fixes

- netlify build dependencies ([#3877](https://www.github.com/netlify/build/issues/3877))
  ([1a3f8ea](https://www.github.com/netlify/build/commit/1a3f8ea0827da2ff78d0832c2a016eca2c27af2e))

## [19.0.0](https://www.github.com/netlify/build/compare/build-v18.25.2...build-v19.0.0) (2021-11-24)

### ⚠ BREAKING CHANGES

- drop support for Node 10 (#3873)

### Miscellaneous Chores

- drop support for Node 10 ([#3873](https://www.github.com/netlify/build/issues/3873))
  ([ae8224d](https://www.github.com/netlify/build/commit/ae8224da8bca4f8c216afb6723664eb7095f1e98))

### [18.25.2](https://www.github.com/netlify/build/compare/build-v18.25.1...build-v18.25.2) (2021-11-22)

### Bug Fixes

- simplify plugin types debugging ([#3862](https://www.github.com/netlify/build/issues/3862))
  ([79ab338](https://www.github.com/netlify/build/commit/79ab338ffe8ce530e3ce0079d61b3b39e68f1cc9))

### [18.25.1](https://www.github.com/netlify/build/compare/build-v18.25.0...build-v18.25.1) (2021-11-19)

### Bug Fixes

- calling `ts-node` in production ([#3859](https://www.github.com/netlify/build/issues/3859))
  ([53f1409](https://www.github.com/netlify/build/commit/53f1409bca91119ee79c784c9d3b52f9235503e2))

## [18.25.0](https://www.github.com/netlify/build/compare/build-v18.24.0...build-v18.25.0) (2021-11-19)

### Features

- add TypeScript error information on type failures ([#3857](https://www.github.com/netlify/build/issues/3857))
  ([ccf032b](https://www.github.com/netlify/build/commit/ccf032b121bd3b6ea1e04655ccbb7602668b26e2))

## [18.24.0](https://www.github.com/netlify/build/compare/build-v18.23.1...build-v18.24.0) (2021-11-18)

### Features

- add `buildbot_nft_transpile_esm` feature flag ([#3854](https://www.github.com/netlify/build/issues/3854))
  ([b0b270d](https://www.github.com/netlify/build/commit/b0b270d55a9421591759d6118911aa36b98f8fe7))

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.30.0
  ([#3856](https://www.github.com/netlify/build/issues/3856))
  ([08394d2](https://www.github.com/netlify/build/commit/08394d28108e5992d519a5b8f85d5e9e2b76d465))

### [18.23.1](https://www.github.com/netlify/build/compare/build-v18.23.0...build-v18.23.1) (2021-11-17)

### Bug Fixes

- allow `interface`s to be used as Plugins generics inputs ([#3850](https://www.github.com/netlify/build/issues/3850))
  ([8935b8e](https://www.github.com/netlify/build/commit/8935b8e4153623f3029d843d6e8d766acc12cf4c))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.29.5
  ([#3853](https://www.github.com/netlify/build/issues/3853))
  ([1177871](https://www.github.com/netlify/build/commit/11778716953fce48e946d8f12b2e6f6b9a0d1ad3))
- improve verbosity of `netlifyConfig.functions.*` changes ([#3843](https://www.github.com/netlify/build/issues/3843))
  ([a4c1949](https://www.github.com/netlify/build/commit/a4c1949cece6ba107c493bab3fc3a21c9411125e))

## [18.23.0](https://www.github.com/netlify/build/compare/build-v18.22.0...build-v18.23.0) (2021-11-15)

### Features

- warn about large function bundles ([#3831](https://www.github.com/netlify/build/issues/3831))
  ([994695c](https://www.github.com/netlify/build/commit/994695cb8e758a9648ab6490e019b7c8755d0a48))

## [18.22.0](https://www.github.com/netlify/build/compare/build-v18.21.10...build-v18.22.0) (2021-11-12)

### Features

- pass `nftTranspile` feature flag to ZISI ([#3817](https://www.github.com/netlify/build/issues/3817))
  ([ef015e5](https://www.github.com/netlify/build/commit/ef015e533b7b8fb777b9e9ab808e281ffef5004a))

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.29.4
  ([#3841](https://www.github.com/netlify/build/issues/3841))
  ([6beaad0](https://www.github.com/netlify/build/commit/6beaad06db6639aa620335eed7881b610f20684b))

### [18.21.10](https://www.github.com/netlify/build/compare/build-v18.21.9...build-v18.21.10) (2021-11-11)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^4.2.0
  ([#3830](https://www.github.com/netlify/build/issues/3830))
  ([fb28a97](https://www.github.com/netlify/build/commit/fb28a97a43f70bb6a16feffb4bcba44b921e64fd))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.29.3
  ([#3835](https://www.github.com/netlify/build/issues/3835))
  ([d5347d0](https://www.github.com/netlify/build/commit/d5347d05fa6d1a4ea54dd27fb7c6f29568724589))

### [18.21.9](https://www.github.com/netlify/build/compare/build-v18.21.8...build-v18.21.9) (2021-11-11)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.29.2
  ([#3833](https://www.github.com/netlify/build/issues/3833))
  ([90652ad](https://www.github.com/netlify/build/commit/90652ad4ef85807ddfe030d8912d1dfb475b1f51))

### [18.21.8](https://www.github.com/netlify/build/compare/build-v18.21.7...build-v18.21.8) (2021-11-08)

### Bug Fixes

- **deps:** update dependency memoize-one to v6 ([#3785](https://www.github.com/netlify/build/issues/3785))
  ([a201789](https://www.github.com/netlify/build/commit/a2017899c70b28049ee877980ee65525991264ec))

### [18.21.7](https://www.github.com/netlify/build/compare/build-v18.21.6...build-v18.21.7) (2021-11-08)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.29.1
  ([#3827](https://www.github.com/netlify/build/issues/3827))
  ([646ac65](https://www.github.com/netlify/build/commit/646ac6548ad48c54614945e87ad3608e771747d7))

### [18.21.6](https://www.github.com/netlify/build/compare/build-v18.21.5...build-v18.21.6) (2021-11-05)

### Bug Fixes

- export more build plugin types ([#3816](https://www.github.com/netlify/build/issues/3816))
  ([51b34f1](https://www.github.com/netlify/build/commit/51b34f12fbe32fdfa5c84456017af0f5e1284993))

### [18.21.5](https://www.github.com/netlify/build/compare/build-v18.21.4...build-v18.21.5) (2021-11-05)

### Bug Fixes

- updates to plugin options types ([#3812](https://www.github.com/netlify/build/issues/3812))
  ([8419eab](https://www.github.com/netlify/build/commit/8419eab6389ada0b0967eacf39deef33d041a700))

### [18.21.4](https://www.github.com/netlify/build/compare/build-v18.21.3...build-v18.21.4) (2021-11-04)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.29.0
  ([#3813](https://www.github.com/netlify/build/issues/3813))
  ([7cbc5a8](https://www.github.com/netlify/build/commit/7cbc5a8874e821fec1e474ed493c9feb55dbd504))

### [18.21.3](https://www.github.com/netlify/build/compare/build-v18.21.2...build-v18.21.3) (2021-11-03)

### Bug Fixes

- report TOML parsing errors as user errors ([#3807](https://www.github.com/netlify/build/issues/3807))
  ([ed2d084](https://www.github.com/netlify/build/commit/ed2d0848724263674316783073374cc03eacbb66))

### [18.21.2](https://www.github.com/netlify/build/compare/build-v18.21.1...build-v18.21.2) (2021-11-02)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.28.3
  ([#3803](https://www.github.com/netlify/build/issues/3803))
  ([a18cb09](https://www.github.com/netlify/build/commit/a18cb0941f34cbf9e18deb6ee1b741496a8d4414))

### [18.21.1](https://www.github.com/netlify/build/compare/build-v18.21.0...build-v18.21.1) (2021-11-02)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.28.2
  ([#3801](https://www.github.com/netlify/build/issues/3801))
  ([6c9dbe5](https://www.github.com/netlify/build/commit/6c9dbe5850ff909fb53344c98e8a6bc80ac860f3))

## [18.21.0](https://www.github.com/netlify/build/compare/build-v18.20.1...build-v18.21.0) (2021-11-02)

### Features

- allow TypeScript with local plugins ([#3778](https://www.github.com/netlify/build/issues/3778))
  ([25f2790](https://www.github.com/netlify/build/commit/25f2790c58aa60a5c04a89848c148a241087dda4))
- **build:** add INTERNAL_FUNCTIONS_SRC to types ([#3797](https://www.github.com/netlify/build/issues/3797))
  ([d29a789](https://www.github.com/netlify/build/commit/d29a7898ef82fe196a75ee1c84c6888036c649d6))

### [18.20.1](https://www.github.com/netlify/build/compare/build-v18.20.0...build-v18.20.1) (2021-10-29)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^4.1.0
  ([#3779](https://www.github.com/netlify/build/issues/3779))
  ([881dc26](https://www.github.com/netlify/build/commit/881dc261dd99159ca97ebfafbcefab4c782f3692))

## [18.20.0](https://www.github.com/netlify/build/compare/build-v18.19.2...build-v18.20.0) (2021-10-28)

### Features

- test Build plugins TypeScript types ([#3775](https://www.github.com/netlify/build/issues/3775))
  ([1ee449c](https://www.github.com/netlify/build/commit/1ee449c430bf9c656dc20d5f896fdbfb7e60e327))

### [18.19.2](https://www.github.com/netlify/build/compare/build-v18.19.1...build-v18.19.2) (2021-10-27)

### Bug Fixes

- `plugins` TypeScript types ([#3772](https://www.github.com/netlify/build/issues/3772))
  ([2d73d5d](https://www.github.com/netlify/build/commit/2d73d5d37c86dea8098efbce4750f2e0858f12a0))
- `utils.build.*` TypeScript types ([#3773](https://www.github.com/netlify/build/issues/3773))
  ([982da11](https://www.github.com/netlify/build/commit/982da11fb78d67d32a841c1929cf4d23005350a0))
- `utils.cache.list()` TypeScript types ([#3774](https://www.github.com/netlify/build/issues/3774))
  ([c0e28bc](https://www.github.com/netlify/build/commit/c0e28bcad3ee37f88d8fe7f455cfc0f9ba43265a))

### [18.19.1](https://www.github.com/netlify/build/compare/build-v18.19.0...build-v18.19.1) (2021-10-27)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.28.0
  ([#3768](https://www.github.com/netlify/build/issues/3768))
  ([1c06d60](https://www.github.com/netlify/build/commit/1c06d60f85500511fb4a7f7d6a55cec6d1cc3827))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.28.1
  ([#3770](https://www.github.com/netlify/build/issues/3770))
  ([48858eb](https://www.github.com/netlify/build/commit/48858eb2adfafdcf7cb739dca97a765a1c66c964))

## [18.19.0](https://www.github.com/netlify/build/compare/build-v18.18.0...build-v18.19.0) (2021-10-26)

### Features

- pass through functions[].schedule property to ZISI ([#3761](https://www.github.com/netlify/build/issues/3761))
  ([d3ccdc4](https://www.github.com/netlify/build/commit/d3ccdc4b9844a5b0e6397434189007e059b386f7))

## [18.18.0](https://www.github.com/netlify/build/compare/build-v18.17.7...build-v18.18.0) (2021-10-26)

### Features

- add `buildbot_zisi_trace_nft` feature flag ([#3765](https://www.github.com/netlify/build/issues/3765))
  ([f2ea534](https://www.github.com/netlify/build/commit/f2ea534f1ddbaa4ffe0586cde0a2076e3ffff177))

### [18.17.7](https://www.github.com/netlify/build/compare/build-v18.17.6...build-v18.17.7) (2021-10-25)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.27.0
  ([#3763](https://www.github.com/netlify/build/issues/3763))
  ([ee73e3d](https://www.github.com/netlify/build/commit/ee73e3d492b6d03a4865912bf7d4912a584b1550))

### [18.17.6](https://www.github.com/netlify/build/compare/build-v18.17.5...build-v18.17.6) (2021-10-21)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.26.1
  ([#3756](https://www.github.com/netlify/build/issues/3756))
  ([0113c44](https://www.github.com/netlify/build/commit/0113c44d53e2d6fefa002c7eac7aa6cb1a2c4984))

### [18.17.5](https://www.github.com/netlify/build/compare/build-v18.17.4...build-v18.17.5) (2021-10-18)

### Bug Fixes

- optionality in types of `Redirect` ([#3749](https://www.github.com/netlify/build/issues/3749))
  ([568516f](https://www.github.com/netlify/build/commit/568516f6a8ea5546de5a62181832f12745761fc2))

### [18.17.4](https://www.github.com/netlify/build/compare/build-v18.17.3...build-v18.17.4) (2021-10-18)

### Bug Fixes

- **build:** allow specifying plugin options from NetlifyPlugin definition
  ([#3745](https://www.github.com/netlify/build/issues/3745))
  ([b27e7c9](https://www.github.com/netlify/build/commit/b27e7c930f9280ccf7ec602e962760115d46ee90))

### [18.17.3](https://www.github.com/netlify/build/compare/build-v18.17.2...build-v18.17.3) (2021-10-18)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.26.0
  ([#3746](https://www.github.com/netlify/build/issues/3746))
  ([682fe81](https://www.github.com/netlify/build/commit/682fe81729b81beb4629889e4b581ab66e235d90))

### [18.17.2](https://www.github.com/netlify/build/compare/build-v18.17.1...build-v18.17.2) (2021-10-15)

### Bug Fixes

- force release ([#3738](https://www.github.com/netlify/build/issues/3738))
  ([a8db88d](https://www.github.com/netlify/build/commit/a8db88d31ffdbe97e10657059f67316a8cb4cb68))

### [18.17.1](https://www.github.com/netlify/build/compare/build-v18.17.0...build-v18.17.1) (2021-10-14)

### Bug Fixes

- improve build logs related to plugin event handlers ([#3721](https://www.github.com/netlify/build/issues/3721))
  ([e1a33fe](https://www.github.com/netlify/build/commit/e1a33fe72adbeb1e85d0bbf09f47d7b709571588))

## [18.17.0](https://www.github.com/netlify/build/compare/build-v18.16.0...build-v18.17.0) (2021-10-13)

### Features

- **build:** add opt-in support for generics for better type-safety for plugins' `inputs`
  ([#3728](https://www.github.com/netlify/build/issues/3728))
  ([86c896b](https://www.github.com/netlify/build/commit/86c896b3850bf0ab031844f6eafefea0dc731eac))

## [18.16.0](https://www.github.com/netlify/build/compare/build-v18.15.3...build-v18.16.0) (2021-10-13)

### Features

- allow `nft` as a value for `node_bundler` ([#3720](https://www.github.com/netlify/build/issues/3720))
  ([248c69c](https://www.github.com/netlify/build/commit/248c69c838fa2defa366dbb3d4b4c4c7786d6af5))
- pass `featureFlags` to `listFunctions` call ([#3727](https://www.github.com/netlify/build/issues/3727))
  ([088ff1b](https://www.github.com/netlify/build/commit/088ff1bba18be6e49447ba2b250f1cb5f5d3af22))

### [18.15.3](https://www.github.com/netlify/build/compare/build-v18.15.2...build-v18.15.3) (2021-10-13)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.25.0
  ([#3729](https://www.github.com/netlify/build/issues/3729))
  ([c7f55e8](https://www.github.com/netlify/build/commit/c7f55e881909fa26964eda3fc6534bfdc2d5bbe0))

### [18.15.2](https://www.github.com/netlify/build/compare/build-v18.15.1...build-v18.15.2) (2021-10-12)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^4.0.1
  ([#3724](https://www.github.com/netlify/build/issues/3724))
  ([d501051](https://www.github.com/netlify/build/commit/d5010517adb33635f0c26a04ee39a9422636cb1f))

### [18.15.1](https://www.github.com/netlify/build/compare/build-v18.15.0...build-v18.15.1) (2021-10-12)

### Bug Fixes

- **build:** add missing types folder to files field in package.json
  ([#3716](https://www.github.com/netlify/build/issues/3716))
  ([29d7d61](https://www.github.com/netlify/build/commit/29d7d61b6fdac0c7d3710baeadf1858740de65ac))

## [18.15.0](https://www.github.com/netlify/build/compare/build-v18.14.1...build-v18.15.0) (2021-10-12)

### Features

- add `buildbot_build_go_functions` feature flag ([#3717](https://www.github.com/netlify/build/issues/3717))
  ([d6cfa9b](https://www.github.com/netlify/build/commit/d6cfa9b624686c763fc77927c5fafd9b9816b3e9))

### [18.14.1](https://www.github.com/netlify/build/compare/build-v18.14.0...build-v18.14.1) (2021-10-11)

### Bug Fixes

- rename `command` to `step` in build logs ([#3714](https://www.github.com/netlify/build/issues/3714))
  ([fbcbb40](https://www.github.com/netlify/build/commit/fbcbb406d51568cbf6333465c6b7c0d202d93ffc))

## [18.14.0](https://www.github.com/netlify/build/compare/build-v18.13.12...build-v18.14.0) (2021-10-11)

### Features

- **build:** add TypeScript types for plugins ([#3698](https://www.github.com/netlify/build/issues/3698))
  ([539934d](https://www.github.com/netlify/build/commit/539934da8c71566744dff8440a02cb85716afd6b))

### [18.13.12](https://www.github.com/netlify/build/compare/build-v18.13.11...build-v18.13.12) (2021-10-11)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.24.0
  ([#3710](https://www.github.com/netlify/build/issues/3710))
  ([0ac9f4c](https://www.github.com/netlify/build/commit/0ac9f4ce0b0976e1b8a2071f1cd8a7e6dd14a41b))

### [18.13.11](https://www.github.com/netlify/build/compare/build-v18.13.10...build-v18.13.11) (2021-10-07)

### Bug Fixes

- `@netlify/config` user errors ([#3696](https://www.github.com/netlify/build/issues/3696))
  ([b4c4125](https://www.github.com/netlify/build/commit/b4c4125a46e3ca9176a2b209e054bda9513f5aba))

### [18.13.10](https://www.github.com/netlify/build/compare/build-v18.13.9...build-v18.13.10) (2021-10-07)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.23.6
  ([#3699](https://www.github.com/netlify/build/issues/3699))
  ([ebf3385](https://www.github.com/netlify/build/commit/ebf33850f60f318ffd137c9838d3d3139c8abe28))

### [18.13.9](https://www.github.com/netlify/build/compare/build-v18.13.8...build-v18.13.9) (2021-10-06)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.23.5
  ([#3693](https://www.github.com/netlify/build/issues/3693))
  ([3f417f4](https://www.github.com/netlify/build/commit/3f417f4088baa7c6090d86440c06a2df8a66b1cd))

### [18.13.8](https://www.github.com/netlify/build/compare/build-v18.13.7...build-v18.13.8) (2021-10-05)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.23.4
  ([#3687](https://www.github.com/netlify/build/issues/3687))
  ([a6ab7b9](https://www.github.com/netlify/build/commit/a6ab7b9dbfebd21bcedcb5dbada4d1620cd6192a))
- simplify plugin's Node.js version in local builds ([#3691](https://www.github.com/netlify/build/issues/3691))
  ([bd0b102](https://www.github.com/netlify/build/commit/bd0b1024d3e7bb6c69493e12eb0f75876f11c9ec))

### [18.13.7](https://www.github.com/netlify/build/compare/build-v18.13.6...build-v18.13.7) (2021-10-04)

### Bug Fixes

- warn when using odd backslash sequences in netlify.toml ([#3677](https://www.github.com/netlify/build/issues/3677))
  ([d3029ac](https://www.github.com/netlify/build/commit/d3029ac8de1e270c2fc2717ed24786506cd112cc))

### [18.13.6](https://www.github.com/netlify/build/compare/build-v18.13.5...build-v18.13.6) (2021-09-30)

### Bug Fixes

- check for functionsSrc in "module not found" error ([#3674](https://www.github.com/netlify/build/issues/3674))
  ([34f771f](https://www.github.com/netlify/build/commit/34f771f384234fa5dfd50f605c8c4dfa2c7d7656))

### [18.13.5](https://www.github.com/netlify/build/compare/build-v18.13.4...build-v18.13.5) (2021-09-29)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.23.3
  ([#3669](https://www.github.com/netlify/build/issues/3669))
  ([cb3fa5f](https://www.github.com/netlify/build/commit/cb3fa5fba1b9e3dd1d7c712d343d3c5adb6db599))

### [18.13.4](https://www.github.com/netlify/build/compare/build-v18.13.3...build-v18.13.4) (2021-09-27)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to v4 ([#3668](https://www.github.com/netlify/build/issues/3668))
  ([098c109](https://www.github.com/netlify/build/commit/098c1092ec3dfa1930ffdaa0e8e8a59703d01930))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.23.2
  ([#3665](https://www.github.com/netlify/build/issues/3665))
  ([adc1c43](https://www.github.com/netlify/build/commit/adc1c43fcfb381b79655cddca407d2965a21b61a))

### [18.13.3](https://www.github.com/netlify/build/compare/build-v18.13.2...build-v18.13.3) (2021-09-27)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^3.6.2
  ([#3664](https://www.github.com/netlify/build/issues/3664))
  ([99e472c](https://www.github.com/netlify/build/commit/99e472c2be55764bd0459232dce29b5c8401ffed))

### [18.13.2](https://www.github.com/netlify/build/compare/build-v18.13.1...build-v18.13.2) (2021-09-27)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^3.6.1
  ([#3656](https://www.github.com/netlify/build/issues/3656))
  ([b8f89da](https://www.github.com/netlify/build/commit/b8f89da94ea515e63ffa0babaece6430b00fca7b))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.23.1
  ([#3663](https://www.github.com/netlify/build/issues/3663))
  ([64cf36d](https://www.github.com/netlify/build/commit/64cf36db8dc441e1670c4b73fa4e74c6d526f4cc))

### [18.13.1](https://www.github.com/netlify/build/compare/build-v18.13.0...build-v18.13.1) (2021-09-23)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.23.0
  ([#3653](https://www.github.com/netlify/build/issues/3653))
  ([8d36249](https://www.github.com/netlify/build/commit/8d362492ffb2e73d0edfb29968dff8f97319b935))

## [18.13.0](https://www.github.com/netlify/build/compare/build-v18.12.0...build-v18.13.0) (2021-09-23)

### Features

- add support for `parseWithEsbuild` feature flag ([#3632](https://www.github.com/netlify/build/issues/3632))
  ([7f2b4dd](https://www.github.com/netlify/build/commit/7f2b4ddce79e69ab08aa2dc7493cc14e2a0c651f))

## [18.12.0](https://www.github.com/netlify/build/compare/build-v18.11.2...build-v18.12.0) (2021-09-21)

### Features

- use internal functions directory in functions utils ([#3630](https://www.github.com/netlify/build/issues/3630))
  ([7a17b00](https://www.github.com/netlify/build/commit/7a17b007852436b5e259c2fffde58f90abb7ab2c))

### [18.11.2](https://www.github.com/netlify/build/compare/build-v18.11.1...build-v18.11.2) (2021-09-21)

### Bug Fixes

- remove zisiEsbuildDynamicImports feature flag ([#3638](https://www.github.com/netlify/build/issues/3638))
  ([c7a139d](https://www.github.com/netlify/build/commit/c7a139dcdbac344b5501b8c742163c3ab188ed34))

### [18.11.1](https://www.github.com/netlify/build/compare/build-v18.11.0...build-v18.11.1) (2021-09-21)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.22.0
  ([#3634](https://www.github.com/netlify/build/issues/3634))
  ([e1175a3](https://www.github.com/netlify/build/commit/e1175a37c5d1af72bf3298a1060cfd1bf2d4cf07))

## [18.11.0](https://www.github.com/netlify/build/compare/build-v18.10.0...build-v18.11.0) (2021-09-20)

### Features

- **build:** pass ES module feature flag to zisi ([#3619](https://www.github.com/netlify/build/issues/3619))
  ([5002fc4](https://www.github.com/netlify/build/commit/5002fc4ed0ec63ae89dbd2f43e21446097226afc))

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.21.1
  ([#3633](https://www.github.com/netlify/build/issues/3633))
  ([5f70b85](https://www.github.com/netlify/build/commit/5f70b850f470c18d8b015b0e150b598fe8c8a571))

## [18.10.0](https://www.github.com/netlify/build/compare/build-v18.9.1...build-v18.10.0) (2021-09-15)

### Features

- remove `netlify_build_warning_missing_headers` feature flag
  ([#3612](https://www.github.com/netlify/build/issues/3612))
  ([fd255b0](https://www.github.com/netlify/build/commit/fd255b0029cc40b0bf99782228b9c78892c2b550))

### [18.9.1](https://www.github.com/netlify/build/compare/build-v18.9.0...build-v18.9.1) (2021-09-15)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.21.0
  ([#3614](https://www.github.com/netlify/build/issues/3614))
  ([541da43](https://www.github.com/netlify/build/commit/541da43fd57b1d0413a649d0b948c4f4ff7aba3d))

## [18.9.0](https://www.github.com/netlify/build/compare/build-v18.8.0...build-v18.9.0) (2021-09-14)

### Features

- warn when `_headers`/`_redirects` file is missing ([#3608](https://www.github.com/netlify/build/issues/3608))
  ([254a03b](https://www.github.com/netlify/build/commit/254a03b17bbeed7bc14a27b3be384357c1f72216))

## [18.8.0](https://www.github.com/netlify/build/compare/build-v18.7.4...build-v18.8.0) (2021-09-07)

### Features

- remove `builders` and `buildersDistDir` ([#3581](https://www.github.com/netlify/build/issues/3581))
  ([d27906b](https://www.github.com/netlify/build/commit/d27906bc1390dbeb6ebc64279ce7475d418a8514))

### [18.7.4](https://www.github.com/netlify/build/compare/build-v18.7.3...build-v18.7.4) (2021-09-06)

### Bug Fixes

- **deps:** update dependency got to v10 ([#3488](https://www.github.com/netlify/build/issues/3488))
  ([6be8f2b](https://www.github.com/netlify/build/commit/6be8f2bd3b48c18c5ce58d1a2f2189c9c0c9b3c2))

### [18.7.3](https://www.github.com/netlify/build/compare/build-v18.7.2...build-v18.7.3) (2021-09-01)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^3.6.0
  ([#3582](https://www.github.com/netlify/build/issues/3582))
  ([a7bdb43](https://www.github.com/netlify/build/commit/a7bdb433242791fb3bb6bb4f32ce9c5c2eb0f907))
- error handling of syntax errors in plugin configuration changes
  ([#3586](https://www.github.com/netlify/build/issues/3586))
  ([56d902d](https://www.github.com/netlify/build/commit/56d902d88353b5b836ca4124b94532fb744470fc))

### [18.7.2](https://www.github.com/netlify/build/compare/build-v18.7.1...build-v18.7.2) (2021-08-27)

### Bug Fixes

- internal functions directory ([#3564](https://www.github.com/netlify/build/issues/3564))
  ([11144f4](https://www.github.com/netlify/build/commit/11144f4728147fe59a4ffef7e0fc18274e48d913))
- revert `utils.functions.add()` fix ([#3570](https://www.github.com/netlify/build/issues/3570))
  ([4f247d1](https://www.github.com/netlify/build/commit/4f247d15c0e06783332736a98757eb575113123b))

### [18.7.1](https://www.github.com/netlify/build/compare/build-v18.7.0...build-v18.7.1) (2021-08-27)

### Bug Fixes

- file path resolution of `INTERNAL_BUILDERS_SRC` ([#3566](https://www.github.com/netlify/build/issues/3566))
  ([2b614b2](https://www.github.com/netlify/build/commit/2b614b2fd5ed5bed7e753b6e16b90135033e2de3))

## [18.7.0](https://www.github.com/netlify/build/compare/build-v18.6.0...build-v18.7.0) (2021-08-27)

### Features

- add `builders` configuration to `@netlify/build` ([#3563](https://www.github.com/netlify/build/issues/3563))
  ([daecb3b](https://www.github.com/netlify/build/commit/daecb3b2f95a690f9454ca8ab6e76d2d671ea574))

## [18.6.0](https://www.github.com/netlify/build/compare/build-v18.5.0...build-v18.6.0) (2021-08-26)

### Features

- add `builders.*` and `builders.directory` configuration properties to `@netlify/config`
  ([#3560](https://www.github.com/netlify/build/issues/3560))
  ([4e9b757](https://www.github.com/netlify/build/commit/4e9b757efcdeec5477cd278ec57feb02dbe49248))

## [18.5.0](https://www.github.com/netlify/build/compare/build-v18.4.3...build-v18.5.0) (2021-08-24)

### Features

- add `--buildersDistDir` flag ([#3552](https://www.github.com/netlify/build/issues/3552))
  ([49037dd](https://www.github.com/netlify/build/commit/49037dd01e29094255a11ae78ba330c0166348fe))

### [18.4.3](https://www.github.com/netlify/build/compare/build-v18.4.2...build-v18.4.3) (2021-08-24)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^3.4.0
  ([#3544](https://www.github.com/netlify/build/issues/3544))
  ([978f4d1](https://www.github.com/netlify/build/commit/978f4d19723cad958c3a293cc875bc8cf33c5692))
- **deps:** update dependency @netlify/plugins-list to ^3.5.0
  ([#3546](https://www.github.com/netlify/build/issues/3546))
  ([72c067a](https://www.github.com/netlify/build/commit/72c067a7eed0b2ccb0cdc6b1b34cb8618e4afef4))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.20.0
  ([#3551](https://www.github.com/netlify/build/issues/3551))
  ([fd2d891](https://www.github.com/netlify/build/commit/fd2d89196ad01882c396894d8f968310bb6bc172))

### [18.4.2](https://www.github.com/netlify/build/compare/build-v18.4.1...build-v18.4.2) (2021-08-20)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.19.0
  ([#3535](https://www.github.com/netlify/build/issues/3535))
  ([eb11110](https://www.github.com/netlify/build/commit/eb11110b9fc6a54f8f063b2db63c47757b2a3c11))

### [18.4.1](https://www.github.com/netlify/build/compare/build-v18.4.0...build-v18.4.1) (2021-08-19)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.18.0
  ([#3530](https://www.github.com/netlify/build/issues/3530))
  ([7addb52](https://www.github.com/netlify/build/commit/7addb5290e11065282dc91692ed0c4b5f66990d8))

## [18.4.0](https://www.github.com/netlify/build/compare/build-v18.3.0...build-v18.4.0) (2021-08-18)

### Features

- **build-id:** add a `build-id` flag and expose `BUILD_ID` based on said flag
  ([#3527](https://www.github.com/netlify/build/issues/3527))
  ([94a4a03](https://www.github.com/netlify/build/commit/94a4a03f337d3c2195f4b4a1912f778893ebf485))

## [18.3.0](https://www.github.com/netlify/build/compare/build-v18.2.12...build-v18.3.0) (2021-08-18)

### Features

- **telemetry:** report both build and deploy ids ([#3520](https://www.github.com/netlify/build/issues/3520))
  ([97e36bd](https://www.github.com/netlify/build/commit/97e36bd5c93753fb958ea3e9e7829a7ca3d1e54b))

### [18.2.12](https://www.github.com/netlify/build/compare/build-v18.2.11...build-v18.2.12) (2021-08-17)

### Bug Fixes

- **deps:** update dependency os-name to v5 ([#3493](https://www.github.com/netlify/build/issues/3493))
  ([47b724b](https://www.github.com/netlify/build/commit/47b724b9a5c6b724356ccfc4106257c1fbe2a69e))

### [18.2.11](https://www.github.com/netlify/build/compare/build-v18.2.10...build-v18.2.11) (2021-08-17)

### Bug Fixes

- **deps:** update dependency log-process-errors to v6 ([#3491](https://www.github.com/netlify/build/issues/3491))
  ([c7f1dd4](https://www.github.com/netlify/build/commit/c7f1dd4d4ded87e39cc97b3cb8f53e825e4b4f8b))

### [18.2.10](https://www.github.com/netlify/build/compare/build-v18.2.9...build-v18.2.10) (2021-08-16)

### Bug Fixes

- **deps:** update dependency is-plain-obj to v3 ([#3489](https://www.github.com/netlify/build/issues/3489))
  ([b353eec](https://www.github.com/netlify/build/commit/b353eece861296ef18de8e19855a6b2e30ac4fba))
- **deps:** update dependency locate-path to v6 ([#3490](https://www.github.com/netlify/build/issues/3490))
  ([523b049](https://www.github.com/netlify/build/commit/523b0496c90e4c80fcabd406022a2423b12d0a90))
- **deps:** update dependency pkg-dir to v5 ([#3497](https://www.github.com/netlify/build/issues/3497))
  ([7a0ec32](https://www.github.com/netlify/build/commit/7a0ec3273e486956fae3be63c8808062569cee50))

### [18.2.9](https://www.github.com/netlify/build/compare/build-v18.2.8...build-v18.2.9) (2021-08-16)

### Bug Fixes

- **deps:** update dependency p-locate to v5 ([#3495](https://www.github.com/netlify/build/issues/3495))
  ([ce07fbc](https://www.github.com/netlify/build/commit/ce07fbccc5e93224e7adab5dc039f9534a49f06b))
- **deps:** update dependency pretty-ms to v7 ([#3498](https://www.github.com/netlify/build/issues/3498))
  ([435629a](https://www.github.com/netlify/build/commit/435629a8f2368582cc1b01b12298911ccb548a70))

### [18.2.8](https://www.github.com/netlify/build/compare/build-v18.2.7...build-v18.2.8) (2021-08-13)

### Bug Fixes

- **deps:** update dependency supports-color to v8 ([#3466](https://www.github.com/netlify/build/issues/3466))
  ([2cdf370](https://www.github.com/netlify/build/commit/2cdf370a5347772ec6437b41679bec5eceb3311f))
- **deps:** update dependency update-notifier to v5 ([#3467](https://www.github.com/netlify/build/issues/3467))
  ([d34a0d7](https://www.github.com/netlify/build/commit/d34a0d76721d551d1a3bf6dc8a77ea123c92b3e5))
- rely on `package.engines.node` for plugin version support instead of a hardcoded var
  ([#3474](https://www.github.com/netlify/build/issues/3474))
  ([3c8c7b2](https://www.github.com/netlify/build/commit/3c8c7b2714f65755ec14ca2d19396a7f6836ca66))
- **utils:** remove condition around `require.resolve` invocation
  ([#3480](https://www.github.com/netlify/build/issues/3480))
  ([f29d7c1](https://www.github.com/netlify/build/commit/f29d7c1badd2467fef8d13920d1199e7988abde2))

### [18.2.7](https://www.github.com/netlify/build/compare/build-v18.2.6...build-v18.2.7) (2021-08-13)

### Bug Fixes

- **deps:** update dependency ps-list to v7 ([#3465](https://www.github.com/netlify/build/issues/3465))
  ([05398cc](https://www.github.com/netlify/build/commit/05398ccb97c986e4c7ec88df4ac108c8ec17142c))

### [18.2.6](https://www.github.com/netlify/build/compare/build-v18.2.5...build-v18.2.6) (2021-08-13)

### Bug Fixes

- **deps:** remove cp-file usage ([#3470](https://www.github.com/netlify/build/issues/3470))
  ([5b98fb4](https://www.github.com/netlify/build/commit/5b98fb494478cc0e7676856ce38f980b406306b9))

### [18.2.5](https://www.github.com/netlify/build/compare/build-v18.2.4...build-v18.2.5) (2021-08-13)

### Bug Fixes

- **deps:** update dependency get-stream to v6 ([#3456](https://www.github.com/netlify/build/issues/3456))
  ([478a039](https://www.github.com/netlify/build/commit/478a03946579729a5796eb1a395389eafcc9168e))

### [18.2.4](https://www.github.com/netlify/build/compare/build-v18.2.3...build-v18.2.4) (2021-08-12)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to v2 ([#3448](https://www.github.com/netlify/build/issues/3448))
  ([3d83dce](https://www.github.com/netlify/build/commit/3d83dce6efa68df5ef090e57958eff6f78c8f065))

### [18.2.3](https://www.github.com/netlify/build/compare/build-v18.2.2...build-v18.2.3) (2021-08-12)

### Bug Fixes

- delete `_redirects`/`_headers` when persisted to `netlify.toml`
  ([#3446](https://www.github.com/netlify/build/issues/3446))
  ([4bdf2cc](https://www.github.com/netlify/build/commit/4bdf2ccb64edae4254a9b7832f46e2cbeeb322eb))

### [18.2.2](https://www.github.com/netlify/build/compare/build-v18.2.1...build-v18.2.2) (2021-08-12)

### Bug Fixes

- **deps:** bump execa to the latest version (5.x) ([#3440](https://www.github.com/netlify/build/issues/3440))
  ([3e8bd01](https://www.github.com/netlify/build/commit/3e8bd019eddca738a664af9590c313dd5fcd20df))

### [18.2.1](https://www.github.com/netlify/build/compare/build-v18.2.0...build-v18.2.1) (2021-08-12)

### Bug Fixes

- avoid debug mode to be too verbose ([#3437](https://www.github.com/netlify/build/issues/3437))
  ([23dc159](https://www.github.com/netlify/build/commit/23dc1591d8a2de3ffb2b2e1f54e5068ea361c681))

## [18.2.0](https://www.github.com/netlify/build/compare/build-v18.1.0...build-v18.2.0) (2021-08-12)

### Features

- improve warning messages shown with invalid redirects/headers
  ([#3426](https://www.github.com/netlify/build/issues/3426))
  ([6eb42ce](https://www.github.com/netlify/build/commit/6eb42ced66873e3bd95226d6ad6937cdb71536d6))

## [18.1.0](https://www.github.com/netlify/build/compare/build-v18.0.3...build-v18.1.0) (2021-08-12)

### Features

- remove some double newlines in the build logs ([#3425](https://www.github.com/netlify/build/issues/3425))
  ([d17af96](https://www.github.com/netlify/build/commit/d17af96445a142aeb57256af33cbe854ead93a6d))

### [18.0.3](https://www.github.com/netlify/build/compare/build-v18.0.2...build-v18.0.3) (2021-08-12)

### Bug Fixes

- **deps:** bump clean-stack to 3.x ([#3429](https://www.github.com/netlify/build/issues/3429))
  ([eb94887](https://www.github.com/netlify/build/commit/eb94887298428ca27c28131439cfaf5284f609f8))

### [18.0.2](https://www.github.com/netlify/build/compare/build-v18.0.1...build-v18.0.2) (2021-08-11)

### Bug Fixes

- error handling of headers and redirects ([#3422](https://www.github.com/netlify/build/issues/3422))
  ([add5417](https://www.github.com/netlify/build/commit/add54178e5b046d6ec8d7cc44ac626135a25b9e6))

### [18.0.1](https://www.github.com/netlify/build/compare/build-v18.0.0...build-v18.0.1) (2021-08-11)

### Bug Fixes

- `@netlify/config` upgrade
  ([bd118ed](https://www.github.com/netlify/build/commit/bd118edfd083bdae19da984cb78e2a7a35335d3e))

## [18.0.0](https://www.github.com/netlify/build/compare/build-v17.11.0...build-v18.0.0) (2021-08-11)

### ⚠ BREAKING CHANGES

- add `netlifyConfig.headers` (#3407)

### Features

- add `netlifyConfig.headers` ([#3407](https://www.github.com/netlify/build/issues/3407))
  ([14888c7](https://www.github.com/netlify/build/commit/14888c73278b6c68538ecaa385e5ce01932b7e09))

## [17.11.0](https://www.github.com/netlify/build/compare/build-v17.10.0...build-v17.11.0) (2021-08-11)

### Features

- pass `rustTargetDirectory` to ZISI ([#3411](https://www.github.com/netlify/build/issues/3411))
  ([0287d22](https://www.github.com/netlify/build/commit/0287d221d804f0cbe5036ce7d170c3f7271a32b3))

## [17.10.0](https://www.github.com/netlify/build/compare/build-v17.9.2...build-v17.10.0) (2021-08-10)

### Features

- fix log messages related to redirects upload ([#3412](https://www.github.com/netlify/build/issues/3412))
  ([8a2fcc1](https://www.github.com/netlify/build/commit/8a2fcc1eb87430f3bcb5f6cfa8a7a87d952a089e))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^3.3.0
  ([#3405](https://www.github.com/netlify/build/issues/3405))
  ([64e3a62](https://www.github.com/netlify/build/commit/64e3a626881f2116a5c27571fb5110f35035c508))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.17.0
  ([#3409](https://www.github.com/netlify/build/issues/3409))
  ([6942dcd](https://www.github.com/netlify/build/commit/6942dcd83b7908710e994b39b5ef4323cf88f039))

### [17.9.2](https://www.github.com/netlify/build/compare/build-v17.9.1...build-v17.9.2) (2021-08-05)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to ^8.2.0
  ([#3399](https://www.github.com/netlify/build/issues/3399))
  ([70911c9](https://www.github.com/netlify/build/commit/70911c91729d02475684b179febe9b07e23df293))

### [17.9.1](https://www.github.com/netlify/build/compare/build-v17.9.0...build-v17.9.1) (2021-08-05)

### Bug Fixes

- `redirects[*].status` should not be a float in `netlify.toml`
  ([#3396](https://www.github.com/netlify/build/issues/3396))
  ([1c006ea](https://www.github.com/netlify/build/commit/1c006eae3de54e034dbcd87de5e011b6bfa843e6))

## [17.9.0](https://www.github.com/netlify/build/compare/build-v17.8.0...build-v17.9.0) (2021-08-04)

### Features

- allow modifying `build.environment` ([#3389](https://www.github.com/netlify/build/issues/3389))
  ([76d3bc9](https://www.github.com/netlify/build/commit/76d3bc9c77e28cf500ada47289c01d394d6da6db))
- do not log modified `build.environment` ([#3392](https://www.github.com/netlify/build/issues/3392))
  ([cb734f3](https://www.github.com/netlify/build/commit/cb734f372279ad15472b0de7e04a8dda417925e3))
- update environment variables with `netlifyConfig.build.environment`
  ([#3393](https://www.github.com/netlify/build/issues/3393))
  ([9ef37af](https://www.github.com/netlify/build/commit/9ef37af440df8701917f68e70d104b117b8ae5c5))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^3.2.1
  ([#3390](https://www.github.com/netlify/build/issues/3390))
  ([32da36a](https://www.github.com/netlify/build/commit/32da36ad02c8e33ffcfb18a6c867be702fa858af))

## [17.8.0](https://www.github.com/netlify/build/compare/build-v17.7.1...build-v17.8.0) (2021-08-03)

### Features

- improve config simplification ([#3384](https://www.github.com/netlify/build/issues/3384))
  ([b9f7d7a](https://www.github.com/netlify/build/commit/b9f7d7ad1baf063bd3919a16b961007cb94da2e2))

### [17.7.1](https://www.github.com/netlify/build/compare/build-v17.7.0...build-v17.7.1) (2021-08-03)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^3.2.0
  ([#3381](https://www.github.com/netlify/build/issues/3381))
  ([b02dc7f](https://www.github.com/netlify/build/commit/b02dc7fd3fec933be3ca204508a4906a78e22b94))

## [17.7.0](https://www.github.com/netlify/build/compare/build-v17.6.0...build-v17.7.0) (2021-08-03)

### Features

- enable functions bundling manifest ([#3378](https://www.github.com/netlify/build/issues/3378))
  ([c03c4ac](https://www.github.com/netlify/build/commit/c03c4ac64f79020d732488014f4cb337cb6363a7))

## [17.6.0](https://www.github.com/netlify/build/compare/build-v17.5.0...build-v17.6.0) (2021-08-03)

### Features

- **build:** return config mutations ([#3379](https://www.github.com/netlify/build/issues/3379))
  ([8eb39b5](https://www.github.com/netlify/build/commit/8eb39b5ee3fae124498f87046a7776ad5574e011))

## [17.5.0](https://www.github.com/netlify/build/compare/build-v17.4.4...build-v17.5.0) (2021-08-02)

### Features

- re-add support for feature-flagging plugin versions ([#3373](https://www.github.com/netlify/build/issues/3373))
  ([85b739c](https://www.github.com/netlify/build/commit/85b739c0b48d36c76429f02ddcc32e5c3c51e28d))

### [17.4.4](https://www.github.com/netlify/build/compare/build-v17.4.3...build-v17.4.4) (2021-08-02)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.16.0
  ([#3375](https://www.github.com/netlify/build/issues/3375))
  ([4d1c90d](https://www.github.com/netlify/build/commit/4d1c90d5218c8d60373a50043ac6cfa6bda1aa9e))

### [17.4.3](https://www.github.com/netlify/build/compare/build-v17.4.2...build-v17.4.3) (2021-08-02)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to v3 ([#3372](https://www.github.com/netlify/build/issues/3372))
  ([c911b2d](https://www.github.com/netlify/build/commit/c911b2d3c02dddaf38183cc9499a0b0d976723da))

### [17.4.2](https://www.github.com/netlify/build/compare/build-v17.4.1...build-v17.4.2) (2021-08-02)

### Bug Fixes

- **deps:** update dependency chalk to ^4.1.1 ([#3367](https://www.github.com/netlify/build/issues/3367))
  ([dd258ec](https://www.github.com/netlify/build/commit/dd258ecd758824e56b15fc5f6c73a3180ac0af66))

### [17.4.1](https://www.github.com/netlify/build/compare/build-v17.4.0...build-v17.4.1) (2021-07-30)

### Bug Fixes

- `deployDir` parameter sent to buildbot during deploys ([#3363](https://www.github.com/netlify/build/issues/3363))
  ([5c39e70](https://www.github.com/netlify/build/commit/5c39e70c3a5b8ceecad448593b1095c093b093ff))

## [17.4.0](https://www.github.com/netlify/build/compare/build-v17.3.1...build-v17.4.0) (2021-07-30)

### Features

- allow adding new properties to `compatibility` ([#3361](https://www.github.com/netlify/build/issues/3361))
  ([24d1541](https://www.github.com/netlify/build/commit/24d15419e64b5d7b291b154fd9363660e468416d))

### [17.3.1](https://www.github.com/netlify/build/compare/build-v17.3.0...build-v17.3.1) (2021-07-29)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.21.0
  ([#3359](https://www.github.com/netlify/build/issues/3359))
  ([2b34de5](https://www.github.com/netlify/build/commit/2b34de56e7561c915c840c9070ad0fe6edbcfe2c))
- update `plugins.json` version ([#3358](https://www.github.com/netlify/build/issues/3358))
  ([511da72](https://www.github.com/netlify/build/commit/511da7264f0369aebec0e5cc975164d04c736a83))

## [17.3.0](https://www.github.com/netlify/build/compare/build-v17.2.0...build-v17.3.0) (2021-07-29)

### Features

- add versioning to `plugins.json` ([#3355](https://www.github.com/netlify/build/issues/3355))
  ([034ac01](https://www.github.com/netlify/build/commit/034ac0106327c2aeccc6b3358e1d3e0b25c48af5))

## [17.2.0](https://www.github.com/netlify/build/compare/build-v17.1.1...build-v17.2.0) (2021-07-28)

### Features

- add `NETLIFY_LOCAL` environment variable ([#3351](https://www.github.com/netlify/build/issues/3351))
  ([c3c0716](https://www.github.com/netlify/build/commit/c3c07169ba922010d7233de868a52b6ccd6bcd20))

### [17.1.1](https://www.github.com/netlify/build/compare/build-v17.1.0...build-v17.1.1) (2021-07-27)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.15.1
  ([#3344](https://www.github.com/netlify/build/issues/3344))
  ([9d9d52f](https://www.github.com/netlify/build/commit/9d9d52f8974a8af298dce47b089bb3c2ba3374ac))

## [17.1.0](https://www.github.com/netlify/build/compare/build-v17.0.1...build-v17.1.0) (2021-07-27)

### Features

- **telemetry:** report the framework provided ([#3328](https://www.github.com/netlify/build/issues/3328))
  ([bc64b5c](https://www.github.com/netlify/build/commit/bc64b5c163ef8a4b303fa6e44491cc250a6092c8))

### [17.0.1](https://www.github.com/netlify/build/compare/build-v17.0.0...build-v17.0.1) (2021-07-27)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.15.0
  ([#3340](https://www.github.com/netlify/build/issues/3340))
  ([3bd2099](https://www.github.com/netlify/build/commit/3bd2099526ba17c351af27d91241d37667caae6b))

## [17.0.0](https://www.github.com/netlify/build/compare/build-v16.2.1...build-v17.0.0) (2021-07-26)

### ⚠ BREAKING CHANGES

- deprecate Node 8 (#3322)

### Features

- **deps:** bump @netlify/\*-utils and @netlify/config to latest
  ([d57c7c3](https://www.github.com/netlify/build/commit/d57c7c3cadb79b96f6e96052fbd261b2a1e77f41))

### Miscellaneous Chores

- deprecate Node 8 ([#3322](https://www.github.com/netlify/build/issues/3322))
  ([9cc108a](https://www.github.com/netlify/build/commit/9cc108aab825558204ffef6b8034f456d8d11879))

### [16.2.1](https://www.github.com/netlify/build/compare/build-v16.2.0...build-v16.2.1) (2021-07-23)

### Bug Fixes

- allow functions directory to be a symlink ([#3326](https://www.github.com/netlify/build/issues/3326))
  ([1b98e50](https://www.github.com/netlify/build/commit/1b98e50c8bedc1a15855ab5ede42b8f5305ef263))

## [16.2.0](https://www.github.com/netlify/build/compare/build-v16.1.1...build-v16.2.0) (2021-07-22)

### Features

- add support for feature-flagging plugin versions ([#3304](https://www.github.com/netlify/build/issues/3304))
  ([157c03c](https://www.github.com/netlify/build/commit/157c03c70ab33ffd4ecc659b3437a113009729dd))
- **plugins:** remove feature flag responsible plugin node version execution changes
  ([#3311](https://www.github.com/netlify/build/issues/3311))
  ([8c94faf](https://www.github.com/netlify/build/commit/8c94faf8d1e7cbf830b1cbc722949198759f9f8c))

### Bug Fixes

- revert "feat: add support for feature-flagging plugin versions
  ([#3304](https://www.github.com/netlify/build/issues/3304))"
  ([#3318](https://www.github.com/netlify/build/issues/3318))
  ([226ff8e](https://www.github.com/netlify/build/commit/226ff8ead52642961bdba8c0f445879e67b2bbaf))

### [16.1.1](https://www.github.com/netlify/build/compare/build-v16.1.0...build-v16.1.1) (2021-07-22)

### Bug Fixes

- bundle functions from internal directory if configured user dire…
  ([#3314](https://www.github.com/netlify/build/issues/3314))
  ([b58afc3](https://www.github.com/netlify/build/commit/b58afc31fdfe4c412605e11b2f9261d2ed412c93))

## [16.1.0](https://www.github.com/netlify/build/compare/build-v16.0.1...build-v16.1.0) (2021-07-21)

### Features

- bundle functions from `.netlify/functions-internal` ([#3213](https://www.github.com/netlify/build/issues/3213))
  ([9ff3b9c](https://www.github.com/netlify/build/commit/9ff3b9cec1008a117bc687ba5a55d0fb8aecd91a))

### [16.0.1](https://www.github.com/netlify/build/compare/build-v16.0.0...build-v16.0.1) (2021-07-20)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.22
  ([#3306](https://www.github.com/netlify/build/issues/3306))
  ([a21dc85](https://www.github.com/netlify/build/commit/a21dc85cc3575572dfbe151d518336f88a6f7be9))

## [16.0.0](https://www.github.com/netlify/build/compare/build-v15.11.5...build-v16.0.0) (2021-07-19)

### ⚠ BREAKING CHANGES

- change edge-handler default directory (#3296)

### Features

- change edge-handler default directory ([#3296](https://www.github.com/netlify/build/issues/3296))
  ([86b02da](https://www.github.com/netlify/build/commit/86b02dae85bbd879f107606487853ad3cd2fc147))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.19.3
  ([#3297](https://www.github.com/netlify/build/issues/3297))
  ([1a9d614](https://www.github.com/netlify/build/commit/1a9d614dae066568017c882719379ceccf8118eb))

### [15.11.5](https://www.github.com/netlify/build/compare/build-v15.11.4...build-v15.11.5) (2021-07-15)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.14.0
  ([#3293](https://www.github.com/netlify/build/issues/3293))
  ([a371a0d](https://www.github.com/netlify/build/commit/a371a0dbdb3a7c8a05674ab9d6255635cd63d727))

### [15.11.4](https://www.github.com/netlify/build/compare/build-v15.11.3...build-v15.11.4) (2021-07-14)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.13.1
  ([#3288](https://www.github.com/netlify/build/issues/3288))
  ([f5e5b6b](https://www.github.com/netlify/build/commit/f5e5b6ba91a8ad9e95d4dea5c18078a8e334313a))

### [15.11.3](https://www.github.com/netlify/build/compare/build-v15.11.2...build-v15.11.3) (2021-07-14)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.19.2
  ([#3286](https://www.github.com/netlify/build/issues/3286))
  ([23b323d](https://www.github.com/netlify/build/commit/23b323db25e444307c382e20b807f17fb4126d8d))

### [15.11.2](https://www.github.com/netlify/build/compare/build-v15.11.1...build-v15.11.2) (2021-07-12)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.13.0
  ([#3280](https://www.github.com/netlify/build/issues/3280))
  ([8249fe1](https://www.github.com/netlify/build/commit/8249fe19d1edab64fad2362757d59d33fabe18c2))

### [15.11.1](https://www.github.com/netlify/build/compare/build-v15.11.0...build-v15.11.1) (2021-07-12)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.21
  ([#3278](https://www.github.com/netlify/build/issues/3278))
  ([556706f](https://www.github.com/netlify/build/commit/556706f67688ad804e7a0694df549e7f46255c6f))

## [15.11.0](https://www.github.com/netlify/build/compare/build-v15.10.0...build-v15.11.0) (2021-07-08)

### Features

- delete `netlify.toml` after deploy if it was created due to configuration changes
  ([#3271](https://www.github.com/netlify/build/issues/3271))
  ([444087d](https://www.github.com/netlify/build/commit/444087d528a0e8450031eda65cd5877980a5fa70))

## [15.10.0](https://www.github.com/netlify/build/compare/build-v15.9.0...build-v15.10.0) (2021-07-08)

### Features

- simplify the `netlify.toml` being saved on configuration changes
  ([#3268](https://www.github.com/netlify/build/issues/3268))
  ([15987fe](https://www.github.com/netlify/build/commit/15987fe0d869f01110d4d97c8e8395580eb1a9f7))

## [15.9.0](https://www.github.com/netlify/build/compare/build-v15.8.0...build-v15.9.0) (2021-07-08)

### Features

- restore `netlify.toml` and `_redirects` after deploy ([#3265](https://www.github.com/netlify/build/issues/3265))
  ([2441d6a](https://www.github.com/netlify/build/commit/2441d6a8b2be81212384816a0686221d4a6a2577))

## [15.8.0](https://www.github.com/netlify/build/compare/build-v15.7.0...build-v15.8.0) (2021-07-08)

### Features

- add debug logs to deploys ([#3262](https://www.github.com/netlify/build/issues/3262))
  ([5748f92](https://www.github.com/netlify/build/commit/5748f92fa82efd0a892f45a015f39a03dbf41159))

## [15.7.0](https://www.github.com/netlify/build/compare/build-v15.6.0...build-v15.7.0) (2021-07-08)

### Features

- fix `_redirects` to `netlify.toml` before deploy ([#3259](https://www.github.com/netlify/build/issues/3259))
  ([e32d076](https://www.github.com/netlify/build/commit/e32d076ab642b8a0df72c96d8726e161b65b182f))

## [15.6.0](https://www.github.com/netlify/build/compare/build-v15.5.0...build-v15.6.0) (2021-07-08)

### Features

- use a diff instead of a Proxy for configuration mutations ([#3254](https://www.github.com/netlify/build/issues/3254))
  ([ae7f36e](https://www.github.com/netlify/build/commit/ae7f36e03fe84a512007694654cbfeb3b12c2cf3))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.19.1
  ([#3255](https://www.github.com/netlify/build/issues/3255))
  ([a1db0b0](https://www.github.com/netlify/build/commit/a1db0b035bfe50d2852746ed34214641a02d94f1))

## [15.5.0](https://www.github.com/netlify/build/compare/build-v15.4.0...build-v15.5.0) (2021-07-08)

### Features

- move configMutations validation logic ([#3252](https://www.github.com/netlify/build/issues/3252))
  ([db11947](https://www.github.com/netlify/build/commit/db119472d6f8105409ac8b560bd51a140b84226d))

## [15.4.0](https://www.github.com/netlify/build/compare/build-v15.3.1...build-v15.4.0) (2021-07-08)

### Features

- do not validate against `preventExtensions()` nor `setPrototypeOf()`
  ([#3250](https://www.github.com/netlify/build/issues/3250))
  ([6fed537](https://www.github.com/netlify/build/commit/6fed537e071617f7f6acbe84b8fb98d39f7e2677))
- move configMutations logging logic ([#3249](https://www.github.com/netlify/build/issues/3249))
  ([8764874](https://www.github.com/netlify/build/commit/8764874f09b82a336700366b0fca6407a1dacb8c))

### [15.3.1](https://www.github.com/netlify/build/compare/build-v15.3.0...build-v15.3.1) (2021-07-08)

### Bug Fixes

- allow `netlifyConfig.redirects` to be modified before `_redirects` is added
  ([#3242](https://www.github.com/netlify/build/issues/3242))
  ([f3330a6](https://www.github.com/netlify/build/commit/f3330a685aeb0320e1ac445bbe7a908e7a83dbda))

## [15.3.0](https://www.github.com/netlify/build/compare/build-v15.2.2...build-v15.3.0) (2021-07-08)

### Features

- add default values for `build.processing` and `build.services`
  ([#3235](https://www.github.com/netlify/build/issues/3235))
  ([2ba263b](https://www.github.com/netlify/build/commit/2ba263ba9ebc54c38410245f021deb906b8a8aa2))

### [15.2.2](https://www.github.com/netlify/build/compare/build-v15.2.1...build-v15.2.2) (2021-07-07)

### Bug Fixes

- save the `netlify.toml` earlier ([#3233](https://www.github.com/netlify/build/issues/3233))
  ([d4bfb25](https://www.github.com/netlify/build/commit/d4bfb25e362ebf3aea0ba2830d79cfc178b355a9))

### [15.2.1](https://www.github.com/netlify/build/compare/build-v15.2.0...build-v15.2.1) (2021-07-07)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.12.0
  ([#3228](https://www.github.com/netlify/build/issues/3228))
  ([3c8a3c6](https://www.github.com/netlify/build/commit/3c8a3c6a4a0e3a29f984739613b6f823b1d7f38c))

## [15.2.0](https://www.github.com/netlify/build/compare/build-v15.1.0...build-v15.2.0) (2021-07-07)

### Features

- persist configuration changes to `netlify.toml` ([#3224](https://www.github.com/netlify/build/issues/3224))
  ([f924661](https://www.github.com/netlify/build/commit/f924661f94d04af1e90e1023e385e35587ae301c))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.19.0
  ([#3227](https://www.github.com/netlify/build/issues/3227))
  ([571bcb4](https://www.github.com/netlify/build/commit/571bcb4821faece491c9f1b7392a364317e3d571))

## [15.1.0](https://www.github.com/netlify/build/compare/build-v15.0.0...build-v15.1.0) (2021-07-06)

### Features

- fix the payload sent during deploy to the buildbot ([#3218](https://www.github.com/netlify/build/issues/3218))
  ([55d5fc4](https://www.github.com/netlify/build/commit/55d5fc4a71d7d7055a679371ff588d9e6c2ea200))

## [15.0.0](https://www.github.com/netlify/build/compare/build-v14.0.0...build-v15.0.0) (2021-07-06)

### ⚠ BREAKING CHANGES

- return `redirectsPath` from `@netlify/config` (#3207)

### Features

- return `redirectsPath` from `@netlify/config` ([#3207](https://www.github.com/netlify/build/issues/3207))
  ([35dd205](https://www.github.com/netlify/build/commit/35dd205ca35a393dbb3cff50e79ba1cdad8f8755))

## [14.0.0](https://www.github.com/netlify/build/compare/build-v13.3.1...build-v14.0.0) (2021-07-06)

### ⚠ BREAKING CHANGES

- add `configMutations` flag to `@netlify/config` (#3211)

### Features

- add `configMutations` flag to `@netlify/config` ([#3211](https://www.github.com/netlify/build/issues/3211))
  ([9037f03](https://www.github.com/netlify/build/commit/9037f03b6d288d136007f0c2c964c04aed3f33f7))

### [13.3.1](https://www.github.com/netlify/build/compare/build-v13.3.0...build-v13.3.1) (2021-07-06)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.11.0
  ([#3202](https://www.github.com/netlify/build/issues/3202))
  ([37df6bd](https://www.github.com/netlify/build/commit/37df6bd5ce55e3176f336285e3b17b9982d8f2f2))

## [13.3.0](https://www.github.com/netlify/build/compare/build-v13.2.0...build-v13.3.0) (2021-07-05)

### Features

- move some mutation logic to `@netlify/config` ([#3203](https://www.github.com/netlify/build/issues/3203))
  ([9ce4725](https://www.github.com/netlify/build/commit/9ce47250e806379db93528913c298bc57f3d23a6))

## [13.2.0](https://www.github.com/netlify/build/compare/build-v13.1.0...build-v13.2.0) (2021-07-05)

### Features

- allow mutating `edge_handlers` in plugins ([#3200](https://www.github.com/netlify/build/issues/3200))
  ([896b795](https://www.github.com/netlify/build/commit/896b795e4f97186c35d76f60cbd012bf76d1d31e))

## [13.1.0](https://www.github.com/netlify/build/compare/build-v13.0.0...build-v13.1.0) (2021-07-05)

### Features

- improve `functions` configuration logic ([#3175](https://www.github.com/netlify/build/issues/3175))
  ([7085d77](https://www.github.com/netlify/build/commit/7085d7720191c399d8fd9d560ce30a76b483e30a))

## [13.0.0](https://www.github.com/netlify/build/compare/build-v12.28.0...build-v13.0.0) (2021-07-05)

### ⚠ BREAKING CHANGES

- merge `priorityConfig` with `inlineConfig` (#3193)

### Features

- merge `priorityConfig` with `inlineConfig` ([#3193](https://www.github.com/netlify/build/issues/3193))
  ([35989ef](https://www.github.com/netlify/build/commit/35989ef8fe8196c1da2d36c2f73e4ff82efba6c5))

## [12.28.0](https://www.github.com/netlify/build/compare/build-v12.27.0...build-v12.28.0) (2021-07-05)

### Features

- change `origin` of `inlineConfig` and `priorityConfig` ([#3190](https://www.github.com/netlify/build/issues/3190))
  ([5ea2439](https://www.github.com/netlify/build/commit/5ea2439ae8f7de11ba15059820466456ee8df196))

## [12.27.0](https://www.github.com/netlify/build/compare/build-v12.26.1...build-v12.27.0) (2021-07-05)

### Features

- change how `priorityConfig` interacts with contexts ([#3187](https://www.github.com/netlify/build/issues/3187))
  ([736c269](https://www.github.com/netlify/build/commit/736c26993385173e37110b8e26c2cf389344de3e))

### [12.26.1](https://www.github.com/netlify/build/compare/build-v12.26.0...build-v12.26.1) (2021-07-05)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.20
  ([#3182](https://www.github.com/netlify/build/issues/3182))
  ([0c19650](https://www.github.com/netlify/build/commit/0c19650bd88be78ba291dd19d9e800dbf08db1aa))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.9.0
  ([#3181](https://www.github.com/netlify/build/issues/3181))
  ([1d733f6](https://www.github.com/netlify/build/commit/1d733f69f30db1e06722c1e0b7cd167e1e8ddad9))

## [12.26.0](https://www.github.com/netlify/build/compare/build-v12.25.0...build-v12.26.0) (2021-07-01)

### Features

- detect when build command adds `_redirects` file ([#3171](https://www.github.com/netlify/build/issues/3171))
  ([ddf93d5](https://www.github.com/netlify/build/commit/ddf93d5dea00f5f86320be8eb353b75853ba1409))

## [12.25.0](https://www.github.com/netlify/build/compare/build-v12.24.0...build-v12.25.0) (2021-07-01)

### Features

- allow mutating more configuration properties ([#3163](https://www.github.com/netlify/build/issues/3163))
  ([7357fa8](https://www.github.com/netlify/build/commit/7357fa89cd2824e03ae3c1fe654537f4218d4f52))

## [12.24.0](https://www.github.com/netlify/build/compare/build-v12.23.0...build-v12.24.0) (2021-07-01)

### Features

- detect when `_redirects` are created during builds ([#3168](https://www.github.com/netlify/build/issues/3168))
  ([82746f4](https://www.github.com/netlify/build/commit/82746f48c21817c41228d782db6266226cb02ba2))

## [12.23.0](https://www.github.com/netlify/build/compare/build-v12.22.0...build-v12.23.0) (2021-07-01)

### Features

- reduce verbose logs when changing `netlifyConfig` ([#3167](https://www.github.com/netlify/build/issues/3167))
  ([6f3413d](https://www.github.com/netlify/build/commit/6f3413ded8c06da9a81425ee5de0f3208983d64a))

## [12.22.0](https://www.github.com/netlify/build/compare/build-v12.21.0...build-v12.22.0) (2021-07-01)

### Features

- log updated config when changed, in debug mode ([#3162](https://www.github.com/netlify/build/issues/3162))
  ([83c53f8](https://www.github.com/netlify/build/commit/83c53f89d9da42e029f5f23c3b62c3e55a60c5e5))

## [12.21.0](https://www.github.com/netlify/build/compare/build-v12.20.0...build-v12.21.0) (2021-07-01)

### Features

- allow array configuration property to be modified ([#3161](https://www.github.com/netlify/build/issues/3161))
  ([f4f2982](https://www.github.com/netlify/build/commit/f4f298207d27ca00c785fc0e4b4837258c1db8ff))

## [12.20.0](https://www.github.com/netlify/build/compare/build-v12.19.1...build-v12.20.0) (2021-06-30)

### Features

- allow plugins to unset configuration properties ([#3158](https://www.github.com/netlify/build/issues/3158))
  ([64e1235](https://www.github.com/netlify/build/commit/64e1235079356f5936638cde812a17027e627b9f))

### [12.19.1](https://www.github.com/netlify/build/compare/build-v12.19.0...build-v12.19.1) (2021-06-30)

### Bug Fixes

- **plugins:** only rely in the system node version for plugins running Node <10
  ([#3144](https://www.github.com/netlify/build/issues/3144))
  ([74bbff2](https://www.github.com/netlify/build/commit/74bbff231ec49277a1900b1ac19c2390094a1d0f))

## [12.19.0](https://www.github.com/netlify/build/compare/build-v12.18.0...build-v12.19.0) (2021-06-30)

### Features

- remove redirects parsing feature flag ([#3150](https://www.github.com/netlify/build/issues/3150))
  ([1f297c9](https://www.github.com/netlify/build/commit/1f297c9845bc3a1f3ba4725c9f97aadf0d541e45))

## [12.18.0](https://www.github.com/netlify/build/compare/build-v12.17.0...build-v12.18.0) (2021-06-30)

### Features

- validate and normalize config properties modified by plugins
  ([#3153](https://www.github.com/netlify/build/issues/3153))
  ([daf5c91](https://www.github.com/netlify/build/commit/daf5c91c080e41c7c5371f6fd6ca2ffa2c965f6f))

## [12.17.0](https://www.github.com/netlify/build/compare/build-v12.16.0...build-v12.17.0) (2021-06-29)

### Features

- call `@netlify/config` when the configuration is modified ([#3147](https://www.github.com/netlify/build/issues/3147))
  ([afc73a4](https://www.github.com/netlify/build/commit/afc73a4afa2f6b765bfb6043358c5e9af27314f7))

## [12.16.0](https://www.github.com/netlify/build/compare/build-v12.15.0...build-v12.16.0) (2021-06-29)

### Features

- remove zisiHandlerV2 feature flag ([#3145](https://www.github.com/netlify/build/issues/3145))
  ([239fb4b](https://www.github.com/netlify/build/commit/239fb4b7ed41636f7c3814a5f61a7676d4242256))

## [12.15.0](https://www.github.com/netlify/build/compare/build-v12.14.0...build-v12.15.0) (2021-06-29)

### Features

- add `priorityConfig` to `@netlify/build` ([#3143](https://www.github.com/netlify/build/issues/3143))
  ([61a5fca](https://www.github.com/netlify/build/commit/61a5fcadb2c15e62accf9e1c97e40f8e3a73170f))

## [12.14.0](https://www.github.com/netlify/build/compare/build-v12.13.1...build-v12.14.0) (2021-06-29)

### Features

- apply `netlifyConfig` modifications in the parent process ([#3135](https://www.github.com/netlify/build/issues/3135))
  ([44f107f](https://www.github.com/netlify/build/commit/44f107fbc34653b97359681f1a8d763d29b81ce2))

### [12.13.1](https://www.github.com/netlify/build/compare/build-v12.13.0...build-v12.13.1) (2021-06-29)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.8.0
  ([#3137](https://www.github.com/netlify/build/issues/3137))
  ([872db54](https://www.github.com/netlify/build/commit/872db544c2d1b798e8a93024c2c8b7fb87bf3f04))

## [12.13.0](https://www.github.com/netlify/build/compare/build-v12.12.0...build-v12.13.0) (2021-06-28)

### Features

- split mutations logic ([#3132](https://www.github.com/netlify/build/issues/3132))
  ([6da5a40](https://www.github.com/netlify/build/commit/6da5a405b9d92e95edd67150f9adaf24dd06d749))

## [12.12.0](https://www.github.com/netlify/build/compare/build-v12.11.0...build-v12.12.0) (2021-06-28)

### Features

- update dependency @netlify/zip-it-and-ship-it to v4.7.0 ([#3123](https://www.github.com/netlify/build/issues/3123))
  ([c70b708](https://www.github.com/netlify/build/commit/c70b70881f836693dff6994287f23bcfe3d25bb9))

## [12.11.0](https://www.github.com/netlify/build/compare/build-v12.10.0...build-v12.11.0) (2021-06-28)

### Features

- simplify proxy logic ([#3117](https://www.github.com/netlify/build/issues/3117))
  ([f833a21](https://www.github.com/netlify/build/commit/f833a219eafb174786695e59691215215a3e6db6))

## [12.10.0](https://www.github.com/netlify/build/compare/build-v12.9.0...build-v12.10.0) (2021-06-24)

### Features

- move `netlifyConfig` mutations validation logic ([#3113](https://www.github.com/netlify/build/issues/3113))
  ([a962fd0](https://www.github.com/netlify/build/commit/a962fd0c0a97c56199dd00d117c44f787fdbed03))

## [12.9.0](https://www.github.com/netlify/build/compare/build-v12.8.3...build-v12.9.0) (2021-06-24)

### Features

- move proxy handler logic ([#3101](https://www.github.com/netlify/build/issues/3101))
  ([6773d58](https://www.github.com/netlify/build/commit/6773d58b9eece26a0b56811ea92b0a6bc59847ba))

### [12.8.3](https://www.github.com/netlify/build/compare/build-v12.8.2...build-v12.8.3) (2021-06-24)

### Bug Fixes

- dependencies ([67cae98](https://www.github.com/netlify/build/commit/67cae981597b0b2dea6ab2a1856a134705adee89))

### [12.8.2](https://www.github.com/netlify/build/compare/build-v12.8.1...build-v12.8.2) (2021-06-24)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v4.6.0
  ([#3105](https://www.github.com/netlify/build/issues/3105))
  ([b2c53c7](https://www.github.com/netlify/build/commit/b2c53c789faa5c29295bb2f0209020cd0d9af7b6))

### [12.8.1](https://www.github.com/netlify/build/compare/build-v12.8.0...build-v12.8.1) (2021-06-24)

### Bug Fixes

- **plugins:** feature flag plugin execution with the system node version
  ([#3081](https://www.github.com/netlify/build/issues/3081))
  ([d1d5b58](https://www.github.com/netlify/build/commit/d1d5b58925fbe156591de0cf7123276fb910332d))

## [12.8.0](https://www.github.com/netlify/build/compare/build-v12.7.2...build-v12.8.0) (2021-06-23)

### Features

- add `configMutations` internal variable ([#3093](https://www.github.com/netlify/build/issues/3093))
  ([629d32e](https://www.github.com/netlify/build/commit/629d32e3c5205ce555de579bbe349e56355a48d4))

### [12.7.2](https://www.github.com/netlify/build/compare/build-v12.7.1...build-v12.7.2) (2021-06-23)

### Bug Fixes

- pin zip-it-and-ship-it to version 4.4.2 ([#3095](https://www.github.com/netlify/build/issues/3095))
  ([86a00ce](https://www.github.com/netlify/build/commit/86a00ce3d5ee0bb5e9158ce81531459215ac0015))

### [12.7.1](https://www.github.com/netlify/build/compare/build-v12.7.0...build-v12.7.1) (2021-06-22)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.5.1
  ([#3088](https://www.github.com/netlify/build/issues/3088))
  ([192d1ff](https://www.github.com/netlify/build/commit/192d1ff219ab5e091e6023d4f14933b1e7cc5230))

## [12.7.0](https://www.github.com/netlify/build/compare/build-v12.6.0...build-v12.7.0) (2021-06-22)

### Features

- do not allow deleting configuration properties ([#3067](https://www.github.com/netlify/build/issues/3067))
  ([aea876a](https://www.github.com/netlify/build/commit/aea876a63bfaf483a9b74018fb68a2604b760354))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.17.0
  ([#3085](https://www.github.com/netlify/build/issues/3085))
  ([104aebf](https://www.github.com/netlify/build/commit/104aebf0595d1c75e860714bbc9b6b82bd7ace7a))

## [12.6.0](https://www.github.com/netlify/build/compare/build-v12.5.2...build-v12.6.0) (2021-06-22)

### Features

- add `build.publishOrigin` to `@netlify/config` ([#3078](https://www.github.com/netlify/build/issues/3078))
  ([b5badfd](https://www.github.com/netlify/build/commit/b5badfdda2c7bada76d21583f6f57465b12b16cb))

### [12.5.2](https://www.github.com/netlify/build/compare/build-v12.5.1...build-v12.5.2) (2021-06-22)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.4.2
  ([#3070](https://www.github.com/netlify/build/issues/3070))
  ([673f684](https://www.github.com/netlify/build/commit/673f68442849774c62969049e3f0bd7e22ed40b0))

### [12.5.1](https://www.github.com/netlify/build/compare/build-v12.5.0...build-v12.5.1) (2021-06-22)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.19
  ([#3073](https://www.github.com/netlify/build/issues/3073))
  ([e5f68ab](https://www.github.com/netlify/build/commit/e5f68abbc2b3121c8866e32105ee66fb6d60d136))

## [12.5.0](https://www.github.com/netlify/build/compare/build-v12.4.1...build-v12.5.0) (2021-06-22)

### Features

- improve verbose logging ([#3066](https://www.github.com/netlify/build/issues/3066))
  ([6cb567b](https://www.github.com/netlify/build/commit/6cb567b9c4ca3a5abd9cc967df1d5812b0989602))

### [12.4.1](https://www.github.com/netlify/build/compare/build-v12.4.0...build-v12.4.1) (2021-06-17)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.16.0
  ([#3064](https://www.github.com/netlify/build/issues/3064))
  ([a01bea3](https://www.github.com/netlify/build/commit/a01bea386b5a2a4f60a2d1c36ed6ebb778c7ff50))

## [12.4.0](https://www.github.com/netlify/build/compare/build-v12.3.0...build-v12.4.0) (2021-06-17)

### Features

- pass `publish` directory to the buildbot during deploys ([#3056](https://www.github.com/netlify/build/issues/3056))
  ([7d57080](https://www.github.com/netlify/build/commit/7d570801dc9fd469638b938e62c76433b861ff55))

## [12.3.0](https://www.github.com/netlify/build/compare/build-v12.2.2...build-v12.3.0) (2021-06-17)

### Features

- return `accounts` and `addons` from `@netlify/config` ([#3057](https://www.github.com/netlify/build/issues/3057))
  ([661f79c](https://www.github.com/netlify/build/commit/661f79cf9ca6eaee03f25a24a6569bc6cc9302a3))

### [12.2.2](https://www.github.com/netlify/build/compare/build-v12.2.1...build-v12.2.2) (2021-06-17)

### Bug Fixes

- log `--cachedConfigPath` in verbose mode ([#3046](https://www.github.com/netlify/build/issues/3046))
  ([dc4028f](https://www.github.com/netlify/build/commit/dc4028f1ea84435f62c461be3367015f8be75817))

### [12.2.1](https://www.github.com/netlify/build/compare/build-v12.2.0...build-v12.2.1) (2021-06-17)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.18
  ([#3044](https://www.github.com/netlify/build/issues/3044))
  ([68828d6](https://www.github.com/netlify/build/commit/68828d688a25959ae37966510ae0d43c0d532e7a))
- remove `netlify_config_default_publish` feature flag ([#3047](https://www.github.com/netlify/build/issues/3047))
  ([0e2c137](https://www.github.com/netlify/build/commit/0e2c137fffae8ad3d4d8243ade3e5f46c0e96e21))

## [12.2.0](https://www.github.com/netlify/build/compare/build-v12.1.7...build-v12.2.0) (2021-06-15)

### Features

- add `--cachedConfigPath` CLI flag ([#3037](https://www.github.com/netlify/build/issues/3037))
  ([e317a36](https://www.github.com/netlify/build/commit/e317a36b7c7028fcab6bb0fb0d026e0da522b692))

### [12.1.7](https://www.github.com/netlify/build/compare/build-v12.1.6...build-v12.1.7) (2021-06-15)

### Bug Fixes

- do not print warning messages for plugins from the directory
  ([#3038](https://www.github.com/netlify/build/issues/3038))
  ([12c36b2](https://www.github.com/netlify/build/commit/12c36b24cba72dbc6421c231599c073d5e04b3c7))

### [12.1.6](https://www.github.com/netlify/build/compare/build-v12.1.5...build-v12.1.6) (2021-06-15)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.4.1
  ([#3034](https://www.github.com/netlify/build/issues/3034))
  ([034f13a](https://www.github.com/netlify/build/commit/034f13a59a7ba73b3b0c9b46752b67d971e1a8ac))

### [12.1.5](https://www.github.com/netlify/build/compare/build-v12.1.4...build-v12.1.5) (2021-06-15)

### Bug Fixes

- **plugins:** add warning message for local/package.json plugins relying on old node versions
  ([#2952](https://www.github.com/netlify/build/issues/2952))
  ([5e9b101](https://www.github.com/netlify/build/commit/5e9b101629b5f7f261f985495c7ca17d3c17d8c1))

### [12.1.4](https://www.github.com/netlify/build/compare/build-v12.1.3...build-v12.1.4) (2021-06-15)

### Bug Fixes

- **metrics:** remove timing metrics report ([#3022](https://www.github.com/netlify/build/issues/3022))
  ([12424ff](https://www.github.com/netlify/build/commit/12424fffab992497d718549ac2a19129e8281073))

### [12.1.3](https://www.github.com/netlify/build/compare/build-v12.1.2...build-v12.1.3) (2021-06-15)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v4.4.0
  ([#3011](https://www.github.com/netlify/build/issues/3011))
  ([f49b8c3](https://www.github.com/netlify/build/commit/f49b8c3024f070187a66b3f713b1cb3a5154ab0f))

### [12.1.2](https://www.github.com/netlify/build/compare/build-v12.1.1...build-v12.1.2) (2021-06-14)

### Bug Fixes

- **feature_flags:** remove distribution metrics feature flag
  ([#3015](https://www.github.com/netlify/build/issues/3015))
  ([36e11a2](https://www.github.com/netlify/build/commit/36e11a299a626d918a009f9d8038572bd12d19ad))

### [12.1.1](https://www.github.com/netlify/build/compare/build-v12.1.0...build-v12.1.1) (2021-06-14)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.17
  ([#3010](https://www.github.com/netlify/build/issues/3010))
  ([8e35944](https://www.github.com/netlify/build/commit/8e35944e4974e026c600dfbc46758985b9d9cb2e))
- **deps:** update dependency @netlify/plugins-list to ^2.15.1
  ([#3014](https://www.github.com/netlify/build/issues/3014))
  ([1b7bfa6](https://www.github.com/netlify/build/commit/1b7bfa61d1c7fe689268d1a10442609dc220fa44))
- revert `redirects` parsing ([#3016](https://www.github.com/netlify/build/issues/3016))
  ([39613cf](https://www.github.com/netlify/build/commit/39613cfd04281e51264ef61a75c3bd4880158a11))

## [12.1.0](https://www.github.com/netlify/build/compare/build-v12.0.1...build-v12.1.0) (2021-06-11)

### Features

- add `config.redirects` ([#3003](https://www.github.com/netlify/build/issues/3003))
  ([ec3c177](https://www.github.com/netlify/build/commit/ec3c177fcc6a90a99fb7a584d2402b004704bc7e))

### [12.0.1](https://www.github.com/netlify/build/compare/build-v12.0.0...build-v12.0.1) (2021-06-10)

### Bug Fixes

- allow using no feature flags ([#2991](https://www.github.com/netlify/build/issues/2991))
  ([f25ca43](https://www.github.com/netlify/build/commit/f25ca434df6bba362112d3a1c881c7391988ae58))

## [12.0.0](https://www.github.com/netlify/build/compare/build-v11.38.0...build-v12.0.0) (2021-06-10)

### ⚠ BREAKING CHANGES

- improve support for monorepo sites without a `publish` directory (#2988)

### Features

- improve support for monorepo sites without a `publish` directory
  ([#2988](https://www.github.com/netlify/build/issues/2988))
  ([1fcad8a](https://www.github.com/netlify/build/commit/1fcad8a81c35060fbc3ec8cb15ade9762579a166))

## [11.38.0](https://www.github.com/netlify/build/compare/build-v11.37.2...build-v11.38.0) (2021-06-10)

### Features

- improve feature flags logic ([#2960](https://www.github.com/netlify/build/issues/2960))
  ([6df6360](https://www.github.com/netlify/build/commit/6df63603ee3822229d1504e95f4622d47387ddfb))

### [11.37.2](https://www.github.com/netlify/build/compare/build-v11.37.1...build-v11.37.2) (2021-06-10)

### Bug Fixes

- pin ZISI to v4.2.7 ([#2983](https://www.github.com/netlify/build/issues/2983))
  ([29a8b19](https://www.github.com/netlify/build/commit/29a8b199b7d4db780b237a838e6495b4259bdfcc))

### [11.37.1](https://www.github.com/netlify/build/compare/build-v11.37.0...build-v11.37.1) (2021-06-10)

### Bug Fixes

- force release of Build ([#2981](https://www.github.com/netlify/build/issues/2981))
  ([a64994b](https://www.github.com/netlify/build/commit/a64994b5bc296056bf9bc51a1c21fcb157c86edd))

## [11.37.0](https://www.github.com/netlify/build/compare/build-v11.36.3...build-v11.37.0) (2021-06-09)

### Features

- only monitor the duration of Netlify maintained plugins ([#2967](https://www.github.com/netlify/build/issues/2967))
  ([1968e34](https://www.github.com/netlify/build/commit/1968e344512ea2ff231f18cb608f88ef37c58278))

### [11.36.3](https://www.github.com/netlify/build/compare/build-v11.36.2...build-v11.36.3) (2021-06-09)

### Bug Fixes

- do not record plugins duration if no plugins ([#2962](https://www.github.com/netlify/build/issues/2962))
  ([dee54bf](https://www.github.com/netlify/build/commit/dee54bf8c0bf28aa17b37144da282ca3f4f4b637))

### [11.36.2](https://www.github.com/netlify/build/compare/build-v11.36.1...build-v11.36.2) (2021-06-09)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.3.0
  ([#2959](https://www.github.com/netlify/build/issues/2959))
  ([a5f7b64](https://www.github.com/netlify/build/commit/a5f7b64c6d5a43ec330db989c3862679aa91ea0f))

### [11.36.1](https://www.github.com/netlify/build/compare/build-v11.36.0...build-v11.36.1) (2021-06-09)

### Bug Fixes

- improve error handling of plugins list fetch error ([#2957](https://www.github.com/netlify/build/issues/2957))
  ([414d405](https://www.github.com/netlify/build/commit/414d405845a8fd28e9cc46b706bec4f1662ebe61))

## [11.36.0](https://www.github.com/netlify/build/compare/build-v11.35.0...build-v11.36.0) (2021-06-08)

### Features

- allow mutating `functions.*` top-level properties ([#2944](https://www.github.com/netlify/build/issues/2944))
  ([0b4b58b](https://www.github.com/netlify/build/commit/0b4b58bbdd1e5a9aa82b185404920f3c353b54f5))

## [11.35.0](https://www.github.com/netlify/build/compare/build-v11.34.0...build-v11.35.0) (2021-06-08)

### Features

- log when `netlifyConfig` is mutated ([#2945](https://www.github.com/netlify/build/issues/2945))
  ([fd98db3](https://www.github.com/netlify/build/commit/fd98db331096e75ef3812d6e9a901a8841aafbc4))

## [11.34.0](https://www.github.com/netlify/build/compare/build-v11.33.0...build-v11.34.0) (2021-06-08)

### Features

- fix `functions.directory` mutation ([#2940](https://www.github.com/netlify/build/issues/2940))
  ([29f71be](https://www.github.com/netlify/build/commit/29f71beae04fed1b365504d3d7144618d222f720))
- handle symbols mutations on `netlifyConfig` ([#2941](https://www.github.com/netlify/build/issues/2941))
  ([58f9f8f](https://www.github.com/netlify/build/commit/58f9f8f3f2f7a69441049b95159362507f7bfc40))

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.16
  ([#2942](https://www.github.com/netlify/build/issues/2942))
  ([29728b5](https://www.github.com/netlify/build/commit/29728b58ab2d6334d6cc2a0722ff7bff2a701c90))

## [11.33.0](https://www.github.com/netlify/build/compare/build-v11.32.5...build-v11.33.0) (2021-06-07)

### Features

- **metrics:** report distribution metrics under a feature flag
  ([#2933](https://www.github.com/netlify/build/issues/2933))
  ([5a2e2f2](https://www.github.com/netlify/build/commit/5a2e2f2dc96112f32a31ae1dba3c46fd9f23de82))

### [11.32.5](https://www.github.com/netlify/build/compare/build-v11.32.4...build-v11.32.5) (2021-06-07)

### Bug Fixes

- correct usage of ZISI's basePath property ([#2927](https://www.github.com/netlify/build/issues/2927))
  ([c354944](https://www.github.com/netlify/build/commit/c3549448740f504308ffb50d2897054f29b83d65))

### [11.32.4](https://www.github.com/netlify/build/compare/build-v11.32.3...build-v11.32.4) (2021-06-07)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.15
  ([#2929](https://www.github.com/netlify/build/issues/2929))
  ([87df6cb](https://www.github.com/netlify/build/commit/87df6cb9c6855bf6506290a7099a84022d3a0e93))
- **deps:** update dependency @netlify/plugins-list to ^2.15.0
  ([#2931](https://www.github.com/netlify/build/issues/2931))
  ([efef14b](https://www.github.com/netlify/build/commit/efef14b09b907b08cd659de51f8e74e9c2b83b5f))
- **deps:** update dependency statsd-client to v0.4.7 ([#2920](https://www.github.com/netlify/build/issues/2920))
  ([a789aec](https://www.github.com/netlify/build/commit/a789aecaa20803e81822248d56312aa2b64c1419))

### [11.32.3](https://www.github.com/netlify/build/compare/build-v11.32.2...build-v11.32.3) (2021-06-06)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.14
  ([#2917](https://www.github.com/netlify/build/issues/2917))
  ([3985338](https://www.github.com/netlify/build/commit/3985338aab737255a68749a84b6c0570373be69a))

### [11.32.2](https://www.github.com/netlify/build/compare/build-v11.32.1...build-v11.32.2) (2021-06-04)

### Bug Fixes

- configuration mutation of object values ([#2915](https://www.github.com/netlify/build/issues/2915))
  ([5560199](https://www.github.com/netlify/build/commit/5560199e9b47e05b6ff514af127020fed9eecaa1))

### [11.32.1](https://www.github.com/netlify/build/compare/build-v11.32.0...build-v11.32.1) (2021-06-04)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.7
  ([#2910](https://www.github.com/netlify/build/issues/2910))
  ([a96240f](https://www.github.com/netlify/build/commit/a96240f54c4842634d0e2756a9891934926e71f7))

## [11.32.0](https://www.github.com/netlify/build/compare/build-v11.31.1...build-v11.32.0) (2021-06-04)

### Features

- monitor total time for user/system/plugin code ([#2911](https://www.github.com/netlify/build/issues/2911))
  ([ef33e9f](https://www.github.com/netlify/build/commit/ef33e9f2cb6bafa0cc861ee7c45d52187048132a))

### [11.31.1](https://www.github.com/netlify/build/compare/build-v11.31.0...build-v11.31.1) (2021-06-02)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.6
  ([#2900](https://www.github.com/netlify/build/issues/2900))
  ([6ae857d](https://www.github.com/netlify/build/commit/6ae857d99cdf69ac9f70cc96a891c9c14804b4a2))

## [11.31.0](https://www.github.com/netlify/build/compare/build-v11.30.0...build-v11.31.0) (2021-06-02)

### Features

- validate when mutating a property too late ([#2894](https://www.github.com/netlify/build/issues/2894))
  ([fa2d870](https://www.github.com/netlify/build/commit/fa2d87073fed71cf0219ebac70056f4e91f67f73))

## [11.30.0](https://www.github.com/netlify/build/compare/build-v11.29.2...build-v11.30.0) (2021-06-02)

### Features

- add support for experimental ZISI v2 handler ([#2895](https://www.github.com/netlify/build/issues/2895))
  ([7fea341](https://www.github.com/netlify/build/commit/7fea34122cd2ab8a1c56a177c5dffa83618542fe))

### [11.29.2](https://www.github.com/netlify/build/compare/build-v11.29.1...build-v11.29.2) (2021-05-31)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.5
  ([#2891](https://www.github.com/netlify/build/issues/2891))
  ([5ccd5f5](https://www.github.com/netlify/build/commit/5ccd5f51c553fd5f588065b384a795d90837ac85))

### [11.29.1](https://www.github.com/netlify/build/compare/build-v11.29.0...build-v11.29.1) (2021-05-31)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.13
  ([#2885](https://www.github.com/netlify/build/issues/2885))
  ([3a2f6ff](https://www.github.com/netlify/build/commit/3a2f6ff14013e0791ce21f51393b36c7e799cd42))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.2
  ([#2886](https://www.github.com/netlify/build/issues/2886))
  ([a4a0549](https://www.github.com/netlify/build/commit/a4a05497ba9809bc6420b31514f690badba4bc53))
- **deps:** update dependency uuid to v8 ([#2882](https://www.github.com/netlify/build/issues/2882))
  ([1d06463](https://www.github.com/netlify/build/commit/1d06463d9e4a15bfddb14b4be271411f29ed709a))

## [11.29.0](https://www.github.com/netlify/build/compare/build-v11.28.0...build-v11.29.0) (2021-05-28)

### Features

- allow mutating `build.command` ([#2874](https://www.github.com/netlify/build/issues/2874))
  ([e55dd94](https://www.github.com/netlify/build/commit/e55dd94e375c805fa923cd9bdccd184928d0790c))

## [11.28.0](https://www.github.com/netlify/build/compare/build-v11.27.0...build-v11.28.0) (2021-05-28)

### Features

- allow mutating `build.functions`, `functions.directory` and `functions.*.directory`
  ([#2875](https://www.github.com/netlify/build/issues/2875))
  ([39804f2](https://www.github.com/netlify/build/commit/39804f214a4de40b1eb573c7b405079df528b5ec))

## [11.27.0](https://www.github.com/netlify/build/compare/build-v11.26.1...build-v11.27.0) (2021-05-28)

### Features

- make build command a core command ([#2868](https://www.github.com/netlify/build/issues/2868))
  ([5149c87](https://www.github.com/netlify/build/commit/5149c87574f2dead8a4c6e8c1ef9056d35f91639))

### [11.26.1](https://www.github.com/netlify/build/compare/build-v11.26.0...build-v11.26.1) (2021-05-28)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.1
  ([#2870](https://www.github.com/netlify/build/issues/2870))
  ([6e576b2](https://www.github.com/netlify/build/commit/6e576b252fb08a8e70c0f17e178ff54aede1e272))

## [11.26.0](https://www.github.com/netlify/build/compare/build-v11.25.1...build-v11.26.0) (2021-05-27)

### Features

- allow mutating `build.publish` and `build.edge_handlers` ([#2866](https://www.github.com/netlify/build/issues/2866))
  ([c27557e](https://www.github.com/netlify/build/commit/c27557e0aadb8b9241358e2d5a77fc24fb7faed0))
- improve normalization of `constants` ([#2865](https://www.github.com/netlify/build/issues/2865))
  ([9dc4fdd](https://www.github.com/netlify/build/commit/9dc4fddfa351e9230387316af6c8386cb63ffea2))

### [11.25.1](https://www.github.com/netlify/build/compare/build-v11.25.0...build-v11.25.1) (2021-05-27)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.2.0
  ([#2861](https://www.github.com/netlify/build/issues/2861))
  ([1bd75f8](https://www.github.com/netlify/build/commit/1bd75f89509c4859cb3e31908d3ce54985142d7c))

## [11.25.0](https://www.github.com/netlify/build/compare/build-v11.24.0...build-v11.25.0) (2021-05-27)

### Features

- allow mutating `netlifyConfig.functions` ([#2857](https://www.github.com/netlify/build/issues/2857))
  ([0ea57a5](https://www.github.com/netlify/build/commit/0ea57a5d868afcc7abbbd65f11e843c4938035d4))

## [11.24.0](https://www.github.com/netlify/build/compare/build-v11.23.0...build-v11.24.0) (2021-05-26)

### Features

- allow mutating `netlifyConfig.functionsDirectory` ([#2852](https://www.github.com/netlify/build/issues/2852))
  ([c81904e](https://www.github.com/netlify/build/commit/c81904e9a89f0bc09f1dfda3f430e2ed14f1409b))

## [11.23.0](https://www.github.com/netlify/build/compare/build-v11.22.0...build-v11.23.0) (2021-05-26)

### Features

- allow `constants` to be mutated during builds ([#2850](https://www.github.com/netlify/build/issues/2850))
  ([b7a51aa](https://www.github.com/netlify/build/commit/b7a51aa61e86e51a8b074f5472fbd578aa2ca3a0))

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.1.0
  ([#2853](https://www.github.com/netlify/build/issues/2853))
  ([8269428](https://www.github.com/netlify/build/commit/826942805e8b02aa2462fa547890a263d5b4fbd8))

## [11.22.0](https://www.github.com/netlify/build/compare/build-v11.21.0...build-v11.22.0) (2021-05-25)

### Features

- pass mutated `netlifyConfig` everywhere ([#2847](https://www.github.com/netlify/build/issues/2847))
  ([7191b57](https://www.github.com/netlify/build/commit/7191b57e1a9cbc8d599db24b20996b568609c875))

## [11.21.0](https://www.github.com/netlify/build/compare/build-v11.20.0...build-v11.21.0) (2021-05-25)

### Features

- pass `netlifyConfig` to each event handler ([#2845](https://www.github.com/netlify/build/issues/2845))
  ([16ea9e4](https://www.github.com/netlify/build/commit/16ea9e401ec7045a091d70ff3724023eab3261fc))

## [11.20.0](https://www.github.com/netlify/build/compare/build-v11.19.1...build-v11.20.0) (2021-05-25)

### Features

- make `netlifyConfig` readonly ([#2840](https://www.github.com/netlify/build/issues/2840))
  ([a8e8e31](https://www.github.com/netlify/build/commit/a8e8e3173e8c58c3c0cdc2b956aa588c445c2f27))

### [11.19.1](https://www.github.com/netlify/build/compare/build-v11.19.0...build-v11.19.1) (2021-05-25)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.12
  ([#2841](https://www.github.com/netlify/build/issues/2841))
  ([9933438](https://www.github.com/netlify/build/commit/99334380f0057d37680695852019f4ad0561cb61))

## [11.19.0](https://www.github.com/netlify/build/compare/build-v11.18.1...build-v11.19.0) (2021-05-25)

### Features

- add `installType` to telemetry ([#2837](https://www.github.com/netlify/build/issues/2837))
  ([de0f18f](https://www.github.com/netlify/build/commit/de0f18f1b1172fb3353bbc1e325c3bf7b551e601))

### [11.18.1](https://www.github.com/netlify/build/compare/build-v11.18.0...build-v11.18.1) (2021-05-24)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.11
  ([#2835](https://www.github.com/netlify/build/issues/2835))
  ([03932f6](https://www.github.com/netlify/build/commit/03932f62398f459d0e46033e5aed89462fdd9909))
- **deps:** update dependency @netlify/plugins-list to ^2.14.2
  ([#2831](https://www.github.com/netlify/build/issues/2831))
  ([b779b3f](https://www.github.com/netlify/build/commit/b779b3f503a9603e439d30ac305391c78675f168))

## [11.18.0](https://www.github.com/netlify/build/compare/build-v11.17.4...build-v11.18.0) (2021-05-21)

### Features

- print a warning message when `base` is set but not `publish`
  ([#2827](https://www.github.com/netlify/build/issues/2827))
  ([a9fb807](https://www.github.com/netlify/build/commit/a9fb807be477bcd2419520b92d8a7c7d7ee03088))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.14.1
  ([#2830](https://www.github.com/netlify/build/issues/2830))
  ([1ee3998](https://www.github.com/netlify/build/commit/1ee3998a8aaa0d2e1cb07285e6853c37e5b64ca1))

### [11.17.4](https://www.github.com/netlify/build/compare/build-v11.17.3...build-v11.17.4) (2021-05-19)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.10
  ([#2822](https://www.github.com/netlify/build/issues/2822))
  ([47c8e05](https://www.github.com/netlify/build/commit/47c8e05269f3735d1988e46ac80ddfec2ff7c930))

### [11.17.3](https://www.github.com/netlify/build/compare/build-v11.17.2...build-v11.17.3) (2021-05-19)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.9
  ([#2819](https://www.github.com/netlify/build/issues/2819))
  ([0a820a2](https://www.github.com/netlify/build/commit/0a820a2cf2d370829e87e17d1e45f5c9c72be645))
- **deps:** update dependency @netlify/plugins-list to ^2.14.0
  ([#2820](https://www.github.com/netlify/build/issues/2820))
  ([fb55377](https://www.github.com/netlify/build/commit/fb5537770234866f23c3a441b668f0ab2dee837e))

### [11.17.2](https://www.github.com/netlify/build/compare/build-v11.17.1...build-v11.17.2) (2021-05-17)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^4.0.1
  ([#2814](https://www.github.com/netlify/build/issues/2814))
  ([122446e](https://www.github.com/netlify/build/commit/122446edb82aa597f1882c543664fbf683744904))

### [11.17.1](https://www.github.com/netlify/build/compare/build-v11.17.0...build-v11.17.1) (2021-05-17)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.13.0
  ([#2803](https://www.github.com/netlify/build/issues/2803))
  ([0d2009a](https://www.github.com/netlify/build/commit/0d2009aa3fb308f93a71425a312c2f5a8ca9aa40))
- **deps:** update dependency @netlify/zip-it-and-ship-it to v4
  ([#2800](https://www.github.com/netlify/build/issues/2800))
  ([5575708](https://www.github.com/netlify/build/commit/5575708ab19384103dd0e8c477e0ae672750c6cf))

## [11.17.0](https://www.github.com/netlify/build/compare/build-v11.16.0...build-v11.17.0) (2021-05-14)

### Features

- add build logs to explain how to upgrade plugins ([#2798](https://www.github.com/netlify/build/issues/2798))
  ([7e054ae](https://www.github.com/netlify/build/commit/7e054ae16d815b89f6a4ea2984a4c21dc4c75a4e))

### Bug Fixes

- improve `compatibility`-related warning messages ([#2797](https://www.github.com/netlify/build/issues/2797))
  ([7f34aa5](https://www.github.com/netlify/build/commit/7f34aa59909dce6fa5fa6cd7f9721c8203745da6))

## [11.16.0](https://www.github.com/netlify/build/compare/build-v11.15.0...build-v11.16.0) (2021-05-13)

### Features

- simplify version pinning logic ([#2795](https://www.github.com/netlify/build/issues/2795))
  ([7c0d61b](https://www.github.com/netlify/build/commit/7c0d61b896b50be42272d489bd04b09097fbc752))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.12.0
  ([#2793](https://www.github.com/netlify/build/issues/2793))
  ([f2b4bad](https://www.github.com/netlify/build/commit/f2b4bad006d9185ff2ee0c09c101d69873fc0ffa))

## [11.15.0](https://www.github.com/netlify/build/compare/build-v11.14.0...build-v11.15.0) (2021-05-13)

### Features

- change shape of `compatibility` field ([#2791](https://www.github.com/netlify/build/issues/2791))
  ([f43d3f6](https://www.github.com/netlify/build/commit/f43d3f6682aa46e2d442b4d94a787629507945af))

## [11.14.0](https://www.github.com/netlify/build/compare/build-v11.13.0...build-v11.14.0) (2021-05-12)

### Features

- allow commands to add tags to the metrics + `bundler` tag ([#2783](https://www.github.com/netlify/build/issues/2783))
  ([345e433](https://www.github.com/netlify/build/commit/345e433244b4c27e8d9a333e52e056d7f51e4bea))
- **config:** return repository root ([#2785](https://www.github.com/netlify/build/issues/2785))
  ([9a05786](https://www.github.com/netlify/build/commit/9a05786266c51031ccaef1f216f21c5821ec92fb))

## [11.13.0](https://www.github.com/netlify/build/compare/build-v11.12.1...build-v11.13.0) (2021-05-12)

### Features

- show warning about modules with dynamic imports ([#2773](https://www.github.com/netlify/build/issues/2773))
  ([b49efe5](https://www.github.com/netlify/build/commit/b49efe54e81b1cd35b912b1980ba6cd1bd04539c))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.11.2
  ([#2779](https://www.github.com/netlify/build/issues/2779))
  ([83cfde7](https://www.github.com/netlify/build/commit/83cfde78abda0c782b3a9979d60f06d8eb07ce5f))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.10.0
  ([#2776](https://www.github.com/netlify/build/issues/2776))
  ([e8599eb](https://www.github.com/netlify/build/commit/e8599ebaac5828fbd143dc54bd14abeb1aee6732))

### [11.12.1](https://www.github.com/netlify/build/compare/build-v11.12.0...build-v11.12.1) (2021-05-12)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.11.1
  ([#2775](https://www.github.com/netlify/build/issues/2775))
  ([982944b](https://www.github.com/netlify/build/commit/982944b5c90b39ce838c0849294d9787dc141ab9))

## [11.12.0](https://www.github.com/netlify/build/compare/build-v11.11.0...build-v11.12.0) (2021-05-10)

### Features

- improve version pinning ([#2762](https://www.github.com/netlify/build/issues/2762))
  ([940b19e](https://www.github.com/netlify/build/commit/940b19eb10747f33f67d4eecec834471c0455cc0))

## [11.11.0](https://www.github.com/netlify/build/compare/build-v11.10.0...build-v11.11.0) (2021-05-10)

### Features

- fix test snapshots related to version pinning ([#2764](https://www.github.com/netlify/build/issues/2764))
  ([0ce49e0](https://www.github.com/netlify/build/commit/0ce49e001e9f7fb980b3de3e22bbcc047e4f5d4e))

## [11.10.0](https://www.github.com/netlify/build/compare/build-v11.9.4...build-v11.10.0) (2021-05-07)

### Features

- add support for `0.*` versions in outdated plugins message ([#2756](https://www.github.com/netlify/build/issues/2756))
  ([69a0ea1](https://www.github.com/netlify/build/commit/69a0ea13e655535c113ec37374a99a5b7b3308c3))
- add support for `0.*` versions when pinning versions ([#2758](https://www.github.com/netlify/build/issues/2758))
  ([6210e36](https://www.github.com/netlify/build/commit/6210e36dafc4f7deda44d8ab3e4a76c44e3e1a5d))

### [11.9.4](https://www.github.com/netlify/build/compare/build-v11.9.3...build-v11.9.4) (2021-05-06)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.10.0
  ([#2759](https://www.github.com/netlify/build/issues/2759))
  ([3cf77d9](https://www.github.com/netlify/build/commit/3cf77d941a0d83b6ba7987c95d0442dfe1a2a615))

### [11.9.3](https://www.github.com/netlify/build/compare/build-v11.9.2...build-v11.9.3) (2021-05-06)

### Bug Fixes

- simplify version pinning logic ([#2753](https://www.github.com/netlify/build/issues/2753))
  ([c0c34c0](https://www.github.com/netlify/build/commit/c0c34c062349ccec92163586a69ea112f8d461e8))

### [11.9.2](https://www.github.com/netlify/build/compare/build-v11.9.1...build-v11.9.2) (2021-05-06)

### Bug Fixes

- 404 in production with `updatePlugin` ([#2749](https://www.github.com/netlify/build/issues/2749))
  ([6ed8ab9](https://www.github.com/netlify/build/commit/6ed8ab9f55690981d8f6c1216ebb1b5bc0efd8c4))

### [11.9.1](https://www.github.com/netlify/build/compare/build-v11.9.0...build-v11.9.1) (2021-05-05)

### Bug Fixes

- **deps:** lock file maintenance ([#2744](https://www.github.com/netlify/build/issues/2744))
  ([52f47a4](https://www.github.com/netlify/build/commit/52f47a4ff2787c5b8256bbe89e572c12c8912f84))

## [11.9.0](https://www.github.com/netlify/build/compare/build-v11.8.0...build-v11.9.0) (2021-05-05)

### Features

- pin `netlify.toml`-installed plugins versions ([#2740](https://www.github.com/netlify/build/issues/2740))
  ([7ebab6b](https://www.github.com/netlify/build/commit/7ebab6bd89506d7fb0c60e8f698d07367e02822c))

## [11.8.0](https://www.github.com/netlify/build/compare/build-v11.7.3...build-v11.8.0) (2021-05-05)

### Features

- add more plugin metrics ([#2732](https://www.github.com/netlify/build/issues/2732))
  ([77efcaa](https://www.github.com/netlify/build/commit/77efcaabedb0f6866dcbffc95d84d8f200942233))

### [11.7.3](https://www.github.com/netlify/build/compare/build-v11.7.2...build-v11.7.3) (2021-05-04)

### Bug Fixes

- **deps:** update netlify packages ([#2735](https://www.github.com/netlify/build/issues/2735))
  ([6060bab](https://www.github.com/netlify/build/commit/6060babcee003881df46f45eda1118b7737cc4e1))

### [11.7.2](https://www.github.com/netlify/build/compare/build-v11.7.1...build-v11.7.2) (2021-05-03)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.9.0
  ([#2729](https://www.github.com/netlify/build/issues/2729))
  ([a0cbfdc](https://www.github.com/netlify/build/commit/a0cbfdcccb122549ba1efb576d3c0431e8370a6f))

### [11.7.1](https://www.github.com/netlify/build/compare/build-v11.7.0...build-v11.7.1) (2021-05-03)

### Bug Fixes

- **deps:** update dependency map-obj to v4 ([#2721](https://www.github.com/netlify/build/issues/2721))
  ([17559dc](https://www.github.com/netlify/build/commit/17559dcc75dd9f9a73f2a604c9f8ef3140a91b42))

## [11.7.0](https://www.github.com/netlify/build/compare/build-v11.6.0...build-v11.7.0) (2021-05-03)

### Features

- add support for `functions.included_files` config property ([#2681](https://www.github.com/netlify/build/issues/2681))
  ([d75dc74](https://www.github.com/netlify/build/commit/d75dc74d9bbe9b542b17afce37419bed575c8651))

## [11.6.0](https://www.github.com/netlify/build/compare/build-v11.5.1...build-v11.6.0) (2021-04-30)

### Features

- pin plugins versions ([#2714](https://www.github.com/netlify/build/issues/2714))
  ([0857f65](https://www.github.com/netlify/build/commit/0857f652ccaa8f38f5af68e7e65348e7a8e25fd8))

### [11.5.1](https://www.github.com/netlify/build/compare/build-v11.5.0...build-v11.5.1) (2021-04-30)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.7
  ([#2711](https://www.github.com/netlify/build/issues/2711))
  ([66d9f53](https://www.github.com/netlify/build/commit/66d9f538dc226e569424d7c72f26c808e54e6987))

## [11.5.0](https://www.github.com/netlify/build/compare/build-v11.4.4...build-v11.5.0) (2021-04-30)

### Features

- **plugins:** expose NETLIFY_API_HOST constant to plugins ([#2709](https://www.github.com/netlify/build/issues/2709))
  ([8b56399](https://www.github.com/netlify/build/commit/8b5639916f7dffba4bb74e776db060f2cc4e0993))

### [11.4.4](https://www.github.com/netlify/build/compare/build-v11.4.3...build-v11.4.4) (2021-04-29)

### Bug Fixes

- re-enable `updateSite` endpoint ([#2704](https://www.github.com/netlify/build/issues/2704))
  ([aa704af](https://www.github.com/netlify/build/commit/aa704af603b21fec4d99d2163f884e0a6f776761))

### [11.4.3](https://www.github.com/netlify/build/compare/build-v11.4.2...build-v11.4.3) (2021-04-29)

### Bug Fixes

- do not run `updateSite` for `netlify.toml`-only plugins ([#2703](https://www.github.com/netlify/build/issues/2703))
  ([0580c8f](https://www.github.com/netlify/build/commit/0580c8fa0b1dfcd9fe8eaac6596e84d3ab38b980))
- percent-encode the `package` parameter of the `updatePlugin` endpoint
  ([#2702](https://www.github.com/netlify/build/issues/2702))
  ([d2edef2](https://www.github.com/netlify/build/commit/d2edef2a8ca27dc996a2c7db50d66a623fcb1d08))

### [11.4.2](https://www.github.com/netlify/build/compare/build-v11.4.1...build-v11.4.2) (2021-04-29)

### Bug Fixes

- improve temporary fix for the `updatePlugin` bug ([#2696](https://www.github.com/netlify/build/issues/2696))
  ([87fde4a](https://www.github.com/netlify/build/commit/87fde4accae7dc6d4ab8a1b09ef2c4c3a7152f25))

### [11.4.1](https://www.github.com/netlify/build/compare/build-v11.4.0...build-v11.4.1) (2021-04-29)

### Bug Fixes

- use the proper conventional commit in PR title ([#2694](https://www.github.com/netlify/build/issues/2694))
  ([6829fe4](https://www.github.com/netlify/build/commit/6829fe432d9a2e1288c7eb931e052c12b302b703))

## [11.4.0](https://www.github.com/netlify/build/compare/build-v11.3.2...build-v11.4.0) (2021-04-29)

### Features

- call `updatePlugin` to pin plugins' versions ([#2683](https://www.github.com/netlify/build/issues/2683))
  ([1d0ce63](https://www.github.com/netlify/build/commit/1d0ce6342f6e00376be51a05d906b7867fc8f9a0))
- improve debugging of plugins versioning ([#2691](https://www.github.com/netlify/build/issues/2691))
  ([4659410](https://www.github.com/netlify/build/commit/46594109dcbc713d9ba3041e7a2a1013b4e406df))

### [11.3.2](https://www.github.com/netlify/build/compare/build-v11.3.1...build-v11.3.2) (2021-04-28)

### Bug Fixes

- **telemetry:** fwd relevant `nodeVersion` information ([#2634](https://www.github.com/netlify/build/issues/2634))
  ([caec0d6](https://www.github.com/netlify/build/commit/caec0d66f7649856cdad749545fdbe084b1549e8))

### [11.3.1](https://www.github.com/netlify/build/compare/build-v11.3.0...build-v11.3.1) (2021-04-27)

### Bug Fixes

- do not fail when plugin error has `toJSON()` method ([#2677](https://www.github.com/netlify/build/issues/2677))
  ([6363758](https://www.github.com/netlify/build/commit/6363758cb4cc2ef232ac5ff21298126ab7318e30))

## [11.3.0](https://www.github.com/netlify/build/compare/build-v11.2.6...build-v11.3.0) (2021-04-27)

### Features

- remove `--ui-plugins` CLI flag ([#2673](https://www.github.com/netlify/build/issues/2673))
  ([a1cbf78](https://www.github.com/netlify/build/commit/a1cbf789bac18a83232a29c70390691442527693))

### [11.2.6](https://www.github.com/netlify/build/compare/build-v11.2.5...build-v11.2.6) (2021-04-26)

### Bug Fixes

- **deps:** update dependency map-obj to v3.1.0 ([#2656](https://www.github.com/netlify/build/issues/2656))
  ([89e497a](https://www.github.com/netlify/build/commit/89e497a37a892f203a601a510e0e24ae037ad146))
- **deps:** update dependency statsd-client to v0.4.6 ([#2658](https://www.github.com/netlify/build/issues/2658))
  ([be366a2](https://www.github.com/netlify/build/commit/be366a264d1e4db2a71ee8b233d65889cee3992c))
- **deps:** update dependency uuid to v7.0.3 ([#2659](https://www.github.com/netlify/build/issues/2659))
  ([e7e9ea8](https://www.github.com/netlify/build/commit/e7e9ea8d0cb0a9c3cd9e16aeda2bd300c7057509))

### [11.2.5](https://www.github.com/netlify/build/compare/build-v11.2.4...build-v11.2.5) (2021-04-24)

### Bug Fixes

- **deps:** memoize-one breaking change in exports ([#2653](https://www.github.com/netlify/build/issues/2653))
  ([7a10098](https://www.github.com/netlify/build/commit/7a10098382f3a35bbe1a0dc62a6d7b7416479d53))

### [11.2.4](https://www.github.com/netlify/build/compare/build-v11.2.3...build-v11.2.4) (2021-04-23)

### Bug Fixes

- **deps:** memoize-one cjs exports breaking changes ([#2643](https://www.github.com/netlify/build/issues/2643))
  ([eafdaa0](https://www.github.com/netlify/build/commit/eafdaa04b60ae1753e3752748aaa4d2b6a5994e7))

### [11.2.3](https://www.github.com/netlify/build/compare/build-v11.2.2...build-v11.2.3) (2021-04-22)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.8.0
  ([#2631](https://www.github.com/netlify/build/issues/2631))
  ([fbc235e](https://www.github.com/netlify/build/commit/fbc235e407ac100957a53fe5a151c02bde58bb7f))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.7.0
  ([#2633](https://www.github.com/netlify/build/issues/2633))
  ([4938a1c](https://www.github.com/netlify/build/commit/4938a1ca36a8dffcec5fb2b10a4e08ac451a8ba7))

### [11.2.2](https://www.github.com/netlify/build/compare/build-v11.2.1...build-v11.2.2) (2021-04-21)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.6.0
  ([#2626](https://www.github.com/netlify/build/issues/2626))
  ([63e0330](https://www.github.com/netlify/build/commit/63e033014a78229daa9b11360abd24944561ec12))

### [11.2.1](https://www.github.com/netlify/build/compare/build-v11.2.0...build-v11.2.1) (2021-04-20)

### Bug Fixes

- **deps:** update netlify packages ([#2622](https://www.github.com/netlify/build/issues/2622))
  ([4d35de4](https://www.github.com/netlify/build/commit/4d35de4d4d8d49b460080480c6e5b3610e6ef023))

## [11.2.0](https://www.github.com/netlify/build/compare/build-v11.1.0...build-v11.2.0) (2021-04-19)

### Features

- split `compatibleVersion` and `expectedVersion` ([#2613](https://www.github.com/netlify/build/issues/2613))
  ([ffaf4a4](https://www.github.com/netlify/build/commit/ffaf4a477ef7e88a8af55dd6070b8e939e89c740))
- start pinning plugin versions ([#2617](https://www.github.com/netlify/build/issues/2617))
  ([2c8a9cb](https://www.github.com/netlify/build/commit/2c8a9cb676e92411aa709a0aeb23394c30c7e3a1))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.7.0
  ([#2619](https://www.github.com/netlify/build/issues/2619))
  ([ae1e4ae](https://www.github.com/netlify/build/commit/ae1e4ae4624d8510f8838d6f3a190bc515d92925))
- failing esbuild tests ([#2615](https://www.github.com/netlify/build/issues/2615))
  ([6f50566](https://www.github.com/netlify/build/commit/6f505662083672975eff9f745a68c7ec6702fd6d))

## [11.1.0](https://www.github.com/netlify/build/compare/build-v11.0.2...build-v11.1.0) (2021-04-16)

### Features

- refactor incompatible/outdated plugins warnings ([#2612](https://www.github.com/netlify/build/issues/2612))
  ([d2777e9](https://www.github.com/netlify/build/commit/d2777e9b97d8b509c0fd6121e0ae4c6a89a0c408))

### [11.0.2](https://www.github.com/netlify/build/compare/build-v11.0.1...build-v11.0.2) (2021-04-15)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.4.0
  ([#2609](https://www.github.com/netlify/build/issues/2609))
  ([83da9dc](https://www.github.com/netlify/build/commit/83da9dc609296f4cd7409c923e14e6772c2e4463))

### [11.0.1](https://www.github.com/netlify/build/compare/build-v11.0.0...build-v11.0.1) (2021-04-14)

### Bug Fixes

- `@netlify/config` major release ([#2603](https://www.github.com/netlify/build/issues/2603))
  ([5c53aa8](https://www.github.com/netlify/build/commit/5c53aa895d51a0b99ac8638f54b326fb7ae1a395))

## [11.0.0](https://www.github.com/netlify/build/compare/build-v10.3.0...build-v11.0.0) (2021-04-14)

### ⚠ BREAKING CHANGES

- simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags (#2595)

### Features

- simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags
  ([#2595](https://www.github.com/netlify/build/issues/2595))
  ([c272632](https://www.github.com/netlify/build/commit/c272632db8825f85c07bb05cd90eacb1c8ea2544))

## [10.3.0](https://www.github.com/netlify/build/compare/build-v10.2.7...build-v10.3.0) (2021-04-14)

### Features

- add `--ui-plugins` CLI flag ([#2597](https://www.github.com/netlify/build/issues/2597))
  ([7c9273b](https://www.github.com/netlify/build/commit/7c9273b2ed1e2e47b25c6eed0851bc26b1da037a))

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.2.1
  ([#2592](https://www.github.com/netlify/build/issues/2592))
  ([3fae367](https://www.github.com/netlify/build/commit/3fae3679e78734d2dad9e199870419f22cffd9c9))
- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.3.0
  ([#2598](https://www.github.com/netlify/build/issues/2598))
  ([5eeed10](https://www.github.com/netlify/build/commit/5eeed1075e0b65aa656be065558668b451896ac7))

### [10.2.7](https://www.github.com/netlify/build/compare/build-v10.2.6...build-v10.2.7) (2021-04-09)

### Bug Fixes

- warning message link ([#2576](https://www.github.com/netlify/build/issues/2576))
  ([19a6ba3](https://www.github.com/netlify/build/commit/19a6ba31bc6b2fdce96dc6b48adfc7b8489a18a9))

### [10.2.6](https://www.github.com/netlify/build/compare/build-v10.2.5...build-v10.2.6) (2021-04-09)

### Bug Fixes

- improve lingering processes warning message ([#2467](https://www.github.com/netlify/build/issues/2467))
  ([d62099b](https://www.github.com/netlify/build/commit/d62099ba424a70bbcb0b7d239d94f63cc03826b5))

### [10.2.5](https://www.github.com/netlify/build/compare/build-v10.2.4...build-v10.2.5) (2021-04-07)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.2.0
  ([#2552](https://www.github.com/netlify/build/issues/2552))
  ([26b379e](https://www.github.com/netlify/build/commit/26b379e10feb5ee26c3fd426df05a21c0eafb4f1))

### [10.2.4](https://www.github.com/netlify/build/compare/build-v10.2.3...build-v10.2.4) (2021-04-06)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^3.1.0
  ([#2536](https://www.github.com/netlify/build/issues/2536))
  ([fc694be](https://www.github.com/netlify/build/commit/fc694be35a186ef362c3e1e541d0e4c65af7109d))

### [10.2.3](https://www.github.com/netlify/build/compare/build-v10.2.2...build-v10.2.3) (2021-04-06)

### Bug Fixes

- **feature_flag:** remove telemetry feature flag code ([#2535](https://www.github.com/netlify/build/issues/2535))
  ([69a48b6](https://www.github.com/netlify/build/commit/69a48b669a38c5492cbd7abed13f5d3bcd832dcd))

### [10.2.2](https://www.github.com/netlify/build/compare/build-v10.2.1...build-v10.2.2) (2021-04-02)

### Bug Fixes

- do not print internal information in the build logs ([#2527](https://www.github.com/netlify/build/issues/2527))
  ([8c2ca4a](https://www.github.com/netlify/build/commit/8c2ca4aa406bd7d16ecb2b9d4aabed95c22dceb3))

### [10.2.1](https://www.github.com/netlify/build/compare/build-v10.2.0...build-v10.2.1) (2021-04-01)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.6.0
  ([#2167](https://www.github.com/netlify/build/issues/2167))
  ([342cc55](https://www.github.com/netlify/build/commit/342cc55e4dd559c4db41f8e475425aef225523a1))
- remove some code ([#2524](https://www.github.com/netlify/build/issues/2524))
  ([536b89b](https://www.github.com/netlify/build/commit/536b89bf4f82bf4ffe3155847ef824e56b35a82d))

## [10.2.0](https://www.github.com/netlify/build/compare/build-v10.1.0...build-v10.2.0) (2021-04-01)

### Features

- improve lingering processes warning message, comments and logic
  ([#2514](https://www.github.com/netlify/build/issues/2514))
  ([e619528](https://www.github.com/netlify/build/commit/e61952833dd27fc2bb711505f820dc54248a29b9))

## [10.1.0](https://www.github.com/netlify/build/compare/build-v10.0.0...build-v10.1.0) (2021-04-01)

### Features

- add functions config object to build output ([#2518](https://www.github.com/netlify/build/issues/2518))
  ([280834c](https://www.github.com/netlify/build/commit/280834c079995ad3c3b5607f983198fba6b3ac13))

## [10.0.0](https://www.github.com/netlify/build/compare/build-v9.19.1...build-v10.0.0) (2021-03-30)

### ⚠ BREAKING CHANGES

- add functions.directory property (#2496)

### Features

- add functions.directory property ([#2496](https://www.github.com/netlify/build/issues/2496))
  ([d72b1d1](https://www.github.com/netlify/build/commit/d72b1d1fb91de3fa23310ed477a6658c5492aed0))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.5.1
  ([#2510](https://www.github.com/netlify/build/issues/2510))
  ([8614122](https://www.github.com/netlify/build/commit/8614122b8c4cb676cece0780e390ef2b98dc08a1))
- disable 2 Yarn-related tests on Node <14 ([#2511](https://www.github.com/netlify/build/issues/2511))
  ([f3b3db2](https://www.github.com/netlify/build/commit/f3b3db254c6c3826ac91b68e284b403cb5bfeedb))

### [9.19.1](https://www.github.com/netlify/build/compare/build-v9.19.0...build-v9.19.1) (2021-03-30)

### Bug Fixes

- **telemetry:** report telemetry errors without impacting builds
  ([#2501](https://www.github.com/netlify/build/issues/2501))
  ([9bc15fe](https://www.github.com/netlify/build/commit/9bc15fec1f66e30a1980e52c55701d32ecc08b2f))

## [9.19.0](https://www.github.com/netlify/build/compare/build-v9.18.0...build-v9.19.0) (2021-03-29)

### Features

- make lingering processes logic work on Windows ([#2500](https://www.github.com/netlify/build/issues/2500))
  ([a23f12c](https://www.github.com/netlify/build/commit/a23f12cd25f327f2c757148195dba371702060f3))

## [9.18.0](https://www.github.com/netlify/build/compare/build-v9.17.1...build-v9.18.0) (2021-03-29)

### Features

- improve how lingering processes are filtered out ([#2488](https://www.github.com/netlify/build/issues/2488))
  ([4cc25e0](https://www.github.com/netlify/build/commit/4cc25e07d48c6edc2138a2d53cb4d39f0a9f93e1))

### [9.17.1](https://www.github.com/netlify/build/compare/build-v9.17.0...build-v9.17.1) (2021-03-26)

### Bug Fixes

- do not show an empty list of lingering processes ([#2486](https://www.github.com/netlify/build/issues/2486))
  ([692a043](https://www.github.com/netlify/build/commit/692a043dbfd966e9f806521a33966025bf745337))

## [9.17.0](https://www.github.com/netlify/build/compare/build-v9.16.0...build-v9.17.0) (2021-03-26)

### Features

- distinguish between warnings and errors in build logs ([#2470](https://www.github.com/netlify/build/issues/2470))
  ([73e4998](https://www.github.com/netlify/build/commit/73e4998218d0c243d47e98d2856486466631062c))

## [9.16.0](https://www.github.com/netlify/build/compare/build-v9.15.1...build-v9.16.0) (2021-03-26)

### Features

- improve lingering process message to add bullet points ([#2479](https://www.github.com/netlify/build/issues/2479))
  ([9376e26](https://www.github.com/netlify/build/commit/9376e2615f7dcf9db556e8305a076ee477fc5387))

### [9.15.1](https://www.github.com/netlify/build/compare/build-v9.15.0...build-v9.15.1) (2021-03-26)

### Bug Fixes

- do not fail when there are no lingering processes ([#2480](https://www.github.com/netlify/build/issues/2480))
  ([0c1eff1](https://www.github.com/netlify/build/commit/0c1eff1d004feab6dbdebb000e38dc49d0093176))

## [9.15.0](https://www.github.com/netlify/build/compare/build-v9.14.1...build-v9.15.0) (2021-03-26)

### Features

- improve lingering processes list ([#2475](https://www.github.com/netlify/build/issues/2475))
  ([d805361](https://www.github.com/netlify/build/commit/d805361b505d130acd7b00b3ab3bb70ba29a0ccd))

### [9.14.1](https://www.github.com/netlify/build/compare/build-v9.14.0...build-v9.14.1) (2021-03-26)

### Bug Fixes

- improve lingering processes query ([#2473](https://www.github.com/netlify/build/issues/2473))
  ([c7e1c58](https://www.github.com/netlify/build/commit/c7e1c5866a56ce00c47efbc4d8a5cbd3ed896343))

## [9.14.0](https://www.github.com/netlify/build/compare/build-v9.13.2...build-v9.14.0) (2021-03-25)

### Features

- remove legacy code related to netlify-automatic-functions ([#2469](https://www.github.com/netlify/build/issues/2469))
  ([88b841a](https://www.github.com/netlify/build/commit/88b841ad02bf48f000b6d6250fb519630db1a23c))
- remove unused warning message ([#2468](https://www.github.com/netlify/build/issues/2468))
  ([46a4cba](https://www.github.com/netlify/build/commit/46a4cba90a67d1848655f4e27153e520a513b33f))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.5.0
  ([#2465](https://www.github.com/netlify/build/issues/2465))
  ([cdd82f3](https://www.github.com/netlify/build/commit/cdd82f31cf2cf7e43ba6fd0faabcccf1e454ccf1))

### [9.13.2](https://www.github.com/netlify/build/compare/v9.13.1...v9.13.2) (2021-03-24)

### Bug Fixes

- **telemetry:** s/user_id/userId/ ([#2463](https://www.github.com/netlify/build/issues/2463))
  ([7793424](https://www.github.com/netlify/build/commit/77934242d563af480121372b533c8cb7de278dc7))

### [9.13.1](https://www.github.com/netlify/build/compare/v9.13.0...v9.13.1) (2021-03-23)

### Bug Fixes

- **telemetry:** set a default user_id for production builds ([#2458](https://www.github.com/netlify/build/issues/2458))
  ([50bd881](https://www.github.com/netlify/build/commit/50bd881b1805bce9cda7cc676f7231f4675fd906))

## [9.13.0](https://www.github.com/netlify/build/compare/v9.12.0...v9.13.0) (2021-03-23)

### Features

- add skipped plugin_runs ([#2457](https://www.github.com/netlify/build/issues/2457))
  ([0d4f3fc](https://www.github.com/netlify/build/commit/0d4f3fc2d0f961651c6671739436ea97b9d831fd))

## [9.12.0](https://www.github.com/netlify/build/compare/v9.11.4...v9.12.0) (2021-03-23)

### Features

- move core plugins logic ([#2454](https://www.github.com/netlify/build/issues/2454))
  ([35e7fa2](https://www.github.com/netlify/build/commit/35e7fa26b4d4280e53dc97b35a520ed4c0219fec))
- move plugins initialization code ([#2451](https://www.github.com/netlify/build/issues/2451))
  ([ffc4a8b](https://www.github.com/netlify/build/commit/ffc4a8bd23b05d6150af90b4811fabed61466a01))

### [9.11.4](https://www.github.com/netlify/build/compare/v9.11.3...v9.11.4) (2021-03-22)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to ^1.11.6
  ([#2449](https://www.github.com/netlify/build/issues/2449))
  ([f7613c3](https://www.github.com/netlify/build/commit/f7613c320d223833d853c511a7d8ea3de8bdcc83))

### [9.11.3](https://www.github.com/netlify/build/compare/v9.11.2...v9.11.3) (2021-03-22)

### Bug Fixes

- **telemetry:** wait for telemetry completion ([#2438](https://www.github.com/netlify/build/issues/2438))
  ([ae0b3d5](https://www.github.com/netlify/build/commit/ae0b3d5236a0b4ab341e357d8ddd47ac3491474b))

### [9.11.2](https://www.github.com/netlify/build/compare/v9.11.1...v9.11.2) (2021-03-19)

### Bug Fixes

- add exit event handler to prevent invalid exit code 0 ([#2432](https://www.github.com/netlify/build/issues/2432))
  ([361ed2d](https://www.github.com/netlify/build/commit/361ed2d67b0ae05a5e71692da388f68518188b92))

### [9.11.1](https://www.github.com/netlify/build/compare/v9.11.0...v9.11.1) (2021-03-19)

### Bug Fixes

- reinstate notice about bundling errors and warnings ([#2437](https://www.github.com/netlify/build/issues/2437))
  ([b8571d8](https://www.github.com/netlify/build/commit/b8571d8dd0122a90edd7f0f512c3d77505cb42ca))

## [9.11.0](https://www.github.com/netlify/build/compare/v9.10.2...v9.11.0) (2021-03-18)

### Features

- add functions configuration API to @netlify/build ([#2414](https://www.github.com/netlify/build/issues/2414))
  ([7aa8173](https://www.github.com/netlify/build/commit/7aa8173f9d0bf7553ed3326c5b4aca1ba34d5cda))
- add functions configuration API to @netlify/config ([#2390](https://www.github.com/netlify/build/issues/2390))
  ([654d32e](https://www.github.com/netlify/build/commit/654d32eb49bea33816b1adde02f13f0843db9cdd))

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.4.3
  ([#2436](https://www.github.com/netlify/build/issues/2436))
  ([1d96d65](https://www.github.com/netlify/build/commit/1d96d65c073439b5e349963e357780ced48ec59a))

### [9.10.2](https://www.github.com/netlify/build/compare/v9.10.1...v9.10.2) (2021-03-17)

### Bug Fixes

- rename internal variable ([#2425](https://www.github.com/netlify/build/issues/2425))
  ([614b5c7](https://www.github.com/netlify/build/commit/614b5c73422b0ad780038c09410f5e17242d1922))

### [9.10.1](https://www.github.com/netlify/build/compare/v9.10.0...v9.10.1) (2021-03-16)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.4.2
  ([#2423](https://www.github.com/netlify/build/issues/2423))
  ([475ad30](https://www.github.com/netlify/build/commit/475ad302370777741675bb31b7aaa8c62aa58a49))

## [9.10.0](https://www.github.com/netlify/build/compare/v9.9.7...v9.10.0) (2021-03-16)

### Features

- add an error type for Functions bundling user errors ([#2420](https://www.github.com/netlify/build/issues/2420))
  ([9fe8911](https://www.github.com/netlify/build/commit/9fe8911f22ad88ed38e22734cbcf687b9663fa49))
- add warning messages when using plugins that are too recent and incompatible
  ([#2422](https://www.github.com/netlify/build/issues/2422))
  ([30bc126](https://www.github.com/netlify/build/commit/30bc1264e590b25a13cb2c53133589721fe45127))

### [9.9.7](https://www.github.com/netlify/build/compare/v9.9.6...v9.9.7) (2021-03-16)

### Bug Fixes

- build process never exits ([#2415](https://www.github.com/netlify/build/issues/2415))
  ([d394b24](https://www.github.com/netlify/build/commit/d394b2410bb4d52053b8a922dfc8075933a3da62))

### [9.9.7](https://www.github.com/netlify/build/compare/v9.9.6...v9.9.7) (2021-03-15)

### Bug Fixes

- fix build process never exits ([#2415](https://www.github.com/netlify/build/issues/2415))
  ([d394b2410](https://www.github.com/netlify/build/commit/d394b2410bb4d52053b8a922dfc8075933a3da62))

### [9.9.6](https://www.github.com/netlify/build/compare/v9.9.5...v9.9.6) (2021-03-15)

### Bug Fixes

- **compatibility:** properly handle dependency ranges ([#2408](https://www.github.com/netlify/build/issues/2408))
  ([0d14572](https://www.github.com/netlify/build/commit/0d14572d4a6c826b4289b4630b8b04507075d3f4))
- **deps:** update dependency @netlify/plugins-list to ^2.4.1
  ([#2404](https://www.github.com/netlify/build/issues/2404))
  ([14cee2d](https://www.github.com/netlify/build/commit/14cee2d4075c998bf41697655ac572d4e1191b14))

### [9.9.5](https://www.github.com/netlify/build/compare/v9.9.4...v9.9.5) (2021-03-12)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.7.1
  ([#2396](https://www.github.com/netlify/build/issues/2396))
  ([b4c070f](https://www.github.com/netlify/build/commit/b4c070fa8ac1406b3f489e5ddb038e4ecbe1f68c))

### [9.9.4](https://www.github.com/netlify/build/compare/v9.9.3...v9.9.4) (2021-03-11)

### Bug Fixes

- fix error handling when importing a non-existing local file
  ([#2394](https://www.github.com/netlify/build/issues/2394))
  ([881448b](https://www.github.com/netlify/build/commit/881448b9ba6460086c653e7de40e6866f709b979))

### [9.9.3](https://www.github.com/netlify/build/compare/v9.9.2...v9.9.3) (2021-03-11)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.7.0
  ([#2391](https://www.github.com/netlify/build/issues/2391))
  ([0c1c1dc](https://www.github.com/netlify/build/commit/0c1c1dcce06fc511ba2c26bf2fb52b91e202b670))

### [9.9.2](https://www.github.com/netlify/build/compare/v9.9.1...v9.9.2) (2021-03-10)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.6.0
  ([#2384](https://www.github.com/netlify/build/issues/2384))
  ([4311b02](https://www.github.com/netlify/build/commit/4311b02530807eee9b83f063923f0d1932c9ec85))

### [9.9.1](https://www.github.com/netlify/build/compare/v9.9.0...v9.9.1) (2021-03-09)

### Bug Fixes

- fix `host` option in `@netlify/config` ([#2379](https://www.github.com/netlify/build/issues/2379))
  ([64d8386](https://www.github.com/netlify/build/commit/64d8386daf5f1f069ea95fb655a593b05f8f8107))
- fix `semver` version with Node 8 ([#2362](https://www.github.com/netlify/build/issues/2362))
  ([c72ecd8](https://www.github.com/netlify/build/commit/c72ecd8c8525e269180b427489991d9ec3238022))

## [9.9.0](https://www.github.com/netlify/build/compare/v9.8.6...v9.9.0) (2021-03-08)

### Features

- allow passing Netlify API host to Netlify API client ([#2288](https://www.github.com/netlify/build/issues/2288))
  ([5529b1d](https://www.github.com/netlify/build/commit/5529b1dc92eccb6a932f80b006e83acfa0034413))

### [9.8.6](https://www.github.com/netlify/build/compare/v9.8.5...v9.8.6) (2021-03-08)

### Bug Fixes

- telemetry ([#2349](https://www.github.com/netlify/build/issues/2349))
  ([3ee7ebf](https://www.github.com/netlify/build/commit/3ee7ebf08a2ac9e21d19f64ff63d7ce20ec031b9))

### [9.8.5](https://www.github.com/netlify/build/compare/v9.8.4...v9.8.5) (2021-03-08)

### Bug Fixes

- add dependency error messages for esbuild ([#2361](https://www.github.com/netlify/build/issues/2361))
  ([9df783a](https://www.github.com/netlify/build/commit/9df783ace59371e3ada566e713aaabe05afff733))

### [9.8.4](https://www.github.com/netlify/build/compare/v9.8.3...v9.8.4) (2021-03-05)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.4.0
  ([#2363](https://www.github.com/netlify/build/issues/2363))
  ([2e5286d](https://www.github.com/netlify/build/commit/2e5286d4b68a76d4cc4235c1f8337372521ec3ef))

### [9.8.3](https://www.github.com/netlify/build/compare/v9.8.2...v9.8.3) (2021-03-04)

### Bug Fixes

- fix esbuild error reporting ([#2358](https://www.github.com/netlify/build/issues/2358))
  ([348d43b](https://www.github.com/netlify/build/commit/348d43bda2698dbdbb2a441a08038e48fadf6715))

### [9.8.2](https://www.github.com/netlify/build/compare/v9.8.1...v9.8.2) (2021-03-04)

### Bug Fixes

- **deps:** update dependency @netlify/plugins-list to ^2.3.0
  ([#2356](https://www.github.com/netlify/build/issues/2356))
  ([e4f79e6](https://www.github.com/netlify/build/commit/e4f79e63e786db9e6a511bb4f24297dfc3e0f29d))

### [9.8.1](https://www.github.com/netlify/build/compare/v9.8.0...v9.8.1) (2021-03-04)

### Bug Fixes

- **deps:** update netlify packages ([#2352](https://www.github.com/netlify/build/issues/2352))
  ([c45bdc8](https://www.github.com/netlify/build/commit/c45bdc8e6165751b4294993426ff32e366f0c55a))

## [9.8.0](https://www.github.com/netlify/build/compare/v9.7.1...v9.8.0) (2021-03-04)

### Features

- stop printing output from esbuild ([#2350](https://www.github.com/netlify/build/issues/2350))
  ([d225592](https://www.github.com/netlify/build/commit/d225592203a0ebdd8e48ad54ed9da5087991f888))

### [9.7.1](https://www.github.com/netlify/build/compare/v9.7.0...v9.7.1) (2021-03-03)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.4.3
  ([#2346](https://www.github.com/netlify/build/issues/2346))
  ([76607df](https://www.github.com/netlify/build/commit/76607dff6de5594d2ebbabfb824737d2ce92e902))

## [9.7.0](https://www.github.com/netlify/build/compare/v9.6.0...v9.7.0) (2021-03-03)

### Features

- add `compatibility[*].siteDependencies` ([#2322](https://www.github.com/netlify/build/issues/2322))
  ([9b1bc5d](https://www.github.com/netlify/build/commit/9b1bc5d4883a5301803cc69f863f1491e92857ed))
- do not sort `compatibility` field ([#2336](https://www.github.com/netlify/build/issues/2336))
  ([455477f](https://www.github.com/netlify/build/commit/455477fc4af7b9d720588d4e4b601e388303a15b))
- improve `migrationGuide` test ([#2337](https://www.github.com/netlify/build/issues/2337))
  ([9776923](https://www.github.com/netlify/build/commit/9776923855ae0baa767ac92ae39786ce77d3e92b))

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.4.2
  ([#2341](https://www.github.com/netlify/build/issues/2341))
  ([cbba54d](https://www.github.com/netlify/build/commit/cbba54dea815e61fe40e048de664035fd06df36d))

## [9.6.0](https://www.github.com/netlify/build/compare/build-v9.5.0...v9.6.0) (2021-03-01)

### Features

- improve tests related to `compatibility` ([#2321](https://www.github.com/netlify/build/issues/2321))
  ([a5bfb6b](https://www.github.com/netlify/build/commit/a5bfb6b526a4155c5d6f912b03dfff845f5cb4ab))
- print migration guides ([#2320](https://www.github.com/netlify/build/issues/2320))
  ([a701222](https://www.github.com/netlify/build/commit/a7012223a0e45373cfbdb278180c88a7971324a5))

## [9.5.0](https://www.github.com/netlify/build/compare/v9.4.0...v9.5.0) (2021-02-26)

### Features

- add `compatibility[*].nodeVersion` ([#2315](https://www.github.com/netlify/build/issues/2315))
  ([8df8c34](https://www.github.com/netlify/build/commit/8df8c3481b8b7009e4ed367844106913463dd0a0))
- add feature flag for esbuild rollout ([#2308](https://www.github.com/netlify/build/issues/2308))
  ([eef6428](https://www.github.com/netlify/build/commit/eef64288fed481c6940dc86fec5a61cbd953d5de))
- print warnings when using `compatibility` versions ([#2319](https://www.github.com/netlify/build/issues/2319))
  ([9beea68](https://www.github.com/netlify/build/commit/9beea68ad168a454b214a149a466d71fe403b74a))
- turn `compatibility` field into an array ([#2318](https://www.github.com/netlify/build/issues/2318))
  ([77243ef](https://www.github.com/netlify/build/commit/77243efaf93924501d2e986267b3b53aa5475153))

### [9.4.0](https://www.github.com/netlify/build/compare/v9.3.0...v9.4.0) (2021-02-25)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to ^2.4.0
  ([#2312](https://www.github.com/netlify/build/issues/2312))
  ([1dbf0a1](https://www.github.com/netlify/build/commit/1dbf0a1463e33fee4a69e90fbf5d128bfdc22081))

## [9.3.0](https://www.github.com/netlify/build/compare/v9.2.0...v9.3.0) (2021-02-25)

### Features

- add `plugin.compatibility` field ([#2310](https://www.github.com/netlify/build/issues/2310))
  ([80525cb](https://www.github.com/netlify/build/commit/80525cbbc8ba38fc46daad0d40703d5a69c27dbc))
- allow `version` in `plugins.json` to be an object ([#2307](https://www.github.com/netlify/build/issues/2307))
  ([ce56878](https://www.github.com/netlify/build/commit/ce5687804759539ec43840089822fb9629fbc1fd))
- move where the plugin Node.js version is resolved ([#2311](https://www.github.com/netlify/build/issues/2311))
  ([5ada384](https://www.github.com/netlify/build/commit/5ada384d644661dca9b481d91b7f829acc9b7b00))

## [9.2.0](https://www.github.com/netlify/build/compare/v9.1.4...v9.2.0) (2021-02-23)

### Features

- print warnings for outdated plugins ([#2289](https://www.github.com/netlify/build/issues/2289))
  ([d8fb63d](https://www.github.com/netlify/build/commit/d8fb63d73881ba5ae2e21961f07ce8e3228e7382))

### [9.1.4](https://www.github.com/netlify/build/compare/v9.1.3...v9.1.4) (2021-02-22)

### Bug Fixes

- **deps:** update netlify packages ([#2302](https://www.github.com/netlify/build/issues/2302))
  ([dbbbeea](https://www.github.com/netlify/build/commit/dbbbeea693c2353d8014a3a74d6b69abfabcebe2))

### [9.1.3](https://www.github.com/netlify/build/compare/v9.1.2...v9.1.3) (2021-02-18)

### Bug Fixes

- fix `files` in `package.json` with `npm@7` ([#2278](https://www.github.com/netlify/build/issues/2278))
  ([e9df064](https://www.github.com/netlify/build/commit/e9df0645f3083a0bb141c8b5b6e474ed4e27dbe9))

### [9.1.2](https://www.github.com/netlify/build/compare/v9.1.1...v9.1.2) (2021-02-11)

### Bug Fixes

- improve Bugsnag reporting of upload errors ([#2267](https://www.github.com/netlify/build/issues/2267))
  ([c03985c](https://www.github.com/netlify/build/commit/c03985c83ff0f426f59a85a42f039e0522bc83d5))

### [9.1.1](https://www.github.com/netlify/build/compare/v9.1.0...v9.1.1) (2021-02-10)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v2.3.0
  ([#2264](https://www.github.com/netlify/build/issues/2264))
  ([40d122d](https://www.github.com/netlify/build/commit/40d122d6e722e55f1925f4179999d0d7ad065999))

## [9.1.0](https://www.github.com/netlify/build/compare/v9.0.1...v9.1.0) (2021-02-09)

### Features

- pass esbuild parameters to ZISI ([#2256](https://www.github.com/netlify/build/issues/2256))
  ([2483f72](https://www.github.com/netlify/build/commit/2483f72660ac2306fd817b6fa330e28e6709dfbb))

### [9.0.1](https://www.github.com/netlify/build/compare/v9.0.0...v9.0.1) (2021-02-09)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v2.2.0
  ([#2258](https://www.github.com/netlify/build/issues/2258))
  ([6faf36b](https://www.github.com/netlify/build/commit/6faf36b24d66f88f93dc96d0190a80af459ad5f4))

## [9.0.0](https://www.github.com/netlify/build/compare/v8.4.0...v9.0.0) (2021-02-04)

### ⚠ BREAKING CHANGES

- use netlify/functions as the default functions directory (#2188)

### Features

- use netlify/functions as the default functions directory ([#2188](https://www.github.com/netlify/build/issues/2188))
  ([84e1e07](https://www.github.com/netlify/build/commit/84e1e075b5efd7ca26ccaf2531511e7737d97f1f))

## [8.4.0](https://www.github.com/netlify/build/compare/v8.3.5...v8.4.0) (2021-02-03)

### Features

- remove deploy feature flag ([#2246](https://www.github.com/netlify/build/issues/2246))
  ([cbeac56](https://www.github.com/netlify/build/commit/cbeac5653c924265a61d84485e41c0e76427db31))

### [8.3.5](https://www.github.com/netlify/build/compare/v8.3.4...v8.3.5) (2021-02-03)

### Bug Fixes

- **deps:** force a release for [#2244](https://www.github.com/netlify/build/issues/2244) and bump zip-it-and-ship-it
  ([#2245](https://www.github.com/netlify/build/issues/2245))
  ([25787c2](https://www.github.com/netlify/build/commit/25787c2cf134fbbd8029a142512ff314cbab1951))

### [8.3.4](https://www.github.com/netlify/build/compare/v8.3.3...v8.3.4) (2021-02-01)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to v1.11.3
  ([#2235](https://www.github.com/netlify/build/issues/2235))
  ([27e2a7f](https://www.github.com/netlify/build/commit/27e2a7faf95262198ec1ae9ad2e1c14f5b5b5561))
- **deps:** update dependency moize to v6 ([#2231](https://www.github.com/netlify/build/issues/2231))
  ([e34454c](https://www.github.com/netlify/build/commit/e34454c633bbc541c4074bdaa15361c84f0c8f04))

### [8.3.3](https://www.github.com/netlify/build/compare/v8.3.2...v8.3.3) (2021-01-29)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.3
  ([#2227](https://www.github.com/netlify/build/issues/2227))
  ([301fe88](https://www.github.com/netlify/build/commit/301fe885ed1a896e7b0766fcc85386510ff9f670))

### [8.3.2](https://www.github.com/netlify/build/compare/v8.3.1...v8.3.2) (2021-01-29)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.2
  ([#2222](https://www.github.com/netlify/build/issues/2222))
  ([47adf7a](https://www.github.com/netlify/build/commit/47adf7af089f308b9abe7709675bc84b8f179809))

### [8.3.1](https://www.github.com/netlify/build/compare/v8.3.0...v8.3.1) (2021-01-26)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.1
  ([#2215](https://www.github.com/netlify/build/issues/2215))
  ([f6e191e](https://www.github.com/netlify/build/commit/f6e191edbb3bf43ac1b9d75b7e0ab62fabd2062f))

## [8.3.0](https://www.github.com/netlify/build/compare/v8.2.0...v8.3.0) (2021-01-26)

### Features

- add back `process.env` plugins communication ([#2212](https://www.github.com/netlify/build/issues/2212))
  ([d815ef9](https://www.github.com/netlify/build/commit/d815ef9cfb68af90691f705b0c21abb7415fd5b9))

## [8.2.0](https://www.github.com/netlify/build/compare/v8.1.1...v8.2.0) (2021-01-25)

### Features

- run deploy logic as core instead of plugin ([#2192](https://www.github.com/netlify/build/issues/2192))
  ([157767b](https://www.github.com/netlify/build/commit/157767b9e5e3857344efd16def9495e7d8bff939))

### [8.1.1](https://www.github.com/netlify/build/compare/build-v8.1.0...v8.1.1) (2021-01-25)

### Bug Fixes

- **deps:** update dependency @netlify/zip-it-and-ship-it to v2.1.0
  ([#2197](https://www.github.com/netlify/build/issues/2197))
  ([8ed28f9](https://www.github.com/netlify/build/commit/8ed28f9ccbe991f98cf8dcf2acde4c19f01c246d))

### [8.0.6](https://www.github.com/netlify/build/compare/build-v8.0.5...v8.0.6) (2021-01-15)

### Bug Fixes

- **deps:** update dependency @netlify/plugin-edge-handlers to v1.11.1
  ([#2178](https://www.github.com/netlify/build/issues/2178))
  ([5941943](https://www.github.com/netlify/build/commit/594194390aae7e43b21e437ddd735ed9b0df55e1))
- **windows:** show windows path separator in netlify dir warning message
  ([#2182](https://www.github.com/netlify/build/issues/2182))
  ([02b497f](https://www.github.com/netlify/build/commit/02b497fb75a1d3b4c3d10df4cbc3c137c711b5bd))
