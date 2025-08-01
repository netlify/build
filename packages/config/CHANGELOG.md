# Changelog

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^12.0.1 to ^12.0.2
    * netlify-headers-parser bumped from ^6.0.2 to ^6.0.3
    * netlify-redirect-parser bumped from 13.0.5 to ^13.0.6

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^12.0.2 to ^12.0.3

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify-redirect-parser bumped from ^14.0.0 to ^14.0.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify-headers-parser bumped from ^7.0.0 to ^7.0.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify-headers-parser bumped from ^7.0.2 to ^7.0.3

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.0 to ^13.1.1
    * netlify-headers-parser bumped from ^7.1.0 to ^7.1.1
    * netlify-redirect-parser bumped from ^14.1.0 to ^14.1.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.1 to ^13.1.2

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.2 to ^13.1.3

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.3 to ^13.1.4

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.4 to ^13.1.5

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.6 to ^13.1.7

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.8 to ^13.1.9

## [24.0.1](https://github.com/netlify/build/compare/config-v24.0.0...config-v24.0.1) (2025-07-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/redirect-parser bumped from ^15.0.2 to ^15.0.3

## [24.0.0](https://github.com/netlify/build/compare/config-v23.2.0...config-v24.0.0) (2025-07-28)


### ⚠ BREAKING CHANGES

* **build,config:** rework extension development workflow ([#6571](https://github.com/netlify/build/issues/6571))

### Features

* **build,config:** rework extension development workflow ([#6571](https://github.com/netlify/build/issues/6571)) ([b31aa6a](https://github.com/netlify/build/commit/b31aa6adc676530e80211d28901abc51591dba36))

## [23.2.0](https://github.com/netlify/build/compare/config-v23.1.0...config-v23.2.0) (2025-07-14)


### Features

* add support for EF `header` property in `netlify.toml` ([#6558](https://github.com/netlify/build/issues/6558)) ([55857bb](https://github.com/netlify/build/commit/55857bbd7665555519ddb2b09340f1fbeb9453b4))

## [23.1.0](https://github.com/netlify/build/compare/config-v23.0.11...config-v23.1.0) (2025-07-07)


### Features

* add header to installing extension with the build mode so we know where the installation is coming from ([#6478](https://github.com/netlify/build/issues/6478)) ([ca66176](https://github.com/netlify/build/commit/ca661760594a24f979457fa001c2db98213d259f))


### Bug Fixes

* put exports back to normal for config ([#6528](https://github.com/netlify/build/issues/6528)) ([db1435c](https://github.com/netlify/build/commit/db1435c471b7fcc26b07a1de7c485f30866a1fc9))

## [23.0.11](https://github.com/netlify/build/compare/config-v23.0.10...config-v23.0.11) (2025-06-25)


### Bug Fixes

* replace js-yaml with yaml package ([#6469](https://github.com/netlify/build/issues/6469)) ([1628170](https://github.com/netlify/build/commit/1628170df6afa98352901c98f2e0a1587d24c9bc))
* use auto_install_required_extensions_v2 instead of auto_install_required_extensions ([#6477](https://github.com/netlify/build/issues/6477)) ([78b7da5](https://github.com/netlify/build/commit/78b7da5dd5b31898b2a25d16eb1008f5fdb27e36))

## [23.0.10](https://github.com/netlify/build/compare/config-v23.0.9...config-v23.0.10) (2025-06-05)


### Bug Fixes

* only log auto install extension errors with debug flag ([#6436](https://github.com/netlify/build/issues/6436)) ([0add4c5](https://github.com/netlify/build/commit/0add4c58344779bf0ba68e239227bf1b307dc073))

## [23.0.9](https://github.com/netlify/build/compare/config-v23.0.8...config-v23.0.9) (2025-06-05)


### Bug Fixes

* auto-install extension filtering logic and add comprehensive tests ([#6434](https://github.com/netlify/build/issues/6434)) ([0296018](https://github.com/netlify/build/commit/02960186990ad54ea1f15f83322696d9807e92ed))

## [23.0.8](https://github.com/netlify/build/compare/config-v23.0.7...config-v23.0.8) (2025-05-29)


### Bug Fixes

* **deps:** update dependency validate-npm-package-name to v5 ([#6389](https://github.com/netlify/build/issues/6389)) ([6871865](https://github.com/netlify/build/commit/687186542bf6b75ed25d715313470bf66815bad5))
* upgrade @types/node to v18 ([#6400](https://github.com/netlify/build/issues/6400)) ([efcc052](https://github.com/netlify/build/commit/efcc052daf4eeb57392e76f1e971422158ec5fab))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/api bumped from ^14.0.2 to ^14.0.3
    * @netlify/headers-parser bumped from ^9.0.0 to ^9.0.1
    * @netlify/redirect-parser bumped from ^15.0.1 to ^15.0.2

## [23.0.7](https://github.com/netlify/build/compare/config-v23.0.6...config-v23.0.7) (2025-05-26)


### Bug Fixes

* **config:** auto install required extensions in buildbot ([#6386](https://github.com/netlify/build/issues/6386)) ([d4b2046](https://github.com/netlify/build/commit/d4b204638b0dd9a325632f0273caa962b005c022))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/api bumped from ^14.0.1 to ^14.0.2

## [23.0.6](https://github.com/netlify/build/compare/config-v23.0.5...config-v23.0.6) (2025-05-23)


### Bug Fixes

* drop node-fetch from config package ([#6380](https://github.com/netlify/build/issues/6380)) ([c88f8d3](https://github.com/netlify/build/commit/c88f8d3635633ff1445af8054693f94c07e59065))

## [23.0.5](https://github.com/netlify/build/compare/config-v23.0.4...config-v23.0.5) (2025-05-22)


### Bug Fixes

* **config:** add more logging for `auto_install_required_extensions` feature flag ([#6372](https://github.com/netlify/build/issues/6372)) ([7974d26](https://github.com/netlify/build/commit/7974d266633e300c8d43ec57a55c346ebfa08a05))

## [23.0.4](https://github.com/netlify/build/compare/config-v23.0.3...config-v23.0.4) (2025-05-22)


### Bug Fixes

* **deps:** update dependency path-type to v6 ([#6358](https://github.com/netlify/build/issues/6358)) ([77557fe](https://github.com/netlify/build/commit/77557fe197c20d1d5597a8c70d92944f22515293))

## [23.0.3](https://github.com/netlify/build/compare/config-v23.0.2...config-v23.0.3) (2025-05-21)


### Bug Fixes

* **deps:** update dependency figures to v6 ([#6339](https://github.com/netlify/build/issues/6339)) ([8936cee](https://github.com/netlify/build/commit/8936cee7a6c7619f2e8ea6e3e0bf9de52e5ded04))
* **deps:** update dependency filter-obj to v6 ([#6340](https://github.com/netlify/build/issues/6340)) ([cad4c01](https://github.com/netlify/build/commit/cad4c01213811d8663e1b137da522a0380f01254))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/redirect-parser bumped from ^15.0.0 to ^15.0.1

## [23.0.2](https://github.com/netlify/build/compare/config-v23.0.1...config-v23.0.2) (2025-05-20)


### Bug Fixes

* **deps:** update dependency dot-prop to v9 ([#6338](https://github.com/netlify/build/issues/6338)) ([b6622a8](https://github.com/netlify/build/commit/b6622a8404dbf391a8024a9c82abb4f16af41f38))
* **deps:** update dependency find-up to v7 ([#6341](https://github.com/netlify/build/issues/6341)) ([49aca1a](https://github.com/netlify/build/commit/49aca1a6917aba7d7bed963a8c7f313d5dd39838))
* **deps:** upgrade execa to v8 ([#6301](https://github.com/netlify/build/issues/6301)) ([1f93c17](https://github.com/netlify/build/commit/1f93c179b7f48c5141456f1645156cd6b3909e3b))

## [23.0.1](https://github.com/netlify/build/compare/config-v23.0.0...config-v23.0.1) (2025-05-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/api bumped from ^14.0.0 to ^14.0.1

## [23.0.0](https://github.com/netlify/build/compare/config-v22.2.0...config-v23.0.0) (2025-05-14)


### ⚠ BREAKING CHANGES

* end of support for v14 and v16 ([#6223](https://github.com/netlify/build/issues/6223))

### Features

* end of support for v14 and v16 ([#6223](https://github.com/netlify/build/issues/6223)) ([9917ef4](https://github.com/netlify/build/commit/9917ef4eb0bd47162e33aa432be7c9fa3fa462c4))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/api bumped from ^13.4.0 to ^14.0.0
    * @netlify/headers-parser bumped from ^8.0.0 to ^9.0.0
    * @netlify/redirect-parser bumped from ^14.5.1 to ^15.0.0

## [22.2.0](https://github.com/netlify/build/compare/config-v22.1.0...config-v22.2.0) (2025-05-12)


### Features

* **config:** handle auto installable extensions ([#6284](https://github.com/netlify/build/issues/6284)) ([dfab3a3](https://github.com/netlify/build/commit/dfab3a3fca69870143d17bb3e3610e49b62c0bd3))

## [22.1.0](https://github.com/netlify/build/compare/config-v22.0.1...config-v22.1.0) (2025-05-09)


### Features

* rename API package to `@netlify/api` ([#6247](https://github.com/netlify/build/issues/6247)) ([27ddc1b](https://github.com/netlify/build/commit/27ddc1b91d3d66780166483b42a0f6efddaa14ea))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/api bumped from ^13.3.5 to ^13.4.0

## [22.0.1](https://github.com/netlify/build/compare/config-v22.0.0...config-v22.0.1) (2025-04-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.3.4 to ^13.3.5

## [22.0.0](https://github.com/netlify/build/compare/config-v21.0.7...config-v22.0.0) (2025-04-10)


### ⚠ BREAKING CHANGES

* remove addons ([#6193](https://github.com/netlify/build/issues/6193))

### Bug Fixes

* remove addons ([#6193](https://github.com/netlify/build/issues/6193)) ([c4f7caa](https://github.com/netlify/build/commit/c4f7caa2d21380f5d1f6cc8159aa0783dccd137a))

## [21.0.7](https://github.com/netlify/build/compare/config-v21.0.6...config-v21.0.7) (2025-04-08)


### Bug Fixes

* remove getAvailableIntegrations and start using the other call we already do ([#6144](https://github.com/netlify/build/issues/6144)) ([50b7492](https://github.com/netlify/build/commit/50b749204d942aba16ff52024a7db4320f2a4ee3))


### Performance Improvements

* **config:** use minimal accounts query when resolving configuration ([#6184](https://github.com/netlify/build/issues/6184)) ([3887115](https://github.com/netlify/build/commit/3887115f3988fa1a943175c1d08b6af5257acbad))

## [21.0.6](https://github.com/netlify/build/compare/config-v21.0.5...config-v21.0.6) (2025-04-01)


### Bug Fixes

* ensure extension api is always called with the right host ([#6168](https://github.com/netlify/build/issues/6168)) ([6b34ebf](https://github.com/netlify/build/commit/6b34ebf300dc45606cf787e7127b5b376b69e574))

## [21.0.5](https://github.com/netlify/build/compare/config-v21.0.4...config-v21.0.5) (2025-03-28)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.3.3 to ^13.3.4

## [21.0.4](https://github.com/netlify/build/compare/config-v21.0.3...config-v21.0.4) (2025-03-24)


### Bug Fixes

* add logging for get site info usage ([#6156](https://github.com/netlify/build/issues/6156)) ([61dc49b](https://github.com/netlify/build/commit/61dc49beb816a45702ee480f939a7d1ed49aed9f))

## [21.0.3](https://github.com/netlify/build/compare/config-v21.0.2...config-v21.0.3) (2025-03-21)


### Bug Fixes

* account envs not showing up in site build ([#6122](https://github.com/netlify/build/issues/6122)) ([f91761a](https://github.com/netlify/build/commit/f91761a7cbb87ba1069dc42faaca95f55a9235e7))
* reduce the usage of getSiteInfo if we already have a cachedConfig ([#6154](https://github.com/netlify/build/issues/6154)) ([0ce31e2](https://github.com/netlify/build/commit/0ce31e230d48ea38007ce31f58cb34f01bb21274))

## [21.0.2](https://github.com/netlify/build/compare/config-v21.0.1...config-v21.0.2) (2025-03-19)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/redirect-parser bumped from ^14.5.0 to ^14.5.1

## [21.0.1](https://github.com/netlify/build/compare/config-v21.0.0...config-v21.0.1) (2025-03-18)


### Bug Fixes

* use staging url for extensions on staging ([#6140](https://github.com/netlify/build/issues/6140)) ([978b3c3](https://github.com/netlify/build/commit/978b3c394ec442efe23610ef8313c4820e8d40fa))

## [21.0.0](https://github.com/netlify/build/compare/config-v20.22.0...config-v21.0.0) (2025-03-12)


### ⚠ BREAKING CHANGES

* **types:** fix `@netlify/headers-parser` types ([#6104](https://github.com/netlify/build/issues/6104))

### Bug Fixes

* **types:** fix `@netlify/headers-parser` types ([#6104](https://github.com/netlify/build/issues/6104)) ([bc5e35a](https://github.com/netlify/build/commit/bc5e35a661521e46711c4a1b166e698703849188))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/headers-parser bumped from ^7.3.0 to ^8.0.0

## [20.22.0](https://github.com/netlify/build/compare/config-v20.21.7...config-v20.22.0) (2025-02-24)


### Features

* allow jigsaw to be called with the build bot token ([#6096](https://github.com/netlify/build/issues/6096)) ([7a2525f](https://github.com/netlify/build/commit/7a2525f99019af3476f55070d422eb776d9902b8))

## [20.21.7](https://github.com/netlify/build/compare/config-v20.21.6...config-v20.21.7) (2025-01-27)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.3.2 to ^13.3.3

## [20.21.6](https://github.com/netlify/build/compare/config-v20.21.5...config-v20.21.6) (2025-01-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.3.1 to ^13.3.2

## [20.21.5](https://github.com/netlify/build/compare/config-v20.21.4...config-v20.21.5) (2025-01-16)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.3.0 to ^13.3.1

## [20.21.4](https://github.com/netlify/build/compare/config-v20.21.3...config-v20.21.4) (2025-01-15)


### Bug Fixes

* **config:** fail builds if failed to fetch extensions ([#6008](https://github.com/netlify/build/issues/6008)) ([95c4716](https://github.com/netlify/build/commit/95c471627fa363e547477ecb6afafc73326d43cb))

## [20.21.3](https://github.com/netlify/build/compare/config-v20.21.2...config-v20.21.3) (2025-01-15)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.2.1 to ^13.3.0

## [20.21.2](https://github.com/netlify/build/compare/config-v20.21.1...config-v20.21.2) (2025-01-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.2.0 to ^13.2.1

## [20.21.1](https://github.com/netlify/build/compare/config-v20.21.0...config-v20.21.1) (2024-12-19)


### Bug Fixes

* Revert 5915 yj/fail builds if extension fail to load ([#5955](https://github.com/netlify/build/issues/5955)) ([d3965d5](https://github.com/netlify/build/commit/d3965d50a47faa397196a594f91e48345dde46ad))

## [20.21.0](https://github.com/netlify/build/compare/config-v20.20.0...config-v20.21.0) (2024-12-14)


### Features

* **build:** Add trace attribute to track builds failing from Netlify maintained extensions ([#5914](https://github.com/netlify/build/issues/5914)) ([7e99c26](https://github.com/netlify/build/commit/7e99c263f1f47d0982c0a6ee3053163d43980844))
* rename unscoped NPM packages ([#5943](https://github.com/netlify/build/issues/5943)) ([131a644](https://github.com/netlify/build/commit/131a644bfde5205f730f3369b778d8914c7c0382))


### Bug Fixes

* fail build when extension failed to be retrieved ([#5915](https://github.com/netlify/build/issues/5915)) ([20c7359](https://github.com/netlify/build/commit/20c73593deda6fc4a570fc7b71178687a693e03d))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/headers-parser bumped from ^7.2.0 to ^7.3.0
    * @netlify/redirect-parser bumped from ^14.4.0 to ^14.5.0

## [20.20.0](https://github.com/netlify/build/compare/config-v20.19.1...config-v20.20.0) (2024-12-11)


### Features

* add node 22 to supported versions list ([#5917](https://github.com/netlify/build/issues/5917)) ([5455393](https://github.com/netlify/build/commit/545539369a3f1a0e9d2036df7d41a8bed1df8272))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.21 to ^13.2.0
    * netlify-headers-parser bumped from ^7.1.4 to ^7.2.0
    * netlify-redirect-parser bumped from ^14.3.0 to ^14.4.0

## [20.19.1](https://github.com/netlify/build/compare/config-v20.19.0...config-v20.19.1) (2024-11-15)


### Bug Fixes

* environment variable build context filtering fix  ([#5887](https://github.com/netlify/build/issues/5887)) ([c0ab547](https://github.com/netlify/build/commit/c0ab5479bd533315d39983e50a9c8a1bee5966ff))

## [20.19.0](https://github.com/netlify/build/compare/config-v20.18.0...config-v20.19.0) (2024-08-21)


### Features

* **config:** return account id from config in offline mode ([#5810](https://github.com/netlify/build/issues/5810)) ([e82859d](https://github.com/netlify/build/commit/e82859d247253e2ee54891ade4bbc3d89ef56c1a))


### Bug Fixes

* don't overwrite plugin origin if it exists ([#5793](https://github.com/netlify/build/issues/5793)) ([d5ef407](https://github.com/netlify/build/commit/d5ef4079308264d6175731fd9d3ff1c2ae1e1200))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.20 to ^13.1.21

## [20.18.0](https://github.com/netlify/build/compare/config-v20.17.1...config-v20.18.0) (2024-08-05)


### Features

* use v2 endpoint that has siteid for extensions ([#5792](https://github.com/netlify/build/issues/5792)) ([73c44fe](https://github.com/netlify/build/commit/73c44fe743afe87ef282af2b11924d8e36e547e6))

## [20.17.1](https://github.com/netlify/build/compare/config-v20.17.0...config-v20.17.1) (2024-07-12)


### Bug Fixes

* leverage the internal config inside the getEnv as well ([#5769](https://github.com/netlify/build/issues/5769)) ([5e6ec8a](https://github.com/netlify/build/commit/5e6ec8afb91b494d77822bee88b2a45be07ec531))

## [20.17.0](https://github.com/netlify/build/compare/config-v20.16.0...config-v20.17.0) (2024-07-11)


### Features

* pass default config for resolveUpdatedConfig instead of cached config ([#5761](https://github.com/netlify/build/issues/5761)) ([011ce3a](https://github.com/netlify/build/commit/011ce3ad392f8cc7ff08fd0a0c37bd5fb58e6a5f))

## [20.16.0](https://github.com/netlify/build/compare/config-v20.15.4...config-v20.16.0) (2024-06-27)


### Features

* exclude integration site id from meta request ([#5744](https://github.com/netlify/build/issues/5744)) ([1129823](https://github.com/netlify/build/commit/11298237c60182a723a532b8e17a561e9e62d0ca))

## [20.15.4](https://github.com/netlify/build/compare/config-v20.15.3...config-v20.15.4) (2024-06-24)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.19 to ^13.1.20

## [20.15.3](https://github.com/netlify/build/compare/config-v20.15.2...config-v20.15.3) (2024-06-17)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.18 to ^13.1.19

## [20.15.2](https://github.com/netlify/build/compare/config-v20.15.1...config-v20.15.2) (2024-06-12)


### Bug Fixes

* re-add siteFeatureFlagPrefix ([#5709](https://github.com/netlify/build/issues/5709)) ([055e9a7](https://github.com/netlify/build/commit/055e9a745a5b0071b31a3952fc311454aca7fb72))

## [20.15.1](https://github.com/netlify/build/compare/config-v20.15.0...config-v20.15.1) (2024-06-10)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.17 to ^13.1.18

## [20.15.0](https://github.com/netlify/build/compare/config-v20.14.1...config-v20.15.0) (2024-06-06)


### Features

* add new endpoint that uses flags and accountId ([#5700](https://github.com/netlify/build/issues/5700)) ([07def29](https://github.com/netlify/build/commit/07def2916208d1acf6eee1d24b56547b81222f3a))

## [20.14.1](https://github.com/netlify/build/compare/config-v20.14.0...config-v20.14.1) (2024-06-04)


### Bug Fixes

* [CRE-1203] adds `dev` to config mutable props ([#5695](https://github.com/netlify/build/issues/5695)) ([f560fc1](https://github.com/netlify/build/commit/f560fc18a5f6a2b3fca131706d45bb292923d0c4))

## [20.14.0](https://github.com/netlify/build/compare/config-v20.13.2...config-v20.14.0) (2024-06-03)


### Features

* added dev.processing.html.injections to mutable props [CRE-1203] ([#5692](https://github.com/netlify/build/issues/5692)) ([2ee98a5](https://github.com/netlify/build/commit/2ee98a5daa6c71c800acdb908cfaca25ffc9c6fc))

## [20.13.2](https://github.com/netlify/build/compare/config-v20.13.1...config-v20.13.2) (2024-05-29)


### Bug Fixes

* revert b8899e06a31f5615ef41d8a4ab251bcc96717837 ([#5689](https://github.com/netlify/build/issues/5689)) ([15bec28](https://github.com/netlify/build/commit/15bec2818f0c4dfe07265a2b16d7bec09ce9f01d))

## [20.13.1](https://github.com/netlify/build/compare/config-v20.13.0...config-v20.13.1) (2024-05-29)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.16 to ^13.1.17

## [20.13.0](https://github.com/netlify/build/compare/config-v20.12.6...config-v20.13.0) (2024-05-29)


### Features

* retrieve integration meta data from new endpoint ([#5647](https://github.com/netlify/build/issues/5647)) ([b8899e0](https://github.com/netlify/build/commit/b8899e06a31f5615ef41d8a4ab251bcc96717837))

## [20.12.6](https://github.com/netlify/build/compare/config-v20.12.5...config-v20.12.6) (2024-05-23)


### Bug Fixes

* update config logger ([#5658](https://github.com/netlify/build/issues/5658)) ([bbbba76](https://github.com/netlify/build/commit/bbbba7604f01163a9f790694ddb247d5ea6242f3))

## [20.12.5](https://github.com/netlify/build/compare/config-v20.12.4...config-v20.12.5) (2024-05-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify-redirect-parser bumped from ^14.2.2 to ^14.3.0

## [20.12.4](https://github.com/netlify/build/compare/config-v20.12.3...config-v20.12.4) (2024-05-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.15 to ^13.1.16

## [20.12.3](https://github.com/netlify/build/compare/config-v20.12.2...config-v20.12.3) (2024-04-23)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.14 to ^13.1.15

## [20.12.2](https://github.com/netlify/build/compare/config-v20.12.1...config-v20.12.2) (2024-04-23)


### Bug Fixes

* when fetching env from envelope, pass context ([#5426](https://github.com/netlify/build/issues/5426)) ([8301161](https://github.com/netlify/build/commit/8301161d88d343eb9abbca226cba397a20bc581e))

## [20.12.1](https://github.com/netlify/build/compare/config-v20.12.0...config-v20.12.1) (2024-02-20)


### Bug Fixes

* remove cli_fetch_integrations and cli_fetch_integrations ([#5534](https://github.com/netlify/build/issues/5534)) ([281c12b](https://github.com/netlify/build/commit/281c12ba31de6622cbd3796b3de1f0cff7f256ba))

## [20.12.0](https://github.com/netlify/build/compare/config-v20.11.1...config-v20.12.0) (2024-02-14)


### Features

* initial support for Deploy Configuration API ([#5509](https://github.com/netlify/build/issues/5509)) ([70ef75f](https://github.com/netlify/build/commit/70ef75fa8afbfb84e726bf5e0fd65544e8b46c7a))

## [20.11.1](https://github.com/netlify/build/compare/config-v20.11.0...config-v20.11.1) (2024-02-12)


### Bug Fixes

* switch to @iarna/toml ([#5508](https://github.com/netlify/build/issues/5508)) ([ba81c85](https://github.com/netlify/build/commit/ba81c85aad902380d24fc1722bc65d4feed24b84))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify-headers-parser bumped from ^7.1.3 to ^7.1.4
    * netlify-redirect-parser bumped from ^14.2.1 to ^14.2.2

## [20.11.0](https://github.com/netlify/build/compare/config-v20.10.3...config-v20.11.0) (2024-02-02)


### Features

* allow mutating images field in NetlifyConfig ([#5464](https://github.com/netlify/build/issues/5464)) ([8d33d21](https://github.com/netlify/build/commit/8d33d217c2ee13643d3c8d6818bde01da7217093))

## [20.10.3](https://github.com/netlify/build/compare/config-v20.10.2...config-v20.10.3) (2024-01-31)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.13 to ^13.1.14

## [20.10.2](https://github.com/netlify/build/compare/config-v20.10.1...config-v20.10.2) (2024-01-18)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.12 to ^13.1.13

## [20.10.1](https://github.com/netlify/build/compare/config-v20.10.0...config-v20.10.1) (2024-01-08)


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.11 to ^13.1.12
    * netlify-headers-parser bumped from ^7.1.2 to ^7.1.3
    * netlify-redirect-parser bumped from ^14.2.0 to ^14.2.1

## [20.10.0](https://github.com/netlify/build/compare/config-v20.9.0...config-v20.10.0) (2023-11-14)


### Features

* fetch integrations only when online ([#5380](https://github.com/netlify/build/issues/5380)) ([916a54c](https://github.com/netlify/build/commit/916a54c8b2389ea856b974b92443cbd0e77613f2))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.10 to ^13.1.11

## [20.9.0](https://github.com/netlify/build/compare/config-v20.8.1...config-v20.9.0) (2023-09-13)


### Features

* parse integrations from the config, including local dev support ([#5251](https://github.com/netlify/build/issues/5251)) ([08dbe97](https://github.com/netlify/build/commit/08dbe97b2da5fd5772dff851be59bd56b3f61561))

## [20.8.1](https://github.com/netlify/build/compare/config-v20.8.0...config-v20.8.1) (2023-09-01)


### Bug Fixes

* add ef-method field ([#5270](https://github.com/netlify/build/issues/5270)) ([eb83967](https://github.com/netlify/build/commit/eb839670c9e8410fe8bd58ef93c531f77733c8fd))

## [20.8.0](https://github.com/netlify/build/compare/config-v20.7.0...config-v20.8.0) (2023-08-08)


### Features

* add packagePath property for config ([#5223](https://github.com/netlify/build/issues/5223)) ([4a62bac](https://github.com/netlify/build/commit/4a62baca49747a1cb28eb31002765d8bcfe43ac5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify-redirect-parser bumped from ^14.1.3 to ^14.2.0

## [20.7.0](https://github.com/netlify/build/compare/config-v20.6.4...config-v20.7.0) (2023-08-01)


### Features

* remove tokens related to integrations, improve typings ([#5211](https://github.com/netlify/build/issues/5211)) ([3b13192](https://github.com/netlify/build/commit/3b131924df7e2b898fc72de1de21bde7ae6709fb))

## [20.6.4](https://github.com/netlify/build/compare/config-v20.6.3...config-v20.6.4) (2023-07-19)


### Bug Fixes

* correctly reference env from testOpts to install integrations ([#5193](https://github.com/netlify/build/issues/5193)) ([bda6ff5](https://github.com/netlify/build/commit/bda6ff583e963ebbbe87ec4c78e3608b9c2c2cd8))

## [20.6.3](https://github.com/netlify/build/compare/config-v20.6.2...config-v20.6.3) (2023-07-18)


### Bug Fixes

* pull integrations in buildy botty mode ([#5168](https://github.com/netlify/build/issues/5168)) ([0650bda](https://github.com/netlify/build/commit/0650bda48b6749b14e6026e9d3c1d446b1d85675))

## [20.6.2](https://github.com/netlify/build/compare/config-v20.6.1...config-v20.6.2) (2023-07-17)


### Bug Fixes

* do not allow excluded path and pattern together ([#5142](https://github.com/netlify/build/issues/5142)) ([4c9aefe](https://github.com/netlify/build/commit/4c9aefe0e512abcd44ec963cd37cd8b4afb1aaf8))

## [20.6.1](https://github.com/netlify/build/compare/config-v20.6.0...config-v20.6.1) (2023-07-12)


### Bug Fixes

* references to token in fetch integrations and include some tests ([#5164](https://github.com/netlify/build/issues/5164)) ([9fe7880](https://github.com/netlify/build/commit/9fe78807ebd3e56c6e58e0dd2591a8a0598d6327))

## [20.6.0](https://github.com/netlify/build/compare/config-v20.5.2...config-v20.6.0) (2023-07-12)


### Features

* install integrations alongside plugins ([#5116](https://github.com/netlify/build/issues/5116)) ([8982903](https://github.com/netlify/build/commit/8982903b7724d736c9f9514aed8f6c960c6378ba))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.9 to ^13.1.10

## [20.5.2](https://github.com/netlify/build/compare/config-v20.5.1...config-v20.5.2) (2023-07-06)


### Bug Fixes

* support edge_functions `excludedPath` ([#5135](https://github.com/netlify/build/issues/5135)) ([74edbee](https://github.com/netlify/build/commit/74edbee82cc811f54ec5b47e9db6b17f783dcd30))
* support edge_functions.pattern ([#5136](https://github.com/netlify/build/issues/5136)) ([a04905b](https://github.com/netlify/build/commit/a04905b5fc325824a76b71e9b48e9dc1597548bf))

## [20.5.1](https://github.com/netlify/build/compare/config-v20.5.0...config-v20.5.1) (2023-06-14)


### Bug Fixes

* fix typo ([#5079](https://github.com/netlify/build/issues/5079)) ([620c155](https://github.com/netlify/build/commit/620c155c6d03d1bf9bffa7ad2d3e9084e600922d))

## [20.5.0](https://github.com/netlify/build/compare/config-v20.4.6...config-v20.5.0) (2023-06-14)


### Features

* pass through siteFeatureFlagPrefix to API ([#5076](https://github.com/netlify/build/issues/5076)) ([c68b54f](https://github.com/netlify/build/commit/c68b54fd190d312d235b46768af13add8b6c869d))

## [20.4.5](https://github.com/netlify/build/compare/config-v20.4.4...config-v20.4.5) (2023-06-09)


### Bug Fixes

* **deps:** update dependency filter-obj to v5 ([#4482](https://github.com/netlify/build/issues/4482)) ([24ec285](https://github.com/netlify/build/commit/24ec285a83e189d99d2ac29af2d67ac9ba23efe5))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.7 to ^13.1.8
    * netlify-redirect-parser bumped from ^14.1.2 to ^14.1.3

## [20.4.4](https://github.com/netlify/build/compare/config-v20.4.3...config-v20.4.4) (2023-06-02)


### Bug Fixes

* **config:** ignores an empty config file path ([#5037](https://github.com/netlify/build/issues/5037)) ([4ac2c5b](https://github.com/netlify/build/commit/4ac2c5b1ad10d0fb34aa727cf2bc8deaa6d0ec73))

## [20.4.2](https://github.com/netlify/build/compare/config-v20.4.1...config-v20.4.2) (2023-05-12)


### Bug Fixes

* remove `del` package ([#5006](https://github.com/netlify/build/issues/5006)) ([f2c7df3](https://github.com/netlify/build/commit/f2c7df35019fa8f356ff8c13874760e8fbebc381))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.1.5 to ^13.1.6

## [20.4.0](https://github.com/netlify/build/compare/config-v20.3.7...config-v20.4.0) (2023-04-24)


### Features

* support `none` bundler ([#4981](https://github.com/netlify/build/issues/4981)) ([eaf5191](https://github.com/netlify/build/commit/eaf51912c4d792f85e1fa58b8d56fe7acb475088))

## [20.3.5](https://github.com/netlify/build/compare/config-v20.3.4...config-v20.3.5) (2023-03-13)


### Bug Fixes

* improve grammar and typos in comments ([#4922](https://github.com/netlify/build/issues/4922)) ([2e9d9c0](https://github.com/netlify/build/commit/2e9d9c06134f125aaf17bbbca0937cf43d3abae6))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify-headers-parser bumped from ^7.1.1 to ^7.1.2
    * netlify-redirect-parser bumped from ^14.1.1 to ^14.1.2

## [20.3.4](https://github.com/netlify/build/compare/config-v20.3.3...config-v20.3.4) (2023-03-09)


### Bug Fixes

* expose apply mutation to API surface ([#4932](https://github.com/netlify/build/issues/4932)) ([35c76f7](https://github.com/netlify/build/commit/35c76f7702d93dddcd6493eda463bdfd1a7ce005))

## [20.3.3](https://github.com/netlify/build/compare/config-v20.3.2...config-v20.3.3) (2023-02-09)


### Bug Fixes

* migrate framework-info to TS and vitest and enable more strictness ([#4819](https://github.com/netlify/build/issues/4819)) ([5acb25b](https://github.com/netlify/build/commit/5acb25b3e1e8cd6d5fa85fdb76baea5a34a1131b))

## [20.3.0](https://github.com/netlify/build/compare/config-v20.2.0...config-v20.3.0) (2023-01-03)


### Features

* add `--outputConfigPath` flag ([#4792](https://github.com/netlify/build/issues/4792)) ([2eaf55c](https://github.com/netlify/build/commit/2eaf55cab91b51496f4224fb030c3b5c2ff19cd7))

## [20.2.0](https://github.com/netlify/build/compare/config-v20.1.0...config-v20.2.0) (2022-12-20)


### Features

* add `build.edge_functions_import_map` config property ([#4774](https://github.com/netlify/build/issues/4774)) ([03a9924](https://github.com/netlify/build/commit/03a9924ffef0bcae9136ee43bb3e09d9b9725c2f))
* read import map from `functions.deno_import_map` config property ([#4782](https://github.com/netlify/build/issues/4782)) ([f1d8ebc](https://github.com/netlify/build/commit/f1d8ebc03b95d1e614ce64ad4083c3f7eb420c7b))

## [20.1.0](https://github.com/netlify/build/compare/config-v20.0.2...config-v20.1.0) (2022-12-13)


### Features

* add build system detection ([#4763](https://github.com/netlify/build/issues/4763)) ([73bdb7b](https://github.com/netlify/build/commit/73bdb7bed7347cf6a8c4d729142c322297a0dce8))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.0.2 to ^13.1.0
    * netlify-headers-parser bumped from ^7.0.3 to ^7.1.0
    * netlify-redirect-parser bumped from ^14.0.2 to ^14.1.0

## [20.0.1](https://github.com/netlify/build/compare/config-v20.0.0...config-v20.0.1) (2022-11-17)


### Bug Fixes

* **deps:** update dependency @netlify/edge-bundler to v4.1.0 ([#4696](https://github.com/netlify/build/issues/4696)) ([f7044e0](https://github.com/netlify/build/commit/f7044e013804096dfb61ba0459226ff6d702ddf3))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.0.1 to ^13.0.2
    * netlify-headers-parser bumped from ^7.0.1 to ^7.0.2
    * netlify-redirect-parser bumped from ^14.0.1 to ^14.0.2

## [20.0.0](https://github.com/netlify/build/compare/config-v19.1.2...config-v20.0.0) (2022-11-10)


### ⚠ BREAKING CHANGES

* add `cache` config property to edge functions (#4686)

### Features

* add `cache` config property to edge functions ([#4686](https://github.com/netlify/build/issues/4686)) ([fecf2a1](https://github.com/netlify/build/commit/fecf2a19cdde8edea6aa847107da31c63f13ef60))

## [19.1.0](https://github.com/netlify/build/compare/config-v19.0.2...config-v19.1.0) (2022-10-26)


### Features

* add `mode` property to edge functions config ([#4655](https://github.com/netlify/build/issues/4655)) ([c8078af](https://github.com/netlify/build/commit/c8078af81ab588a7dacebfca9a2bf42c6053ca33))

## [19.0.2](https://github.com/netlify/build/compare/config-v19.0.1...config-v19.0.2) (2022-10-19)


### Bug Fixes

* **build,build-info,config:** enforce yargs version 17.6.0 as prior version do not support ESM ([#4641](https://github.com/netlify/build/issues/4641)) ([80c8558](https://github.com/netlify/build/commit/80c85581bd2bcc4a0dc05f8eeb1ffe77733fdf27))

## [19.0.1](https://github.com/netlify/build/compare/config-v19.0.0...config-v19.0.1) (2022-10-18)


### Bug Fixes

* run tsc -w if user runs ava -w ([#4601](https://github.com/netlify/build/issues/4601)) ([ebcc8a8](https://github.com/netlify/build/commit/ebcc8a86bc5324ab6c5450fbe396073215aaac6c))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^13.0.0 to ^13.0.1

## [19.0.0](https://github.com/netlify/build/compare/config-v18.2.6...config-v19.0.0) (2022-10-11)


### ⚠ BREAKING CHANGES

* drop node 12 support as it already reached EOL (#4599)

### Bug Fixes

* drop node 12 support as it already reached EOL ([#4599](https://github.com/netlify/build/issues/4599)) ([98d0d1e](https://github.com/netlify/build/commit/98d0d1e4db479fb9bb3a529de590f89aef7dd223))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * netlify bumped from ^12.0.3 to ^13.0.0
    * netlify-headers-parser bumped from ^6.0.3 to ^7.0.0
    * netlify-redirect-parser bumped from ^13.0.6 to ^14.0.0

## [18.2.4](https://github.com/netlify/build/compare/config-v18.2.3...config-v18.2.4) (2022-09-26)

### Bug Fixes

- build packages with lerna ([#4524](https://github.com/netlify/build/issues/4524))
  ([f74e385](https://github.com/netlify/build/commit/f74e385ffb7ffe7f3bfd5c3f80edc1b3249ca343))
- lerna caching ([#4533](https://github.com/netlify/build/issues/4533))
  ([4af0e1a](https://github.com/netlify/build/commit/4af0e1a9e0e5851e1d25b4acf41d1c4a98322019))

## [18.2.3](https://github.com/netlify/build/compare/config-v18.2.2...config-v18.2.3) (2022-08-25)

### Bug Fixes

- **deps:** update dependency netlify to ^12.0.1 ([#4467](https://github.com/netlify/build/issues/4467))
  ([44b7009](https://github.com/netlify/build/commit/44b70093f58f65683caf669f45b0ad7232b29571))

## [18.2.2](https://github.com/netlify/build/compare/config-v18.2.1...config-v18.2.2) (2022-08-19)

### Bug Fixes

- don't create context specific redirects ([#4446](https://github.com/netlify/build/issues/4446))
  ([3d6d811](https://github.com/netlify/build/commit/3d6d811f788771f2a2fbd05289f11f8ec27cf389))

## [18.2.1](https://github.com/netlify/build/compare/config-v18.2.0...config-v18.2.1) (2022-08-19)

### Bug Fixes

- null check ([#4454](https://github.com/netlify/build/issues/4454))
  ([355c6d3](https://github.com/netlify/build/commit/355c6d30b6cb2aeb29762450ea0757a556473de6))

## [18.2.0](https://github.com/netlify/build/compare/config-v18.1.4...config-v18.2.0) (2022-08-16)

### Features

- add `onPreDev` and `onDev` events ([#4431](https://github.com/netlify/build/issues/4431))
  ([0f03fee](https://github.com/netlify/build/commit/0f03fee82241223a897e87d9c840909781fed288))

## [18.1.4](https://github.com/netlify/build/compare/config-v18.1.3...config-v18.1.4) (2022-08-12)

### Bug Fixes

- coerce environment variable to string
  ([ffbb164](https://github.com/netlify/build/commit/ffbb164ab7618449f7a0f66b2c5ca0d47ea492b1))
- coerce environment variable to string ([#4413](https://github.com/netlify/build/issues/4413))
  ([ffbb164](https://github.com/netlify/build/commit/ffbb164ab7618449f7a0f66b2c5ca0d47ea492b1))

## [18.1.3](https://github.com/netlify/build/compare/config-v18.1.2...config-v18.1.3) (2022-08-12)

### Bug Fixes

- pass system log to runCoreSteps ([#4429](https://github.com/netlify/build/issues/4429))
  ([9a42605](https://github.com/netlify/build/commit/9a4260543464201210a1cfc143bc6d4411ef2d82))

## [18.1.2](https://github.com/netlify/build/compare/config-v18.1.1...config-v18.1.2) (2022-07-25)

### Bug Fixes

- **deps:** update dependency netlify to ^11.0.4 ([#4383](https://github.com/netlify/build/issues/4383))
  ([0dbd7ba](https://github.com/netlify/build/commit/0dbd7ba6a6e87058078167f5a5e2c4448ebb4b81))
- **deps:** update dependency netlify to v12 ([#4385](https://github.com/netlify/build/issues/4385))
  ([859b754](https://github.com/netlify/build/commit/859b7547ad2365020ca11e08c8366795712c1df5))

## [18.1.1](https://github.com/netlify/build/compare/config-v18.1.0...config-v18.1.1) (2022-06-30)

### Bug Fixes

- return an empty object rather than throwing swallowed error ([#4354](https://github.com/netlify/build/issues/4354))
  ([ef94762](https://github.com/netlify/build/commit/ef94762c1318a9a83b0d6ac78e86108109b7afa4))

## [18.1.0](https://github.com/netlify/build/compare/config-v18.0.2...config-v18.1.0) (2022-06-24)

### Features

- pull environment variables from envelope if a site has opted in
  ([#4329](https://github.com/netlify/build/issues/4329))
  ([adc3e89](https://github.com/netlify/build/commit/adc3e89f2f88f99aafb4644bfe9b083b76cb3253))

## [18.0.2](https://github.com/netlify/build/compare/config-v18.0.1...config-v18.0.2) (2022-06-21)

### Bug Fixes

- **deps:** update dependency netlify to ^11.0.2 ([#4327](https://github.com/netlify/build/issues/4327))
  ([817ad3d](https://github.com/netlify/build/commit/817ad3dda86a2f98504f07dca7f952ee1af85217))

### [18.0.1](https://github.com/netlify/build/compare/config-v18.0.0...config-v18.0.1) (2022-05-19)

### Bug Fixes

- validate edge_functions in config
  ([24c8d27](https://github.com/netlify/build/commit/24c8d27479aec574380fd12ca2d8b578d56da702))
- validate edge_functions in config ([#4291](https://github.com/netlify/build/issues/4291))
  ([24c8d27](https://github.com/netlify/build/commit/24c8d27479aec574380fd12ca2d8b578d56da702))

## [18.0.0](https://github.com/netlify/build/compare/config-v17.0.20...config-v18.0.0) (2022-04-18)

### ⚠ BREAKING CHANGES

- rename Edge Handlers (#4263)

### Features

- rename Edge Handlers ([#4263](https://github.com/netlify/build/issues/4263))
  ([49c2805](https://github.com/netlify/build/commit/49c28057b671aefcc66e76840b44f469aa293ae6))

### [17.0.20](https://github.com/netlify/build/compare/config-v17.0.19...config-v17.0.20) (2022-04-04)

### Bug Fixes

- **deps:** update dependency validate-npm-package-name to v4 ([#4252](https://github.com/netlify/build/issues/4252))
  ([b43b6f4](https://github.com/netlify/build/commit/b43b6f40a016012ff5c818fa94698a800475c81d))

### [17.0.19](https://github.com/netlify/build/compare/config-v17.0.18...config-v17.0.19) (2022-03-23)

### Bug Fixes

- **deps:** update dependency netlify to ^11.0.1 ([#4238](https://github.com/netlify/build/issues/4238))
  ([014cc56](https://github.com/netlify/build/commit/014cc56112c9f8fa2c1246dced7354bac4761ac2))

### [17.0.18](https://github.com/netlify/build/compare/config-v17.0.17...config-v17.0.18) (2022-03-02)

### Bug Fixes

- add deploy-related environment variables to local builds ([#4209](https://github.com/netlify/build/issues/4209))
  ([a1b2133](https://github.com/netlify/build/commit/a1b21332847fc8de15bd45453eaa355347b0820b))

### [17.0.17](https://github.com/netlify/build/compare/config-v17.0.16...config-v17.0.17) (2022-03-02)

### Bug Fixes

- `URL` environment variable in local builds ([#4208](https://github.com/netlify/build/issues/4208))
  ([ca52d08](https://github.com/netlify/build/commit/ca52d08624180be75e1161472c567172e8373151))

### [17.0.16](https://github.com/netlify/build/compare/config-v17.0.15...config-v17.0.16) (2022-02-28)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v13.0.5 ([#4203](https://github.com/netlify/build/issues/4203))
  ([6f8b097](https://github.com/netlify/build/commit/6f8b0973fa3eedc47a3438869df1ecb5de8ff36f))

### [17.0.15](https://github.com/netlify/build/compare/config-v17.0.14...config-v17.0.15) (2022-02-24)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v13.0.4 ([#4177](https://github.com/netlify/build/issues/4177))
  ([cfebc70](https://github.com/netlify/build/commit/cfebc7027eaba58484c4d80e54c6a9c3b65369eb))

### [17.0.14](https://github.com/netlify/build/compare/config-v17.0.13...config-v17.0.14) (2022-02-24)

### Bug Fixes

- pass feature flags to `netlify-redirect-parser` and `netlify-headers-parser`
  ([#4184](https://github.com/netlify/build/issues/4184))
  ([ed87a71](https://github.com/netlify/build/commit/ed87a7174e4c73552a7ba8c8ae08a1075fdd433c))

### [17.0.13](https://github.com/netlify/build/compare/config-v17.0.12...config-v17.0.13) (2022-02-24)

### Bug Fixes

- truncate headers/redirects in logs ([#4183](https://github.com/netlify/build/issues/4183))
  ([2471c49](https://github.com/netlify/build/commit/2471c49ede2aeaaaf4233c42020bc66448af8427))

### [17.0.12](https://github.com/netlify/build/compare/config-v17.0.11...config-v17.0.12) (2022-02-21)

### Bug Fixes

- **config-redirects:** revert 216213fc2f6f5ff9b61c3bb3a71afac7d7099ebf
  ([#4178](https://github.com/netlify/build/issues/4178))
  ([7a7c82a](https://github.com/netlify/build/commit/7a7c82aee6ce2017afba1e5c3faad5678b5f1f85))

### [17.0.11](https://github.com/netlify/build/compare/config-v17.0.10...config-v17.0.11) (2022-02-21)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to ^13.0.3 ([#4173](https://github.com/netlify/build/issues/4173))
  ([f69ba2b](https://github.com/netlify/build/commit/f69ba2ba2074933610cc11889a3acf35a1e36a8b))

### [17.0.10](https://github.com/netlify/build/compare/config-v17.0.9...config-v17.0.10) (2022-02-21)

### Bug Fixes

- truncate long headers and redirects in build logs ([#4172](https://github.com/netlify/build/issues/4172))
  ([216213f](https://github.com/netlify/build/commit/216213fc2f6f5ff9b61c3bb3a71afac7d7099ebf))

### [17.0.9](https://github.com/netlify/build/compare/config-v17.0.8...config-v17.0.9) (2022-02-14)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to ^6.0.2 ([#4155](https://github.com/netlify/build/issues/4155))
  ([1ddeb28](https://github.com/netlify/build/commit/1ddeb2886e9cfd9001dfa91c94271a355d6374ac))

### [17.0.8](https://github.com/netlify/build/compare/config-v17.0.7...config-v17.0.8) (2022-02-10)

### Bug Fixes

- **deps:** update dependency dot-prop to v7 ([#4093](https://github.com/netlify/build/issues/4093))
  ([4ab89f7](https://github.com/netlify/build/commit/4ab89f7717a24ff282d917b5a7d56acd1b4ee369))
- **deps:** update dependency figures to v4 ([#4113](https://github.com/netlify/build/issues/4113))
  ([c472081](https://github.com/netlify/build/commit/c472081f053acdea3f68363c76355c6a9d0f380b))
- **deps:** update dependency find-up to v6 ([#4114](https://github.com/netlify/build/issues/4114))
  ([50c9901](https://github.com/netlify/build/commit/50c990185f002d63e5cb369ca68e7b901466726c))
- **deps:** update dependency indent-string to v5 ([#4116](https://github.com/netlify/build/issues/4116))
  ([7726316](https://github.com/netlify/build/commit/77263163fa3c1019301a3393a04f25311718baed))
- **deps:** update dependency path-type to v5 ([#4123](https://github.com/netlify/build/issues/4123))
  ([c8e6eba](https://github.com/netlify/build/commit/c8e6eba2526c76325fcd20aceac1c073cb4bd37b))

### [17.0.7](https://github.com/netlify/build/compare/config-v17.0.6...config-v17.0.7) (2022-02-08)

### Bug Fixes

- **deps:** update dependency chalk to v5 ([#4092](https://github.com/netlify/build/issues/4092))
  ([332a533](https://github.com/netlify/build/commit/332a5333b30fa01791689f8af080cc38c147cc98))
- **deps:** update dependency execa to v6 ([#4094](https://github.com/netlify/build/issues/4094))
  ([4511447](https://github.com/netlify/build/commit/4511447230ae5b582821b40499ae29d97af0aeae))
- **deps:** update dependency filter-obj to v3 ([#4095](https://github.com/netlify/build/issues/4095))
  ([cf364ea](https://github.com/netlify/build/commit/cf364ea6f4563a0377180ddc47c24621a81423ab))
- **deps:** update dependency is-plain-obj to v4 ([#4117](https://github.com/netlify/build/issues/4117))
  ([14585b0](https://github.com/netlify/build/commit/14585b0089376bfbf04cb9746a23aec4faf925c6))
- **deps:** update dependency map-obj to v5 ([#4120](https://github.com/netlify/build/issues/4120))
  ([179269f](https://github.com/netlify/build/commit/179269ffe3f8747f320c5484ed67254d493d6997))
- **deps:** update dependency netlify to v11 ([#4136](https://github.com/netlify/build/issues/4136))
  ([e26e0ae](https://github.com/netlify/build/commit/e26e0aed973ba68ec9cee6ca5c709848739d1f05))
- **deps:** update dependency netlify-redirect-parser to ^13.0.2 ([#4135](https://github.com/netlify/build/issues/4135))
  ([fc5a2d0](https://github.com/netlify/build/commit/fc5a2d047c431a3266b20c7ebbcdd6a1abca0612))
- **deps:** update dependency p-locate to v6 ([#4101](https://github.com/netlify/build/issues/4101))
  ([fea08d3](https://github.com/netlify/build/commit/fea08d31917c04cfb645f42638a94ebc09a400e3))
- **deps:** update dependency path-exists to v5 ([#4102](https://github.com/netlify/build/issues/4102))
  ([744421d](https://github.com/netlify/build/commit/744421d89d6e773bd96d82d3ceeb561ee5d7f3db))

### [17.0.6](https://github.com/netlify/build/compare/config-v17.0.5...config-v17.0.6) (2022-01-19)

### Bug Fixes

- **deps:** update dependency dot-prop to v6 ([#4057](https://github.com/netlify/build/issues/4057))
  ([fb173c0](https://github.com/netlify/build/commit/fb173c096310fc354867567eff27b4c4cabd0d8b))

### [17.0.5](https://github.com/netlify/build/compare/config-v17.0.4...config-v17.0.5) (2022-01-18)

### Bug Fixes

- upgrade Yargs to v17 ([#4045](https://github.com/netlify/build/issues/4045))
  ([cce8fda](https://github.com/netlify/build/commit/cce8fda7c9eb77bd607c92c1c4d3aa88496ab4d0))

### [17.0.4](https://github.com/netlify/build/compare/config-v17.0.3...config-v17.0.4) (2022-01-17)

### Bug Fixes

- **deps:** update del to v6.0.0 ([#4036](https://github.com/netlify/build/issues/4036))
  ([f5e076c](https://github.com/netlify/build/commit/f5e076c7152aeadcddfa3805548fd160a416d3dc))
- **deps:** update dependency netlify to ^10.1.2 ([#4039](https://github.com/netlify/build/issues/4039))
  ([f337985](https://github.com/netlify/build/commit/f33798590e98efbc7168793cb4f7ae13e4bd4115))
- **deps:** update dependency netlify-headers-parser to ^6.0.1 ([#4044](https://github.com/netlify/build/issues/4044))
  ([8079d17](https://github.com/netlify/build/commit/8079d174caff8d1d6c36b2f9bca010f8a1a90bdd))
- **deps:** update dependency netlify-redirect-parser to ^13.0.1 ([#4043](https://github.com/netlify/build/issues/4043))
  ([4a8d0dc](https://github.com/netlify/build/commit/4a8d0dca58a3c93fbcbe42a6a4185848f893cd26))
- **deps:** update yargs to v16.0.0 ([#4037](https://github.com/netlify/build/issues/4037))
  ([3d1a433](https://github.com/netlify/build/commit/3d1a433a2b8e401a3ede6225465fa25cc82dd553))

### [17.0.3](https://www.github.com/netlify/build/compare/config-v17.0.2...config-v17.0.3) (2022-01-05)

### Bug Fixes

- **deps:** update dependency netlify to ^10.1.1 ([#4001](https://www.github.com/netlify/build/issues/4001))
  ([0779269](https://www.github.com/netlify/build/commit/07792699b2acdf0da28d00c594fe0c0df016994e))

### [17.0.2](https://www.github.com/netlify/build/compare/config-v17.0.1...config-v17.0.2) (2021-12-21)

### Bug Fixes

- **deps:** update dependency netlify to ^10.1.0 ([#3974](https://www.github.com/netlify/build/issues/3974))
  ([e58b818](https://www.github.com/netlify/build/commit/e58b818568f6285b57cec874e257088dbb6d7d05))

### [17.0.1](https://www.github.com/netlify/build/compare/config-v17.0.0...config-v17.0.1) (2021-12-17)

### Bug Fixes

- use static imports with `@netlify/config` ([#3963](https://www.github.com/netlify/build/issues/3963))
  ([1689b7d](https://www.github.com/netlify/build/commit/1689b7d2bb40bc8049ca5675a1f3059ca8289cfa))

## [17.0.0](https://www.github.com/netlify/build/compare/config-v16.0.7...config-v17.0.0) (2021-12-15)

### ⚠ BREAKING CHANGES

- use pure ES modules with `@netlify/config` (#3945)

### Miscellaneous Chores

- use pure ES modules with `@netlify/config` ([#3945](https://www.github.com/netlify/build/issues/3945))
  ([96a2cfd](https://www.github.com/netlify/build/commit/96a2cfd8ea8024c570dad0f74dce4ebaa7b39659))

### [16.0.7](https://www.github.com/netlify/build/compare/config-v16.0.6...config-v16.0.7) (2021-12-02)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to v6 ([#3921](https://www.github.com/netlify/build/issues/3921))
  ([b3b3f3b](https://www.github.com/netlify/build/commit/b3b3f3bb7b3002827bc55a0d84bf4cbd1997d71f))

### [16.0.6](https://www.github.com/netlify/build/compare/config-v16.0.5...config-v16.0.6) (2021-12-02)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v13 ([#3919](https://www.github.com/netlify/build/issues/3919))
  ([ac34875](https://www.github.com/netlify/build/commit/ac348752a1e6b584d0cebd9c34ed2df3d5f8474e))

### [16.0.5](https://www.github.com/netlify/build/compare/config-v16.0.4...config-v16.0.5) (2021-11-30)

### Bug Fixes

- **deps:** update dependency netlify to v10 ([#3905](https://www.github.com/netlify/build/issues/3905))
  ([f4a0e3c](https://www.github.com/netlify/build/commit/f4a0e3cdd8c9d71cdadf3dd3ede8575640ca0b4e))

### [16.0.4](https://www.github.com/netlify/build/compare/config-v16.0.3...config-v16.0.4) (2021-11-25)

### Bug Fixes

- remove @ungap/from-entries ([#3882](https://www.github.com/netlify/build/issues/3882))
  ([56fb539](https://www.github.com/netlify/build/commit/56fb5399ac48a1889ef039318d24e0aef19126f3))
- remove `array-flat-polyfill` ([#3883](https://www.github.com/netlify/build/issues/3883))
  ([a70ee72](https://www.github.com/netlify/build/commit/a70ee72ba481e7ab15da357773ef9033d5b9ddeb))

### [16.0.3](https://www.github.com/netlify/build/compare/config-v16.0.2...config-v16.0.3) (2021-11-25)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to v5 ([#3892](https://www.github.com/netlify/build/issues/3892))
  ([d35a540](https://www.github.com/netlify/build/commit/d35a540e076ad5daff3e69877738a9be02d654c3))

### [16.0.2](https://www.github.com/netlify/build/compare/config-v16.0.1...config-v16.0.2) (2021-11-25)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v12 ([#3890](https://www.github.com/netlify/build/issues/3890))
  ([7858056](https://www.github.com/netlify/build/commit/78580562e6806decec261a4f9e49892d20e0e9e0))

### [16.0.1](https://www.github.com/netlify/build/compare/config-v16.0.0...config-v16.0.1) (2021-11-24)

### Bug Fixes

- **deps:** update dependency netlify to v9 ([#3886](https://www.github.com/netlify/build/issues/3886))
  ([319865e](https://www.github.com/netlify/build/commit/319865e5799d92910c5a16cf8ef4527e0eeb755b))

## [16.0.0](https://www.github.com/netlify/build/compare/config-v15.8.2...config-v16.0.0) (2021-11-24)

### ⚠ BREAKING CHANGES

- drop support for Node 10 (#3873)

### Miscellaneous Chores

- drop support for Node 10 ([#3873](https://www.github.com/netlify/build/issues/3873))
  ([ae8224d](https://www.github.com/netlify/build/commit/ae8224da8bca4f8c216afb6723664eb7095f1e98))

### [15.8.2](https://www.github.com/netlify/build/compare/config-v15.8.1...config-v15.8.2) (2021-11-03)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to ^11.0.3
  ([#3809](https://www.github.com/netlify/build/issues/3809))
  ([5d62189](https://www.github.com/netlify/build/commit/5d621897961f7bb244c25de1e12684e2130b18cb))

### [15.8.1](https://www.github.com/netlify/build/compare/config-v15.8.0...config-v15.8.1) (2021-11-03)

### Bug Fixes

- **deps:** update dependency netlify to ^8.0.4 ([#3800](https://www.github.com/netlify/build/issues/3800))
  ([35e2a2a](https://www.github.com/netlify/build/commit/35e2a2a4cea391f503ab5238bbd97d75957acef1))

## [15.8.0](https://www.github.com/netlify/build/compare/config-v15.7.5...config-v15.8.0) (2021-10-26)

### Features

- pass through functions[].schedule property to ZISI ([#3761](https://www.github.com/netlify/build/issues/3761))
  ([d3ccdc4](https://www.github.com/netlify/build/commit/d3ccdc4b9844a5b0e6397434189007e059b386f7))

### [15.7.5](https://www.github.com/netlify/build/compare/config-v15.7.4...config-v15.7.5) (2021-10-21)

### Bug Fixes

- **deps:** update dependency netlify to ^8.0.3 ([#3757](https://www.github.com/netlify/build/issues/3757))
  ([ab844f6](https://www.github.com/netlify/build/commit/ab844f6d8f799ecba44ac83b342f2f1243188086))

### [15.7.4](https://www.github.com/netlify/build/compare/config-v15.7.3...config-v15.7.4) (2021-10-18)

### Bug Fixes

- fail on invalid backslash sequences in netlify.toml ([#3739](https://www.github.com/netlify/build/issues/3739))
  ([c973688](https://www.github.com/netlify/build/commit/c9736883fa2966d9dcc6a4b9e089a3e7cbc8c53d))

### [15.7.3](https://www.github.com/netlify/build/compare/config-v15.7.2...config-v15.7.3) (2021-10-18)

### Bug Fixes

- **deps:** update dependency netlify to ^8.0.2 ([#3743](https://www.github.com/netlify/build/issues/3743))
  ([a87f848](https://www.github.com/netlify/build/commit/a87f8489d0456ba65c23ddd138767878fc741fe1))

### [15.7.2](https://www.github.com/netlify/build/compare/config-v15.7.1...config-v15.7.2) (2021-10-15)

### Bug Fixes

- force release ([#3738](https://www.github.com/netlify/build/issues/3738))
  ([a8db88d](https://www.github.com/netlify/build/commit/a8db88d31ffdbe97e10657059f67316a8cb4cb68))

### [15.7.1](https://www.github.com/netlify/build/compare/config-v15.7.0...config-v15.7.1) (2021-10-14)

### Bug Fixes

- improve TOML invalid escape sequence detection ([#3723](https://www.github.com/netlify/build/issues/3723))
  ([6d64488](https://www.github.com/netlify/build/commit/6d64488f82f15cc1e3c3864065527d3e2742f6c7))

## [15.7.0](https://www.github.com/netlify/build/compare/config-v15.6.7...config-v15.7.0) (2021-10-13)

### Features

- allow `nft` as a value for `node_bundler` ([#3720](https://www.github.com/netlify/build/issues/3720))
  ([248c69c](https://www.github.com/netlify/build/commit/248c69c838fa2defa366dbb3d4b4c4c7786d6af5))

### [15.6.7](https://www.github.com/netlify/build/compare/config-v15.6.6...config-v15.6.7) (2021-10-11)

### Bug Fixes

- warning message for TOML escape sequences ([#3705](https://www.github.com/netlify/build/issues/3705))
  ([ed16d0d](https://www.github.com/netlify/build/commit/ed16d0d72efc95e112d8d2f90dbac98bde68ff69))

### [15.6.6](https://www.github.com/netlify/build/compare/config-v15.6.5...config-v15.6.6) (2021-10-08)

### Bug Fixes

- escape sequence warning for any type of TOML strings ([#3690](https://www.github.com/netlify/build/issues/3690))
  ([51af554](https://www.github.com/netlify/build/commit/51af554a7d0f57a418c4630f459aa26f037e540c))

### [15.6.5](https://www.github.com/netlify/build/compare/config-v15.6.4...config-v15.6.5) (2021-10-07)

### Bug Fixes

- `@netlify/config` user errors ([#3696](https://www.github.com/netlify/build/issues/3696))
  ([b4c4125](https://www.github.com/netlify/build/commit/b4c4125a46e3ca9176a2b209e054bda9513f5aba))

### [15.6.4](https://www.github.com/netlify/build/compare/config-v15.6.3...config-v15.6.4) (2021-10-04)

### Bug Fixes

- warn when using odd backslash sequences in netlify.toml ([#3677](https://www.github.com/netlify/build/issues/3677))
  ([d3029ac](https://www.github.com/netlify/build/commit/d3029ac8de1e270c2fc2717ed24786506cd112cc))

### [15.6.3](https://www.github.com/netlify/build/compare/config-v15.6.2...config-v15.6.3) (2021-09-21)

### Bug Fixes

- **deps:** update dependency netlify to ^8.0.1 ([#3644](https://www.github.com/netlify/build/issues/3644))
  ([a69f777](https://www.github.com/netlify/build/commit/a69f77791b0910abe98e4fb5fddc220295920363))

### [15.6.2](https://www.github.com/netlify/build/compare/config-v15.6.1...config-v15.6.2) (2021-09-09)

### Bug Fixes

- repository root directory validation ([#3598](https://www.github.com/netlify/build/issues/3598))
  ([57a45fd](https://www.github.com/netlify/build/commit/57a45fd65a9705c95d8b71575bdb5d7b0d7dfed7))

### [15.6.1](https://www.github.com/netlify/build/compare/config-v15.6.0...config-v15.6.1) (2021-09-08)

### Bug Fixes

- monitor whether headers with different cases have the same path
  ([#3594](https://www.github.com/netlify/build/issues/3594))
  ([029ff7d](https://www.github.com/netlify/build/commit/029ff7dd833fcabcb1e28c01443ff6e52267bcd6))

## [15.6.0](https://www.github.com/netlify/build/compare/config-v15.5.2...config-v15.6.0) (2021-09-07)

### Features

- remove `builders` and `buildersDistDir` ([#3581](https://www.github.com/netlify/build/issues/3581))
  ([d27906b](https://www.github.com/netlify/build/commit/d27906bc1390dbeb6ebc64279ce7475d418a8514))

### [15.5.2](https://www.github.com/netlify/build/compare/config-v15.5.1...config-v15.5.2) (2021-09-07)

### Bug Fixes

- add warning message when the same header is used with different cases
  ([#3590](https://www.github.com/netlify/build/issues/3590))
  ([bd4b373](https://www.github.com/netlify/build/commit/bd4b373c34e88821d8bf537933bd26e8674e866c))

### [15.5.1](https://www.github.com/netlify/build/compare/config-v15.5.0...config-v15.5.1) (2021-09-01)

### Bug Fixes

- error handling of syntax errors in plugin configuration changes
  ([#3586](https://www.github.com/netlify/build/issues/3586))
  ([56d902d](https://www.github.com/netlify/build/commit/56d902d88353b5b836ca4124b94532fb744470fc))

## [15.5.0](https://www.github.com/netlify/build/compare/config-v15.4.1...config-v15.5.0) (2021-08-26)

### Features

- add `builders.*` and `builders.directory` configuration properties to `@netlify/config`
  ([#3560](https://www.github.com/netlify/build/issues/3560))
  ([4e9b757](https://www.github.com/netlify/build/commit/4e9b757efcdeec5477cd278ec57feb02dbe49248))

### [15.4.1](https://www.github.com/netlify/build/compare/config-v15.4.0...config-v15.4.1) (2021-08-19)

### Bug Fixes

- remove unused error handlers ([#3510](https://www.github.com/netlify/build/issues/3510))
  ([2beefcd](https://www.github.com/netlify/build/commit/2beefcd6cfdeab7642fe02266828730637d865d8))

## [15.4.0](https://www.github.com/netlify/build/compare/config-v15.3.8...config-v15.4.0) (2021-08-18)

### Features

- **build-id:** add a `build-id` flag and expose `BUILD_ID` based on said flag
  ([#3527](https://www.github.com/netlify/build/issues/3527))
  ([94a4a03](https://www.github.com/netlify/build/commit/94a4a03f337d3c2195f4b4a1912f778893ebf485))

### [15.3.8](https://www.github.com/netlify/build/compare/config-v15.3.7...config-v15.3.8) (2021-08-18)

### Bug Fixes

- duplicate code ([#3526](https://www.github.com/netlify/build/issues/3526))
  ([74e8879](https://www.github.com/netlify/build/commit/74e8879916851be8d22b308008e9d793c15895e8))

### [15.3.7](https://www.github.com/netlify/build/compare/config-v15.3.6...config-v15.3.7) (2021-08-17)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to ^4.0.1
  ([#3521](https://www.github.com/netlify/build/issues/3521))
  ([0aee4c3](https://www.github.com/netlify/build/commit/0aee4c3b360756fe194af259538e653031a9fd20))

### [15.3.6](https://www.github.com/netlify/build/compare/config-v15.3.5...config-v15.3.6) (2021-08-17)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to v4 ([#3518](https://www.github.com/netlify/build/issues/3518))
  ([9b6f234](https://www.github.com/netlify/build/commit/9b6f2349c0ebb3fb4c7c2148274d4120edc39a3a))

### [15.3.5](https://www.github.com/netlify/build/compare/config-v15.3.4...config-v15.3.5) (2021-08-17)

### Bug Fixes

- refactor headers and redirects logic ([#3511](https://www.github.com/netlify/build/issues/3511))
  ([1f026bf](https://www.github.com/netlify/build/commit/1f026bf368a6624ed512af3a6f1b7f216dcbb3b3))

### [15.3.4](https://www.github.com/netlify/build/compare/config-v15.3.3...config-v15.3.4) (2021-08-16)

### Bug Fixes

- **deps:** update dependency is-plain-obj to v3 ([#3489](https://www.github.com/netlify/build/issues/3489))
  ([b353eec](https://www.github.com/netlify/build/commit/b353eece861296ef18de8e19855a6b2e30ac4fba))
- **deps:** update dependency netlify-headers-parser to ^3.0.1
  ([#3508](https://www.github.com/netlify/build/issues/3508))
  ([10dbcf8](https://www.github.com/netlify/build/commit/10dbcf87362eb6045a6adfca81a0e4dd638ef567))
- **deps:** update dependency netlify-redirect-parser to ^11.0.1
  ([#3506](https://www.github.com/netlify/build/issues/3506))
  ([c07443c](https://www.github.com/netlify/build/commit/c07443c1168f6b81fa8cf80eb418eb9b89d22350))
- **deps:** update dependency netlify-redirect-parser to ^11.0.2
  ([#3509](https://www.github.com/netlify/build/issues/3509))
  ([0a412c1](https://www.github.com/netlify/build/commit/0a412c109f9f7ee17596a8d8f546a43c0a54e8c0))

### [15.3.3](https://www.github.com/netlify/build/compare/config-v15.3.2...config-v15.3.3) (2021-08-16)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to v3 ([#3483](https://www.github.com/netlify/build/issues/3483))
  ([4e95d96](https://www.github.com/netlify/build/commit/4e95d96d4466907b5356f46fd4ce278b551e6b91))

### [15.3.2](https://www.github.com/netlify/build/compare/config-v15.3.1...config-v15.3.2) (2021-08-16)

### Bug Fixes

- **deps:** update dependency p-locate to v5 ([#3495](https://www.github.com/netlify/build/issues/3495))
  ([ce07fbc](https://www.github.com/netlify/build/commit/ce07fbccc5e93224e7adab5dc039f9534a49f06b))

### [15.3.1](https://www.github.com/netlify/build/compare/config-v15.3.0...config-v15.3.1) (2021-08-13)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v11 ([#3481](https://www.github.com/netlify/build/issues/3481))
  ([38ecd1d](https://www.github.com/netlify/build/commit/38ecd1d75fa7a9262abe7a989b784ca95ebd0348))

## [15.3.0](https://www.github.com/netlify/build/compare/config-v15.2.0...config-v15.3.0) (2021-08-13)

### Features

- simplify redirects parsing ([#3475](https://www.github.com/netlify/build/issues/3475))
  ([21e33a3](https://www.github.com/netlify/build/commit/21e33a3fde17d5c698c73b16778d3e06ec1cafae))

## [15.2.0](https://www.github.com/netlify/build/compare/config-v15.1.9...config-v15.2.0) (2021-08-13)

### Features

- simplify headers parsing ([#3468](https://www.github.com/netlify/build/issues/3468))
  ([ff601ff](https://www.github.com/netlify/build/commit/ff601ffbabafb0ebe28695b3135d5a922e06a57d))

### [15.1.9](https://www.github.com/netlify/build/compare/config-v15.1.8...config-v15.1.9) (2021-08-13)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to ^10.1.0
  ([#3473](https://www.github.com/netlify/build/issues/3473))
  ([2ac8555](https://www.github.com/netlify/build/commit/2ac85554e455150434a4d5f3ea6b00268deb30c5))

### [15.1.8](https://www.github.com/netlify/build/compare/config-v15.1.7...config-v15.1.8) (2021-08-13)

### Bug Fixes

- **deps:** remove cp-file usage ([#3470](https://www.github.com/netlify/build/issues/3470))
  ([5b98fb4](https://www.github.com/netlify/build/commit/5b98fb494478cc0e7676856ce38f980b406306b9))

### [15.1.7](https://www.github.com/netlify/build/compare/config-v15.1.6...config-v15.1.7) (2021-08-13)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to ^2.1.1
  ([#3462](https://www.github.com/netlify/build/issues/3462))
  ([4a0f19f](https://www.github.com/netlify/build/commit/4a0f19fcbe8ae0ab1a81ccb24897238675350964))

### [15.1.6](https://www.github.com/netlify/build/compare/config-v15.1.5...config-v15.1.6) (2021-08-13)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v10 ([#3460](https://www.github.com/netlify/build/issues/3460))
  ([c9a9ecc](https://www.github.com/netlify/build/commit/c9a9ecc960ca73039d1e28d5f1413fb4f530dbb8))

### [15.1.5](https://www.github.com/netlify/build/compare/config-v15.1.4...config-v15.1.5) (2021-08-13)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to ^2.1.0
  ([#3458](https://www.github.com/netlify/build/issues/3458))
  ([e7665ec](https://www.github.com/netlify/build/commit/e7665ecb7bc1960ca19ba2717a2b2d608ae83bb6))

### [15.1.4](https://www.github.com/netlify/build/compare/config-v15.1.3...config-v15.1.4) (2021-08-13)

### Bug Fixes

- **deps:** update dependency find-up to v5 ([#3455](https://www.github.com/netlify/build/issues/3455))
  ([e540ec2](https://www.github.com/netlify/build/commit/e540ec26863f0cfaba3736bade0ce7b4aecbe36a))

### [15.1.3](https://www.github.com/netlify/build/compare/config-v15.1.2...config-v15.1.3) (2021-08-12)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to v2 ([#3448](https://www.github.com/netlify/build/issues/3448))
  ([3d83dce](https://www.github.com/netlify/build/commit/3d83dce6efa68df5ef090e57958eff6f78c8f065))

### [15.1.2](https://www.github.com/netlify/build/compare/config-v15.1.1...config-v15.1.2) (2021-08-12)

### Bug Fixes

- delete `_redirects`/`_headers` when persisted to `netlify.toml`
  ([#3446](https://www.github.com/netlify/build/issues/3446))
  ([4bdf2cc](https://www.github.com/netlify/build/commit/4bdf2ccb64edae4254a9b7832f46e2cbeeb322eb))

### [15.1.1](https://www.github.com/netlify/build/compare/config-v15.1.0...config-v15.1.1) (2021-08-12)

### Bug Fixes

- **deps:** bump execa to the latest version (5.x) ([#3440](https://www.github.com/netlify/build/issues/3440))
  ([3e8bd01](https://www.github.com/netlify/build/commit/3e8bd019eddca738a664af9590c313dd5fcd20df))

## [15.1.0](https://www.github.com/netlify/build/compare/config-v15.0.5...config-v15.1.0) (2021-08-12)

### Features

- remove headers/redirects duplicate filtering ([#3439](https://www.github.com/netlify/build/issues/3439))
  ([ebc88c1](https://www.github.com/netlify/build/commit/ebc88c12eea2a8f47ee02415e94d7c4e451fb356))

### [15.0.5](https://www.github.com/netlify/build/compare/config-v15.0.4...config-v15.0.5) (2021-08-12)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to ^1.1.1
  ([#3441](https://www.github.com/netlify/build/issues/3441))
  ([04cee44](https://www.github.com/netlify/build/commit/04cee441dc61aa0efff3216d4a66768808a330ed))

### [15.0.4](https://www.github.com/netlify/build/compare/config-v15.0.3...config-v15.0.4) (2021-08-12)

### Bug Fixes

- **deps:** update dependency netlify-headers-parser to ^1.1.0
  ([#3435](https://www.github.com/netlify/build/issues/3435))
  ([26b4e4e](https://www.github.com/netlify/build/commit/26b4e4e8ba4a90b85596eaeee216ee5d6fbc509b))
- **deps:** update dependency netlify-redirect-parser to v9 ([#3436](https://www.github.com/netlify/build/issues/3436))
  ([7efd2dc](https://www.github.com/netlify/build/commit/7efd2dc7b29d837b4452a1510df76b53a3276845))

### [15.0.3](https://www.github.com/netlify/build/compare/config-v15.0.2...config-v15.0.3) (2021-08-12)

### Bug Fixes

- fix how redirects/headers check for duplicates ([#3424](https://www.github.com/netlify/build/issues/3424))
  ([c44f35c](https://www.github.com/netlify/build/commit/c44f35c9562ea42a210ab2f83133b76534543f4d))

### [15.0.2](https://www.github.com/netlify/build/compare/config-v15.0.1...config-v15.0.2) (2021-08-11)

### Bug Fixes

- bump `netlify-headers-parser`
  ([77177fc](https://www.github.com/netlify/build/commit/77177fcbc2668dc829bac8b8325063cc557c7ed1))

### [15.0.1](https://www.github.com/netlify/build/compare/config-v15.0.0...config-v15.0.1) (2021-08-11)

### Bug Fixes

- error handling of headers and redirects ([#3422](https://www.github.com/netlify/build/issues/3422))
  ([add5417](https://www.github.com/netlify/build/commit/add54178e5b046d6ec8d7cc44ac626135a25b9e6))

## [15.0.0](https://www.github.com/netlify/build/compare/config-v14.4.3...config-v15.0.0) (2021-08-11)

### ⚠ BREAKING CHANGES

- add `netlifyConfig.headers` (#3407)

### Features

- add `netlifyConfig.headers` ([#3407](https://www.github.com/netlify/build/issues/3407))
  ([14888c7](https://www.github.com/netlify/build/commit/14888c73278b6c68538ecaa385e5ce01932b7e09))

### [14.4.3](https://www.github.com/netlify/build/compare/config-v14.4.2...config-v14.4.3) (2021-08-05)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to ^8.2.0
  ([#3399](https://www.github.com/netlify/build/issues/3399))
  ([70911c9](https://www.github.com/netlify/build/commit/70911c91729d02475684b179febe9b07e23df293))

### [14.4.2](https://www.github.com/netlify/build/compare/config-v14.4.1...config-v14.4.2) (2021-08-05)

### Bug Fixes

- `redirects[*].status` should not be a float in `netlify.toml`
  ([#3396](https://www.github.com/netlify/build/issues/3396))
  ([1c006ea](https://www.github.com/netlify/build/commit/1c006eae3de54e034dbcd87de5e011b6bfa843e6))

### [14.4.1](https://www.github.com/netlify/build/compare/config-v14.4.0...config-v14.4.1) (2021-08-04)

### Bug Fixes

- persist `build.environment` changes to `netlify.toml` ([#3394](https://www.github.com/netlify/build/issues/3394))
  ([101f99e](https://www.github.com/netlify/build/commit/101f99e0ee65eafc577241711c01e142d6b80444))

## [14.4.0](https://www.github.com/netlify/build/compare/config-v14.3.0...config-v14.4.0) (2021-08-04)

### Features

- allow modifying `build.environment` ([#3389](https://www.github.com/netlify/build/issues/3389))
  ([76d3bc9](https://www.github.com/netlify/build/commit/76d3bc9c77e28cf500ada47289c01d394d6da6db))

## [14.3.0](https://www.github.com/netlify/build/compare/config-v14.2.0...config-v14.3.0) (2021-08-03)

### Features

- improve config simplification ([#3384](https://www.github.com/netlify/build/issues/3384))
  ([b9f7d7a](https://www.github.com/netlify/build/commit/b9f7d7ad1baf063bd3919a16b961007cb94da2e2))

## [14.2.0](https://www.github.com/netlify/build/compare/config-v14.1.1...config-v14.2.0) (2021-08-03)

### Features

- **build:** return config mutations ([#3379](https://www.github.com/netlify/build/issues/3379))
  ([8eb39b5](https://www.github.com/netlify/build/commit/8eb39b5ee3fae124498f87046a7776ad5574e011))

### [14.1.1](https://www.github.com/netlify/build/compare/config-v14.1.0...config-v14.1.1) (2021-08-02)

### Bug Fixes

- **deps:** update dependency chalk to ^4.1.1 ([#3367](https://www.github.com/netlify/build/issues/3367))
  ([dd258ec](https://www.github.com/netlify/build/commit/dd258ecd758824e56b15fc5f6c73a3180ac0af66))

## [14.1.0](https://www.github.com/netlify/build/compare/config-v14.0.0...config-v14.1.0) (2021-07-28)

### Features

- add `NETLIFY_LOCAL` environment variable ([#3351](https://www.github.com/netlify/build/issues/3351))
  ([c3c0716](https://www.github.com/netlify/build/commit/c3c07169ba922010d7233de868a52b6ccd6bcd20))

## [14.0.0](https://www.github.com/netlify/build/compare/config-v13.0.0...config-v14.0.0) (2021-07-26)

### ⚠ BREAKING CHANGES

- deprecate Node 8 (#3322)

### Features

- **plugins:** remove feature flag responsible plugin node version execution changes
  ([#3311](https://www.github.com/netlify/build/issues/3311))
  ([8c94faf](https://www.github.com/netlify/build/commit/8c94faf8d1e7cbf830b1cbc722949198759f9f8c))

### Bug Fixes

- **deps:** update dependency netlify to v8 ([#3338](https://www.github.com/netlify/build/issues/3338))
  ([6912475](https://www.github.com/netlify/build/commit/6912475b307be67dd003df26d0bf28ae21e3d172))

### Miscellaneous Chores

- deprecate Node 8 ([#3322](https://www.github.com/netlify/build/issues/3322))
  ([9cc108a](https://www.github.com/netlify/build/commit/9cc108aab825558204ffef6b8034f456d8d11879))

## [13.0.0](https://www.github.com/netlify/build/compare/config-v12.6.0...config-v13.0.0) (2021-07-16)

### ⚠ BREAKING CHANGES

- change edge-handler default directory (#3296)

### Features

- change edge-handler default directory ([#3296](https://www.github.com/netlify/build/issues/3296))
  ([86b02da](https://www.github.com/netlify/build/commit/86b02dae85bbd879f107606487853ad3cd2fc147))

## [12.6.0](https://www.github.com/netlify/build/compare/config-v12.5.0...config-v12.6.0) (2021-07-08)

### Features

- delete `netlify.toml` after deploy if it was created due to configuration changes
  ([#3271](https://www.github.com/netlify/build/issues/3271))
  ([444087d](https://www.github.com/netlify/build/commit/444087d528a0e8450031eda65cd5877980a5fa70))

## [12.5.0](https://www.github.com/netlify/build/compare/config-v12.4.0...config-v12.5.0) (2021-07-08)

### Features

- simplify the `netlify.toml` being saved on configuration changes
  ([#3268](https://www.github.com/netlify/build/issues/3268))
  ([15987fe](https://www.github.com/netlify/build/commit/15987fe0d869f01110d4d97c8e8395580eb1a9f7))

## [12.4.0](https://www.github.com/netlify/build/compare/config-v12.3.0...config-v12.4.0) (2021-07-08)

### Features

- restore `netlify.toml` and `_redirects` after deploy ([#3265](https://www.github.com/netlify/build/issues/3265))
  ([2441d6a](https://www.github.com/netlify/build/commit/2441d6a8b2be81212384816a0686221d4a6a2577))

## [12.3.0](https://www.github.com/netlify/build/compare/config-v12.2.1...config-v12.3.0) (2021-07-08)

### Features

- fix `_redirects` to `netlify.toml` before deploy ([#3259](https://www.github.com/netlify/build/issues/3259))
  ([e32d076](https://www.github.com/netlify/build/commit/e32d076ab642b8a0df72c96d8726e161b65b182f))

### [12.2.1](https://www.github.com/netlify/build/compare/config-v12.2.0...config-v12.2.1) (2021-07-08)

### Bug Fixes

- allow `netlifyConfig.redirects` to be modified before `_redirects` is added
  ([#3242](https://www.github.com/netlify/build/issues/3242))
  ([f3330a6](https://www.github.com/netlify/build/commit/f3330a685aeb0320e1ac445bbe7a908e7a83dbda))
- **deps:** update dependency netlify-redirect-parser to ^8.1.0
  ([#3246](https://www.github.com/netlify/build/issues/3246))
  ([2f0b9b1](https://www.github.com/netlify/build/commit/2f0b9b1d8350caafee48d38cd05dabf7037a6c20))

## [12.2.0](https://www.github.com/netlify/build/compare/config-v12.1.1...config-v12.2.0) (2021-07-08)

### Features

- add default values for `build.processing` and `build.services`
  ([#3235](https://www.github.com/netlify/build/issues/3235))
  ([2ba263b](https://www.github.com/netlify/build/commit/2ba263ba9ebc54c38410245f021deb906b8a8aa2))

### [12.1.1](https://www.github.com/netlify/build/compare/config-v12.1.0...config-v12.1.1) (2021-07-07)

### Bug Fixes

- return `redirects` with `@netlify/config` ([#3231](https://www.github.com/netlify/build/issues/3231))
  ([be511fa](https://www.github.com/netlify/build/commit/be511fa06e09a6589f06f2943ee06de1062c88ec))

## [12.1.0](https://www.github.com/netlify/build/compare/config-v12.0.1...config-v12.1.0) (2021-07-07)

### Features

- persist configuration changes to `netlify.toml` ([#3224](https://www.github.com/netlify/build/issues/3224))
  ([f924661](https://www.github.com/netlify/build/commit/f924661f94d04af1e90e1023e385e35587ae301c))

### [12.0.1](https://www.github.com/netlify/build/compare/config-v12.0.0...config-v12.0.1) (2021-07-06)

### Bug Fixes

- handle `plugins[*].pinned_version` being an empty string ([#3221](https://www.github.com/netlify/build/issues/3221))
  ([46c43b4](https://www.github.com/netlify/build/commit/46c43b4eca36cd7ad866617e2ce721e45a26abd1))

## [12.0.0](https://www.github.com/netlify/build/compare/config-v11.0.0...config-v12.0.0) (2021-07-06)

### ⚠ BREAKING CHANGES

- return `redirectsPath` from `@netlify/config` (#3207)

### Features

- return `redirectsPath` from `@netlify/config` ([#3207](https://www.github.com/netlify/build/issues/3207))
  ([35dd205](https://www.github.com/netlify/build/commit/35dd205ca35a393dbb3cff50e79ba1cdad8f8755))

## [11.0.0](https://www.github.com/netlify/build/compare/config-v10.3.0...config-v11.0.0) (2021-07-06)

### ⚠ BREAKING CHANGES

- add `configMutations` flag to `@netlify/config` (#3211)

### Features

- add `configMutations` flag to `@netlify/config` ([#3211](https://www.github.com/netlify/build/issues/3211))
  ([9037f03](https://www.github.com/netlify/build/commit/9037f03b6d288d136007f0c2c964c04aed3f33f7))

## [10.3.0](https://www.github.com/netlify/build/compare/config-v10.2.0...config-v10.3.0) (2021-07-05)

### Features

- move some mutation logic to `@netlify/config` ([#3203](https://www.github.com/netlify/build/issues/3203))
  ([9ce4725](https://www.github.com/netlify/build/commit/9ce47250e806379db93528913c298bc57f3d23a6))

## [10.2.0](https://www.github.com/netlify/build/compare/config-v10.1.0...config-v10.2.0) (2021-07-05)

### Features

- fix `context` override for `edge_handlers` ([#3199](https://www.github.com/netlify/build/issues/3199))
  ([54f52e1](https://www.github.com/netlify/build/commit/54f52e19481d528b1660743038aaa747cd439384))

## [10.1.0](https://www.github.com/netlify/build/compare/config-v10.0.0...config-v10.1.0) (2021-07-05)

### Features

- improve `functions` configuration logic ([#3175](https://www.github.com/netlify/build/issues/3175))
  ([7085d77](https://www.github.com/netlify/build/commit/7085d7720191c399d8fd9d560ce30a76b483e30a))

## [10.0.0](https://www.github.com/netlify/build/compare/config-v9.8.0...config-v10.0.0) (2021-07-05)

### ⚠ BREAKING CHANGES

- merge `priorityConfig` with `inlineConfig` (#3193)

### Features

- merge `priorityConfig` with `inlineConfig` ([#3193](https://www.github.com/netlify/build/issues/3193))
  ([35989ef](https://www.github.com/netlify/build/commit/35989ef8fe8196c1da2d36c2f73e4ff82efba6c5))

## [9.8.0](https://www.github.com/netlify/build/compare/config-v9.7.0...config-v9.8.0) (2021-07-05)

### Features

- change `origin` of `inlineConfig` and `priorityConfig` ([#3190](https://www.github.com/netlify/build/issues/3190))
  ([5ea2439](https://www.github.com/netlify/build/commit/5ea2439ae8f7de11ba15059820466456ee8df196))

## [9.7.0](https://www.github.com/netlify/build/compare/config-v9.6.0...config-v9.7.0) (2021-07-05)

### Features

- change how `priorityConfig` interacts with contexts ([#3187](https://www.github.com/netlify/build/issues/3187))
  ([736c269](https://www.github.com/netlify/build/commit/736c26993385173e37110b8e26c2cf389344de3e))

## [9.6.0](https://www.github.com/netlify/build/compare/config-v9.5.0...config-v9.6.0) (2021-07-05)

### Features

- refactor config contexts logic ([#3174](https://www.github.com/netlify/build/issues/3174))
  ([2815d8e](https://www.github.com/netlify/build/commit/2815d8ec46558ab87fb5c7f30e34a3f66c13ac0c))

## [9.5.0](https://www.github.com/netlify/build/compare/config-v9.4.0...config-v9.5.0) (2021-06-30)

### Features

- allow plugins to unset configuration properties ([#3158](https://www.github.com/netlify/build/issues/3158))
  ([64e1235](https://www.github.com/netlify/build/commit/64e1235079356f5936638cde812a17027e627b9f))

## [9.4.0](https://www.github.com/netlify/build/compare/config-v9.3.0...config-v9.4.0) (2021-06-30)

### Features

- remove redirects parsing feature flag ([#3150](https://www.github.com/netlify/build/issues/3150))
  ([1f297c9](https://www.github.com/netlify/build/commit/1f297c9845bc3a1f3ba4725c9f97aadf0d541e45))

## [9.3.0](https://www.github.com/netlify/build/compare/config-v9.2.0...config-v9.3.0) (2021-06-28)

### Features

- log `redirectsOrigin` in debug mode ([#3128](https://www.github.com/netlify/build/issues/3128))
  ([d18601c](https://www.github.com/netlify/build/commit/d18601c04e96ea87e29bac4d6eaf0bf8b5753988))

## [9.2.0](https://www.github.com/netlify/build/compare/config-v9.1.0...config-v9.2.0) (2021-06-28)

### Features

- add `config.redirectsOrigin` ([#3115](https://www.github.com/netlify/build/issues/3115))
  ([50a783f](https://www.github.com/netlify/build/commit/50a783ff434d24b528c94d761863f1227a47e9de))

## [9.1.0](https://www.github.com/netlify/build/compare/config-v9.0.0...config-v9.1.0) (2021-06-24)

### Features

- add `priorityConfig` to `@netlify/config` ([#3102](https://www.github.com/netlify/build/issues/3102))
  ([013ca1d](https://www.github.com/netlify/build/commit/013ca1d2efbde3547373f17f1550fe9cf60b9826))

## [9.0.0](https://www.github.com/netlify/build/compare/config-v8.0.1...config-v9.0.0) (2021-06-24)

### ⚠ BREAKING CHANGES

- do not print `@netlify/config` return value when `output` is defined (#3109)

### Features

- do not print `@netlify/config` return value when `output` is defined
  ([#3109](https://www.github.com/netlify/build/issues/3109))
  ([38363fd](https://www.github.com/netlify/build/commit/38363fd173428b57c948c1ea9329265f013c8007))

### [8.0.1](https://www.github.com/netlify/build/compare/config-v8.0.0...config-v8.0.1) (2021-06-24)

### Bug Fixes

- **plugins:** feature flag plugin execution with the system node version
  ([#3081](https://www.github.com/netlify/build/issues/3081))
  ([d1d5b58](https://www.github.com/netlify/build/commit/d1d5b58925fbe156591de0cf7123276fb910332d))

## [8.0.0](https://www.github.com/netlify/build/compare/config-v7.7.1...config-v8.0.0) (2021-06-22)

### ⚠ BREAKING CHANGES

- update dependency netlify-redirect-parser to v8 (#3091)

### Bug Fixes

- update dependency netlify-redirect-parser to v8 ([#3091](https://www.github.com/netlify/build/issues/3091))
  ([bf21959](https://www.github.com/netlify/build/commit/bf2195937ae7c33f4a74d64fd8c1cdc2e327a58e))

### [7.7.1](https://www.github.com/netlify/build/compare/config-v7.7.0...config-v7.7.1) (2021-06-22)

### Bug Fixes

- set `redirects` to an empty array with `@netlify/config` binary output
  ([#3083](https://www.github.com/netlify/build/issues/3083))
  ([7543c21](https://www.github.com/netlify/build/commit/7543c217b5b89c978b5178b938b633affe00f1db))

## [7.7.0](https://www.github.com/netlify/build/compare/config-v7.6.0...config-v7.7.0) (2021-06-22)

### Features

- do not print `redirects` with the `@netlify/config` CLI ([#3059](https://www.github.com/netlify/build/issues/3059))
  ([ccaa12d](https://www.github.com/netlify/build/commit/ccaa12dffc6701c7d8a2eee176a81b92e330b9c7))

## [7.6.0](https://www.github.com/netlify/build/compare/config-v7.5.0...config-v7.6.0) (2021-06-22)

### Features

- add `build.publishOrigin` to `@netlify/config` ([#3078](https://www.github.com/netlify/build/issues/3078))
  ([b5badfd](https://www.github.com/netlify/build/commit/b5badfdda2c7bada76d21583f6f57465b12b16cb))

## [7.5.0](https://www.github.com/netlify/build/compare/config-v7.4.1...config-v7.5.0) (2021-06-17)

### Features

- return `accounts` and `addons` from `@netlify/config` ([#3057](https://www.github.com/netlify/build/issues/3057))
  ([661f79c](https://www.github.com/netlify/build/commit/661f79cf9ca6eaee03f25a24a6569bc6cc9302a3))

### [7.4.1](https://www.github.com/netlify/build/compare/config-v7.4.0...config-v7.4.1) (2021-06-17)

### Bug Fixes

- remove `netlify_config_default_publish` feature flag ([#3047](https://www.github.com/netlify/build/issues/3047))
  ([0e2c137](https://www.github.com/netlify/build/commit/0e2c137fffae8ad3d4d8243ade3e5f46c0e96e21))

## [7.4.0](https://www.github.com/netlify/build/compare/config-v7.3.0...config-v7.4.0) (2021-06-15)

### Features

- add `--cachedConfigPath` CLI flag ([#3037](https://www.github.com/netlify/build/issues/3037))
  ([e317a36](https://www.github.com/netlify/build/commit/e317a36b7c7028fcab6bb0fb0d026e0da522b692))

## [7.3.0](https://www.github.com/netlify/build/compare/config-v7.2.4...config-v7.3.0) (2021-06-15)

### Features

- add `--output` CLI flag to `@netlify/config` ([#3028](https://www.github.com/netlify/build/issues/3028))
  ([5a07b84](https://www.github.com/netlify/build/commit/5a07b84c501c36b696f017d585d79d149577dbb2))

### [7.2.4](https://www.github.com/netlify/build/compare/config-v7.2.3...config-v7.2.4) (2021-06-14)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v7 ([#3026](https://www.github.com/netlify/build/issues/3026))
  ([33b4d2a](https://www.github.com/netlify/build/commit/33b4d2a8ada68941d2f3f0171ac05eb37f77af60))

### [7.2.3](https://www.github.com/netlify/build/compare/config-v7.2.2...config-v7.2.3) (2021-06-14)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to v5.2.1
  ([#3021](https://www.github.com/netlify/build/issues/3021))
  ([be298a1](https://www.github.com/netlify/build/commit/be298a1315f89f02fb38ba99762ab029cde20a68))
- pin zisi version in functions utils ([#3023](https://www.github.com/netlify/build/issues/3023))
  ([9c6b09b](https://www.github.com/netlify/build/commit/9c6b09b89d5b3e1552eb848aea016092c6abcf5e))

### [7.2.2](https://www.github.com/netlify/build/compare/config-v7.2.1...config-v7.2.2) (2021-06-14)

### Bug Fixes

- **deps:** update dependency netlify-redirect-parser to ^5.2.0
  ([#3018](https://www.github.com/netlify/build/issues/3018))
  ([374b1cc](https://www.github.com/netlify/build/commit/374b1ccaede449a79d366b75bc38dbdb90d2a9ff))

### [7.2.1](https://www.github.com/netlify/build/compare/config-v7.2.0...config-v7.2.1) (2021-06-14)

### Bug Fixes

- revert `redirects` parsing ([#3016](https://www.github.com/netlify/build/issues/3016))
  ([39613cf](https://www.github.com/netlify/build/commit/39613cfd04281e51264ef61a75c3bd4880158a11))

## [7.2.0](https://www.github.com/netlify/build/compare/config-v7.1.2...config-v7.2.0) (2021-06-11)

### Features

- add `config.redirects` ([#3003](https://www.github.com/netlify/build/issues/3003))
  ([ec3c177](https://www.github.com/netlify/build/commit/ec3c177fcc6a90a99fb7a584d2402b004704bc7e))

### [7.1.2](https://www.github.com/netlify/build/compare/config-v7.1.1...config-v7.1.2) (2021-06-11)

### Bug Fixes

- refactor some logic related to the `base` directory ([#3001](https://www.github.com/netlify/build/issues/3001))
  ([2fa3b43](https://www.github.com/netlify/build/commit/2fa3b43ddc13829505776b21631803a5009de4ea))

### [7.1.1](https://www.github.com/netlify/build/compare/config-v7.1.0...config-v7.1.1) (2021-06-11)

### Bug Fixes

- move some lines of code ([#2999](https://www.github.com/netlify/build/issues/2999))
  ([857787f](https://www.github.com/netlify/build/commit/857787fec08612f4e53687d4cbba0374fc4022bf))

## [7.1.0](https://www.github.com/netlify/build/compare/config-v7.0.3...config-v7.1.0) (2021-06-11)

### Features

- refactor some logic related to the `base` directory ([#2997](https://www.github.com/netlify/build/issues/2997))
  ([683b9bd](https://www.github.com/netlify/build/commit/683b9bd0e3d1f93ac4f293e904657193e2ca253c))

### [7.0.3](https://www.github.com/netlify/build/compare/config-v7.0.2...config-v7.0.3) (2021-06-10)

### Bug Fixes

- merge conflict ([e1fcf01](https://www.github.com/netlify/build/commit/e1fcf017549a084f7b024a6b7cdceb9154c6462e))

### [7.0.2](https://www.github.com/netlify/build/compare/config-v7.0.1...config-v7.0.2) (2021-06-10)

### Bug Fixes

- refactor a warning message ([#2973](https://www.github.com/netlify/build/issues/2973))
  ([dee5bd8](https://www.github.com/netlify/build/commit/dee5bd8c68e77aa027894599e6c30a3eaf6f3c2a))

### [7.0.1](https://www.github.com/netlify/build/compare/config-v7.0.0...config-v7.0.1) (2021-06-10)

### Bug Fixes

- feature flags logging in `@netlify/config` ([#2993](https://www.github.com/netlify/build/issues/2993))
  ([03e2978](https://www.github.com/netlify/build/commit/03e2978174ce6e357b66d6df054a441facbfd52d))

## [7.0.0](https://www.github.com/netlify/build/compare/config-v6.10.0...config-v7.0.0) (2021-06-10)

### ⚠ BREAKING CHANGES

- improve support for monorepo sites without a `publish` directory (#2988)

### Features

- improve support for monorepo sites without a `publish` directory
  ([#2988](https://www.github.com/netlify/build/issues/2988))
  ([1fcad8a](https://www.github.com/netlify/build/commit/1fcad8a81c35060fbc3ec8cb15ade9762579a166))

## [6.10.0](https://www.github.com/netlify/build/compare/config-v6.9.2...config-v6.10.0) (2021-06-10)

### Features

- improve feature flags logic ([#2960](https://www.github.com/netlify/build/issues/2960))
  ([6df6360](https://www.github.com/netlify/build/commit/6df63603ee3822229d1504e95f4622d47387ddfb))

### [6.9.2](https://www.github.com/netlify/build/compare/config-v6.9.1...config-v6.9.2) (2021-06-09)

### Bug Fixes

- refactor warning message related to monorepo `publish` default value
  ([#2970](https://www.github.com/netlify/build/issues/2970))
  ([09b50ac](https://www.github.com/netlify/build/commit/09b50acb82c10eccbf96752e76e47907e50c029f))

### [6.9.1](https://www.github.com/netlify/build/compare/config-v6.9.0...config-v6.9.1) (2021-06-09)

### Bug Fixes

- move build directory logic to its own file ([#2969](https://www.github.com/netlify/build/issues/2969))
  ([db6eba3](https://www.github.com/netlify/build/commit/db6eba3ad9b72662ee23615b97408d064fcccd21))

## [6.9.0](https://www.github.com/netlify/build/compare/config-v6.8.0...config-v6.9.0) (2021-06-09)

### Features

- simplify code related to `base` directory ([#2951](https://www.github.com/netlify/build/issues/2951))
  ([bfffc2e](https://www.github.com/netlify/build/commit/bfffc2e86a82ded738074b1ed32ce2bf0d8d4a91))

## [6.8.0](https://www.github.com/netlify/build/compare/config-v6.7.3...config-v6.8.0) (2021-06-09)

### Features

- refactor configuration file paths resolution ([#2954](https://www.github.com/netlify/build/issues/2954))
  ([d059450](https://www.github.com/netlify/build/commit/d0594507501936a2eaba2b59c912d51962f738b8))

### [6.7.3](https://www.github.com/netlify/build/compare/config-v6.7.2...config-v6.7.3) (2021-06-08)

### Bug Fixes

- `@netlify/config` `README` update ([#2946](https://www.github.com/netlify/build/issues/2946))
  ([baf5a9a](https://www.github.com/netlify/build/commit/baf5a9aff5eb8a5040930189fc0406e46980a994))

### [6.7.2](https://www.github.com/netlify/build/compare/config-v6.7.1...config-v6.7.2) (2021-06-04)

### Bug Fixes

- **deps:** update dependency netlify to ^7.0.1 ([#2908](https://www.github.com/netlify/build/issues/2908))
  ([28f1366](https://www.github.com/netlify/build/commit/28f13666a0dec4625c221619175f554aa7c8b761))

### [6.7.1](https://www.github.com/netlify/build/compare/config-v6.7.0...config-v6.7.1) (2021-05-27)

### Bug Fixes

- **deps:** update dependency netlify to v7 ([#2858](https://www.github.com/netlify/build/issues/2858))
  ([866fddb](https://www.github.com/netlify/build/commit/866fddbb0eb9a8272997960197b8418c62a4b06b))

## [6.7.0](https://www.github.com/netlify/build/compare/config-v6.6.0...config-v6.7.0) (2021-05-24)

### Features

- **config:** consider package.json when detecting base directory
  ([#2838](https://www.github.com/netlify/build/issues/2838))
  ([9172222](https://www.github.com/netlify/build/commit/9172222dea8458bf32119788fc89c17264757e5f))

## [6.6.0](https://www.github.com/netlify/build/compare/config-v6.5.0...config-v6.6.0) (2021-05-21)

### Features

- print a warning message when `base` is set but not `publish`
  ([#2827](https://www.github.com/netlify/build/issues/2827))
  ([a9fb807](https://www.github.com/netlify/build/commit/a9fb807be477bcd2419520b92d8a7c7d7ee03088))

## [6.5.0](https://www.github.com/netlify/build/compare/config-v6.4.4...config-v6.5.0) (2021-05-12)

### Features

- **config:** return repository root ([#2785](https://www.github.com/netlify/build/issues/2785))
  ([9a05786](https://www.github.com/netlify/build/commit/9a05786266c51031ccaef1f216f21c5821ec92fb))

### [6.4.4](https://www.github.com/netlify/build/compare/config-v6.4.3...config-v6.4.4) (2021-05-05)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.27 ([#2745](https://www.github.com/netlify/build/issues/2745))
  ([c2725e8](https://www.github.com/netlify/build/commit/c2725e835e1b13c233f53201399c767a75e1bab1))

### [6.4.3](https://www.github.com/netlify/build/compare/config-v6.4.2...config-v6.4.3) (2021-05-04)

### Bug Fixes

- **deps:** update netlify packages ([#2735](https://www.github.com/netlify/build/issues/2735))
  ([6060bab](https://www.github.com/netlify/build/commit/6060babcee003881df46f45eda1118b7737cc4e1))

### [6.4.2](https://www.github.com/netlify/build/compare/config-v6.4.1...config-v6.4.2) (2021-05-03)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.25 ([#2733](https://www.github.com/netlify/build/issues/2733))
  ([0a06086](https://www.github.com/netlify/build/commit/0a060867d3896adf61daf4ddd875e872a1ae956d))

### [6.4.1](https://www.github.com/netlify/build/compare/config-v6.4.0...config-v6.4.1) (2021-05-03)

### Bug Fixes

- **deps:** update dependency map-obj to v4 ([#2721](https://www.github.com/netlify/build/issues/2721))
  ([17559dc](https://www.github.com/netlify/build/commit/17559dcc75dd9f9a73f2a604c9f8ef3140a91b42))
- local builds version pinning ([#2717](https://www.github.com/netlify/build/issues/2717))
  ([f3a8c17](https://www.github.com/netlify/build/commit/f3a8c17dbcbc9c4f44ba97acf9e886e1cb03da71))

## [6.4.0](https://www.github.com/netlify/build/compare/config-v6.3.2...config-v6.4.0) (2021-05-03)

### Features

- add support for `functions.included_files` config property ([#2681](https://www.github.com/netlify/build/issues/2681))
  ([d75dc74](https://www.github.com/netlify/build/commit/d75dc74d9bbe9b542b17afce37419bed575c8651))

### [6.3.2](https://www.github.com/netlify/build/compare/config-v6.3.1...config-v6.3.2) (2021-04-29)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.24 ([#2686](https://www.github.com/netlify/build/issues/2686))
  ([914b7cb](https://www.github.com/netlify/build/commit/914b7cb11ee0bd9edb95f304c34fecc01e36bdc3))

### [6.3.1](https://www.github.com/netlify/build/compare/config-v6.3.0...config-v6.3.1) (2021-04-29)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.23 ([#2684](https://www.github.com/netlify/build/issues/2684))
  ([cf821f1](https://www.github.com/netlify/build/commit/cf821f102ea219af730c3b6d9989c16a0500e211))

## [6.3.0](https://www.github.com/netlify/build/compare/config-v6.2.1...config-v6.3.0) (2021-04-27)

### Features

- allow buildbot to pin plugin versions in `@netlify/config` ([#2674](https://www.github.com/netlify/build/issues/2674))
  ([2e8a086](https://www.github.com/netlify/build/commit/2e8a0866b6bc60dfbeaccc54edc093c82d5aef7a))

### [6.2.1](https://www.github.com/netlify/build/compare/config-v6.2.0...config-v6.2.1) (2021-04-26)

### Bug Fixes

- add some newlines before some warning message ([#2652](https://www.github.com/netlify/build/issues/2652))
  ([fc96155](https://www.github.com/netlify/build/commit/fc96155d137fb9a772dda25586007d04a30bf448))
- **deps:** update dependency map-obj to v3.1.0 ([#2656](https://www.github.com/netlify/build/issues/2656))
  ([89e497a](https://www.github.com/netlify/build/commit/89e497a37a892f203a601a510e0e24ae037ad146))
- missing colors in `@netlify/config` warnings ([#2651](https://www.github.com/netlify/build/issues/2651))
  ([5133c2a](https://www.github.com/netlify/build/commit/5133c2a8c95af70b928b6f7b3e3de702b0570bd8))

## [6.2.0](https://www.github.com/netlify/build/compare/config-v6.1.0...config-v6.2.0) (2021-04-23)

### Features

- improve context-specific configuration validation ([#2648](https://www.github.com/netlify/build/issues/2648))
  ([e5059f9](https://www.github.com/netlify/build/commit/e5059f999488e9833c129f4a26d10811e7541878))

## [6.1.0](https://www.github.com/netlify/build/compare/config-v6.0.3...config-v6.1.0) (2021-04-23)

### Features

- validate all contexts in configuration ([#2641](https://www.github.com/netlify/build/issues/2641))
  ([447f21e](https://www.github.com/netlify/build/commit/447f21ed87079ef4b12a96e67ca55b4f2ba544b3))

### [6.0.3](https://www.github.com/netlify/build/compare/config-v6.0.2...config-v6.0.3) (2021-04-23)

### Bug Fixes

- support `main` branch in `@netlify/config` ([#2639](https://www.github.com/netlify/build/issues/2639))
  ([7728c60](https://www.github.com/netlify/build/commit/7728c60aed1e7c3bf0bb7a95aeef8b6686ca7478))

### [6.0.2](https://www.github.com/netlify/build/compare/config-v6.0.1...config-v6.0.2) (2021-04-20)

### Bug Fixes

- **deps:** update netlify packages ([#2622](https://www.github.com/netlify/build/issues/2622))
  ([4d35de4](https://www.github.com/netlify/build/commit/4d35de4d4d8d49b460080480c6e5b3610e6ef023))

### [6.0.1](https://www.github.com/netlify/build/compare/config-v6.0.0...config-v6.0.1) (2021-04-14)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.18 ([#2602](https://www.github.com/netlify/build/issues/2602))
  ([c36356d](https://www.github.com/netlify/build/commit/c36356de80c4a19fb8ee808f074c9c9e827ebc07))

## [6.0.0](https://www.github.com/netlify/build/compare/config-v5.12.0...config-v6.0.0) (2021-04-14)

### ⚠ BREAKING CHANGES

- simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags (#2595)

### Features

- simplify `inlineConfig`, `defaultConfig` and `cachedConfig` CLI flags
  ([#2595](https://www.github.com/netlify/build/issues/2595))
  ([c272632](https://www.github.com/netlify/build/commit/c272632db8825f85c07bb05cd90eacb1c8ea2544))

## [5.12.0](https://www.github.com/netlify/build/compare/config-v5.11.1...config-v5.12.0) (2021-04-12)

### Features

- deep merge context-specific plugin config ([#2572](https://www.github.com/netlify/build/issues/2572))
  ([0a29162](https://www.github.com/netlify/build/commit/0a2916234a14ef0f99f093c8c5cdde0727d0f09f))

### [5.11.1](https://www.github.com/netlify/build/compare/config-v5.11.0...config-v5.11.1) (2021-04-12)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.17 ([#2589](https://www.github.com/netlify/build/issues/2589))
  ([925a1c4](https://www.github.com/netlify/build/commit/925a1c4613be2d96142caecda9dd452a0fd4f951))

## [5.11.0](https://www.github.com/netlify/build/compare/config-v5.10.0...config-v5.11.0) (2021-04-09)

### Features

- add a test related to context-specific plugins config ([#2570](https://www.github.com/netlify/build/issues/2570))
  ([cb23b93](https://www.github.com/netlify/build/commit/cb23b938c32775ff852ce815bc3622b9c0cfcf5a))

## [5.10.0](https://www.github.com/netlify/build/compare/config-v5.9.0...config-v5.10.0) (2021-04-09)

### Features

- allow context-specific plugins configuration ([#2567](https://www.github.com/netlify/build/issues/2567))
  ([dc3b462](https://www.github.com/netlify/build/commit/dc3b46223fe2d965d6a8fb479e41f65bc7c89478))

## [5.9.0](https://www.github.com/netlify/build/compare/config-v5.8.0...config-v5.9.0) (2021-04-08)

### Features

- move validation related to duplicated plugins configuration
  ([#2566](https://www.github.com/netlify/build/issues/2566))
  ([df2e5d5](https://www.github.com/netlify/build/commit/df2e5d563397b90ec79982f264c851e9bd21b2c4))

## [5.8.0](https://www.github.com/netlify/build/compare/config-v5.7.0...config-v5.8.0) (2021-04-08)

### Features

- refactor configuration merge logic ([#2564](https://www.github.com/netlify/build/issues/2564))
  ([06ea3fd](https://www.github.com/netlify/build/commit/06ea3fd438c25f8f372b4a111119e116f7d90f6d))

## [5.7.0](https://www.github.com/netlify/build/compare/config-v5.6.0...config-v5.7.0) (2021-04-08)

### Features

- refactor configuration merge logic ([#2561](https://www.github.com/netlify/build/issues/2561))
  ([839d400](https://www.github.com/netlify/build/commit/839d4008dd3d515785bdff12174910902d242709))
- refactors how plugins configurations are currently merged ([#2562](https://www.github.com/netlify/build/issues/2562))
  ([7276576](https://www.github.com/netlify/build/commit/7276576020d9bf133f1e50666a614c10e980be3b))

## [5.6.0](https://www.github.com/netlify/build/compare/config-v5.5.1...config-v5.6.0) (2021-04-08)

### Features

- improve how context-specific config are merged ([#2555](https://www.github.com/netlify/build/issues/2555))
  ([a642a9d](https://www.github.com/netlify/build/commit/a642a9d36f24dc5c93e43304858007c524035b71))

### [5.5.1](https://www.github.com/netlify/build/compare/config-v5.5.0...config-v5.5.1) (2021-04-07)

### Bug Fixes

- context properties should not unset plugins ([#2558](https://www.github.com/netlify/build/issues/2558))
  ([32be1bb](https://www.github.com/netlify/build/commit/32be1bb7d052d8e4a0b9bcbf9d5d0dbd428a8535))

## [5.5.0](https://www.github.com/netlify/build/compare/config-v5.4.0...config-v5.5.0) (2021-04-07)

### Features

- validate `context.{context}.*` properties ([#2551](https://www.github.com/netlify/build/issues/2551))
  ([4559349](https://www.github.com/netlify/build/commit/45593491b6a053c0d256a169d4ff998187c533e9))

## [5.4.0](https://www.github.com/netlify/build/compare/config-v5.3.1...config-v5.4.0) (2021-04-07)

### Features

- refactor configuration property origins ([#2549](https://www.github.com/netlify/build/issues/2549))
  ([b1d7c66](https://www.github.com/netlify/build/commit/b1d7c6623a16a62941ddd2f3d406657c4206b096))

### [5.3.1](https://www.github.com/netlify/build/compare/config-v5.3.0...config-v5.3.1) (2021-04-07)

### Bug Fixes

- improve config normalization logic ([#2547](https://www.github.com/netlify/build/issues/2547))
  ([7945e0a](https://www.github.com/netlify/build/commit/7945e0ab496f48da006392646cf0512f6a564348))

## [5.3.0](https://www.github.com/netlify/build/compare/config-v5.2.0...config-v5.3.0) (2021-04-07)

### Features

- refactor how origin is added to context-specific configs ([#2545](https://www.github.com/netlify/build/issues/2545))
  ([c3f45b2](https://www.github.com/netlify/build/commit/c3f45b288544200a6408a9af7bdfb955d45ebb81))

## [5.2.0](https://www.github.com/netlify/build/compare/config-v5.1.1...config-v5.2.0) (2021-04-07)

### Features

- refactor plugins[*].origin ([#2540](https://www.github.com/netlify/build/issues/2540))
  ([43ad104](https://www.github.com/netlify/build/commit/43ad104928d707b864a6e667270d783ae4e5cbac))

### [5.1.1](https://www.github.com/netlify/build/compare/config-v5.1.0...config-v5.1.1) (2021-04-06)

### Bug Fixes

- validate build.command even when not used due to config merge
  ([#2541](https://www.github.com/netlify/build/issues/2541))
  ([95c8e70](https://www.github.com/netlify/build/commit/95c8e7088c8956b34535548da4b2c7a3014ff37d))

## [5.1.0](https://www.github.com/netlify/build/compare/config-v5.0.1...config-v5.1.0) (2021-04-01)

### Features

- add functions config object to build output ([#2518](https://www.github.com/netlify/build/issues/2518))
  ([280834c](https://www.github.com/netlify/build/commit/280834c079995ad3c3b5607f983198fba6b3ac13))

### [5.0.1](https://www.github.com/netlify/build/compare/config-v5.0.0...config-v5.0.1) (2021-04-01)

### Bug Fixes

- reinstate legacy build.functions property ([#2519](https://www.github.com/netlify/build/issues/2519))
  ([488bea6](https://www.github.com/netlify/build/commit/488bea6f6a75aaf7bdd33b9c5d781b49f2316168))

## [5.0.0](https://www.github.com/netlify/build/compare/config-v4.3.0...config-v5.0.0) (2021-03-30)

### ⚠ BREAKING CHANGES

- add functions.directory property (#2496)

### Features

- add functions.directory property ([#2496](https://www.github.com/netlify/build/issues/2496))
  ([d72b1d1](https://www.github.com/netlify/build/commit/d72b1d1fb91de3fa23310ed477a6658c5492aed0))

## [4.3.0](https://www.github.com/netlify/build/compare/v4.2.0...v4.3.0) (2021-03-23)

### Features

- add context support to the functions block ([#2447](https://www.github.com/netlify/build/issues/2447))
  ([5813826](https://www.github.com/netlify/build/commit/581382662506b01695fcbedadc0ea4b7d19b7efc))

## [4.2.0](https://www.github.com/netlify/build/compare/v4.1.3...v4.2.0) (2021-03-18)

### Features

- add functions configuration API to @netlify/config ([#2390](https://www.github.com/netlify/build/issues/2390))
  ([654d32e](https://www.github.com/netlify/build/commit/654d32eb49bea33816b1adde02f13f0843db9cdd))
- add functions.\*.node_bundler config property ([#2430](https://www.github.com/netlify/build/issues/2430))
  ([72bed60](https://www.github.com/netlify/build/commit/72bed606e4395a42861bf0f78c43eb81bcdcc326))

### [4.1.3](https://www.github.com/netlify/build/compare/v4.1.2...v4.1.3) (2021-03-12)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.16 ([#2399](https://www.github.com/netlify/build/issues/2399))
  ([528d5b9](https://www.github.com/netlify/build/commit/528d5b99e09d38c414bb4daa7c906a72bdd83302))

### [4.1.2](https://www.github.com/netlify/build/compare/v4.1.1...v4.1.2) (2021-03-10)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.14 ([#2387](https://www.github.com/netlify/build/issues/2387))
  ([d5886f1](https://www.github.com/netlify/build/commit/d5886f1537734af0abf06bd59d083ca16d6b49a5))

### [4.1.1](https://www.github.com/netlify/build/compare/v4.1.0...v4.1.1) (2021-03-09)

### Bug Fixes

- fix `host` option in `@netlify/config` ([#2379](https://www.github.com/netlify/build/issues/2379))
  ([64d8386](https://www.github.com/netlify/build/commit/64d8386daf5f1f069ea95fb655a593b05f8f8107))

## [4.1.0](https://www.github.com/netlify/build/compare/v4.0.4...v4.1.0) (2021-03-08)

### Features

- allow passing Netlify API host to Netlify API client ([#2288](https://www.github.com/netlify/build/issues/2288))
  ([5529b1d](https://www.github.com/netlify/build/commit/5529b1dc92eccb6a932f80b006e83acfa0034413))

### [4.0.4](https://www.github.com/netlify/build/compare/v4.0.3...v4.0.4) (2021-03-04)

### Bug Fixes

- **deps:** update netlify packages ([#2352](https://www.github.com/netlify/build/issues/2352))
  ([c45bdc8](https://www.github.com/netlify/build/commit/c45bdc8e6165751b4294993426ff32e366f0c55a))

### [4.0.3](https://www.github.com/netlify/build/compare/v4.0.2...v4.0.3) (2021-03-03)

### Bug Fixes

- **deps:** update dependency netlify to ^6.1.11 ([#2343](https://www.github.com/netlify/build/issues/2343))
  ([bafca4e](https://www.github.com/netlify/build/commit/bafca4e8d2d462c1816695483bc1e381cc199b33))

### [4.0.2](https://www.github.com/netlify/build/compare/v4.0.1...v4.0.2) (2021-02-18)

### Bug Fixes

- fix `files` in `package.json` with `npm@7` ([#2278](https://www.github.com/netlify/build/issues/2278))
  ([e9df064](https://www.github.com/netlify/build/commit/e9df0645f3083a0bb141c8b5b6e474ed4e27dbe9))

### [4.0.1](https://www.github.com/netlify/build/compare/v4.0.0...v4.0.1) (2021-02-09)

### Bug Fixes

- **deps:** update dependency netlify to v6.1.7 ([#2261](https://www.github.com/netlify/build/issues/2261))
  ([607c848](https://www.github.com/netlify/build/commit/607c84868af5db36e18c9a9160b4d5e811c22e3a))

## [4.0.0](https://www.github.com/netlify/build/compare/v3.1.2...v4.0.0) (2021-02-04)

### ⚠ BREAKING CHANGES

- use netlify/functions as the default functions directory (#2188)

### Features

- use netlify/functions as the default functions directory ([#2188](https://www.github.com/netlify/build/issues/2188))
  ([84e1e07](https://www.github.com/netlify/build/commit/84e1e075b5efd7ca26ccaf2531511e7737d97f1f))

### [3.1.2](https://www.github.com/netlify/build/compare/v3.1.1...v3.1.2) (2021-02-02)

### Bug Fixes

- add SITE_ID and SITE_NAME env vars to local builds ([#2239](https://www.github.com/netlify/build/issues/2239))
  ([113e4d2](https://www.github.com/netlify/build/commit/113e4d2c48e0264e48f391e5a7d219332d012fab))

### [3.1.1](https://www.github.com/netlify/build/compare/v3.1.0...v3.1.1) (2021-01-29)

### Bug Fixes

- **deps:** update dependency netlify to v6.1.5 ([#2225](https://www.github.com/netlify/build/issues/2225))
  ([fec5c83](https://www.github.com/netlify/build/commit/fec5c83c12ebf7572aaf8756fdbec6e9fe1e3699))

## [3.1.0](https://www.github.com/netlify/build/compare/v3.0.5...v3.1.0) (2021-01-27)

### Features

- allow override of API URL ([#2190](https://www.github.com/netlify/build/issues/2190))
  ([3e1be70](https://www.github.com/netlify/build/commit/3e1be7057ac9f217405b2cbe15f39e1ecd7496e6))

### [3.0.5](https://www.github.com/netlify/build/compare/v3.0.4...v3.0.5) (2021-01-27)

### Bug Fixes

- **deps:** update dependency netlify to v6.1.4 ([#2219](https://www.github.com/netlify/build/issues/2219))
  ([3a75574](https://www.github.com/netlify/build/commit/3a7557400d46388aad42250f6d9751f1617f3cd0))

### [3.0.4](https://www.github.com/netlify/build/compare/v3.0.3...v3.0.4) (2021-01-25)

### Bug Fixes

- **deps:** update dependency netlify to v6.1.3 ([#2210](https://www.github.com/netlify/build/issues/2210))
  ([b7c2c40](https://www.github.com/netlify/build/commit/b7c2c4049e9037cf855475543b13e33c32ceb4a6))

### [3.0.3](https://www.github.com/netlify/build/compare/v3.0.2...v3.0.3) (2021-01-25)

### Bug Fixes

- **deps:** update dependency netlify to v6.1.1 ([#2200](https://www.github.com/netlify/build/issues/2200))
  ([930805e](https://www.github.com/netlify/build/commit/930805ec70cedbb08d58490c038ea9bcd8ecd35f))

### [3.0.2](https://www.github.com/netlify/build/compare/config-v3.0.1...v3.0.2) (2021-01-22)

### Bug Fixes

- **deps:** update dependency netlify to v6.1.0 ([#2194](https://www.github.com/netlify/build/issues/2194))
  ([4b39e9c](https://www.github.com/netlify/build/commit/4b39e9c746c3a8cf1753bd66913883f2adff6ed8))
