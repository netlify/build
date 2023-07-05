# Changelog

### Bug Fixes

* Revert dev cycle feature flagging ([#4933](https://github.com/netlify/build/issues/4933)) ([a3f8bdf](https://github.com/netlify/build/commit/a3f8bdf6124de9b6d50b63a940a68e4ceec1c16f))

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.5.3 to ^9.6.0

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.6.0 to ^9.7.0

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.7.1 to ^9.7.2

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.7.2 to ^9.8.0

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.0 to ^9.8.1

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.2 to ^9.8.3

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.4 to ^9.8.5

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.6 to ^9.8.7

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.7 to ^9.8.8

### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.8 to ^9.8.9

## [7.3.3](https://github.com/netlify/build/compare/build-info-v7.3.2...build-info-v7.3.3) (2023-07-05)


### Bug Fixes

* fixes an issue with npm workspace filtering in the command ([#5125](https://github.com/netlify/build/issues/5125)) ([d161c0c](https://github.com/netlify/build/commit/d161c0c6d00a4be77864356c66a2f82af19c076a)), closes [#5123](https://github.com/netlify/build/issues/5123)

## [7.3.2](https://github.com/netlify/build/compare/build-info-v7.3.1...build-info-v7.3.2) (2023-07-05)


### Bug Fixes

* fixes an issue where the wrong dist was used for frameworks with… ([#5122](https://github.com/netlify/build/issues/5122)) ([4533a61](https://github.com/netlify/build/commit/4533a61da4f40c302fedf8185ae8b85ac3e39fa6))

## [7.3.1](https://github.com/netlify/build/compare/build-info-v7.3.0...build-info-v7.3.1) (2023-07-04)


### Bug Fixes

* place outside ff ([0898cf6](https://github.com/netlify/build/commit/0898cf6ceb6467fc1cbca3985f45457a720ffb24))

## [7.3.0](https://github.com/netlify/build/compare/build-info-v7.2.0...build-info-v7.3.0) (2023-06-30)


### Features

* detect lang runtime ([#5105](https://github.com/netlify/build/issues/5105)) ([7242ddd](https://github.com/netlify/build/commit/7242dddef6307f1c673ba94f7026a85eb5a0fb59))

## [7.2.0](https://github.com/netlify/build/compare/build-info-v7.1.1...build-info-v7.2.0) (2023-06-29)


### Features

* make events async ([#5106](https://github.com/netlify/build/issues/5106)) ([6fa5220](https://github.com/netlify/build/commit/6fa5220bc6d9f9e390564cd2f1a3a4c5bc9cd206))

## [7.1.1](https://github.com/netlify/build/compare/build-info-v7.1.0...build-info-v7.1.1) (2023-06-29)


### Bug Fixes

* remove node specific dirname ([#5103](https://github.com/netlify/build/issues/5103)) ([bc5f991](https://github.com/netlify/build/commit/bc5f991955571f5e0b8a135cfa09ac1c01eff9c8))

## [7.1.0](https://github.com/netlify/build/compare/build-info-v7.0.8...build-info-v7.1.0) (2023-06-29)


### Features

* **build-info:** add detection for toml files and settings collection ([#5102](https://github.com/netlify/build/issues/5102)) ([fcf221a](https://github.com/netlify/build/commit/fcf221a57da89b9b7888a929aa0f978ce716ed9d))

## [7.0.8](https://github.com/netlify/build/compare/build-info-v7.0.7...build-info-v7.0.8) (2023-06-15)


### Bug Fixes

* fixes an issue where it broke if no patterns are provided ([#5081](https://github.com/netlify/build/issues/5081)) ([7ac1567](https://github.com/netlify/build/commit/7ac15679ebcf11d3cf9eb52832d3c719c2c9fc8a))

## [7.0.7](https://github.com/netlify/build/compare/build-info-v7.0.6...build-info-v7.0.7) (2023-06-14)


### Bug Fixes

* remove RegEx negative lookbehind in file system ([#5078](https://github.com/netlify/build/issues/5078)) ([6b7ac05](https://github.com/netlify/build/commit/6b7ac05120a1a9b9bd7752054e8375f7c87ecabe))

## [7.0.6](https://github.com/netlify/build/compare/build-info-v7.0.5...build-info-v7.0.6) (2023-06-09)


### Bug Fixes

* **deps:** update dependency minimatch to v9 ([#5021](https://github.com/netlify/build/issues/5021)) ([f825645](https://github.com/netlify/build/commit/f825645da38b7104118571a29c95e9e05b0ef636))
* use turbo --filter instead of deprecated --scope ([#5057](https://github.com/netlify/build/issues/5057)) ([58e45b8](https://github.com/netlify/build/commit/58e45b86b8eb5d8e59cb3828287f7858f6303015))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.9 to ^9.8.10

## [7.0.4](https://github.com/netlify/build/compare/build-info-v7.0.3...build-info-v7.0.4) (2023-06-02)


### Bug Fixes

* **build-info:** fixes a bug in the platform independent join function ([#5042](https://github.com/netlify/build/issues/5042)) ([1fde7c9](https://github.com/netlify/build/commit/1fde7c95f43e5a473bf077ab9f48445789992187))

## [7.0.1](https://github.com/netlify/build/compare/build-info-v7.0.0...build-info-v7.0.1) (2023-05-05)


### Bug Fixes

* fixes an issue where it could not retrieve the settings for the same root as projectdir ([#4996](https://github.com/netlify/build/issues/4996)) ([dc220cb](https://github.com/netlify/build/commit/dc220cbb4619e88310ca704b3e5d6bb60aa0776c))

## [7.0.0](https://github.com/netlify/build/compare/build-info-v6.9.0...build-info-v7.0.0) (2023-05-04)


### ⚠ BREAKING CHANGES

* retrieve build and dev settings for frameworks with build systems ([#4977](https://github.com/netlify/build/issues/4977))

### Features

* retrieve build and dev settings for frameworks with build systems ([#4977](https://github.com/netlify/build/issues/4977)) ([e7f3361](https://github.com/netlify/build/commit/e7f3361c38ffee5304f4b010068a4e8603a4cbb0))

## [6.9.0](https://github.com/netlify/build/compare/build-info-v6.8.1...build-info-v6.9.0) (2023-05-03)


### Features

* move framework logos over to build-info ([#4988](https://github.com/netlify/build/issues/4988)) ([35cee2a](https://github.com/netlify/build/commit/35cee2a55e736af2c36dbca34bb1313e806527c4))

## [6.8.1](https://github.com/netlify/build/compare/build-info-v6.8.0...build-info-v6.8.1) (2023-04-25)


### Bug Fixes

* **deps:** update dependency @netlify/zip-it-and-ship-it to v9 ([#4982](https://github.com/netlify/build/issues/4982)) ([4a77bbc](https://github.com/netlify/build/commit/4a77bbcb6b1edb6f705282a8cece7963710e8e3e))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.5 to ^9.8.6

## [6.8.0](https://github.com/netlify/build/compare/build-info-v6.7.2...build-info-v6.8.0) (2023-04-14)


### Features

* improve bugsnag reporting and fix error ([#4974](https://github.com/netlify/build/issues/4974)) ([530eebf](https://github.com/netlify/build/commit/530eebfc79e823125766dd50fc724e2f42d0ff62))

## [6.7.2](https://github.com/netlify/build/compare/build-info-v6.7.1...build-info-v6.7.2) (2023-04-12)


### Bug Fixes

* workspace detection from inside a nested package ([#4970](https://github.com/netlify/build/issues/4970)) ([248243e](https://github.com/netlify/build/commit/248243ed469bc0d6e6e6e54cdc28786a044abc43))

## [6.7.1](https://github.com/netlify/build/compare/build-info-v6.7.0...build-info-v6.7.1) (2023-04-11)


### Bug Fixes

* entrypoint for node with correct types ([#4962](https://github.com/netlify/build/issues/4962)) ([051812d](https://github.com/netlify/build/commit/051812ddb48873605759b7ca40420043d2c55489))

## [6.7.0](https://github.com/netlify/build/compare/build-info-v6.6.1...build-info-v6.7.0) (2023-03-28)


### Features

* Integrate framework detection in build info ([#4876](https://github.com/netlify/build/issues/4876)) ([0df38c0](https://github.com/netlify/build/commit/0df38c0f2ccbd779296acf1fbc549cb08a119799))

## [6.6.1](https://github.com/netlify/build/compare/build-info-v6.6.0...build-info-v6.6.1) (2023-03-13)


### Bug Fixes

* improve grammar and typos in comments ([#4922](https://github.com/netlify/build/issues/4922)) ([2e9d9c0](https://github.com/netlify/build/commit/2e9d9c06134f125aaf17bbbca0937cf43d3abae6))

## [6.6.0](https://github.com/netlify/build/compare/build-info-v6.5.1...build-info-v6.6.0) (2023-03-07)


### Features

* use dev cycle feature flagging ([#4919](https://github.com/netlify/build/issues/4919)) ([bddb57f](https://github.com/netlify/build/commit/bddb57faa0229cd51b3303544309bfa1f1df07c4))

## [6.5.0](https://github.com/netlify/build/compare/build-info-v6.4.0...build-info-v6.5.0) (2023-03-02)


### Features

* add bugsnag error reporting for netlify/build-info ([#4905](https://github.com/netlify/build/issues/4905)) ([2109d29](https://github.com/netlify/build/commit/2109d2992bfdc555f92c6bfc49f9be6abed18422))

## [6.4.0](https://github.com/netlify/build/compare/build-info-v6.3.1...build-info-v6.4.0) (2023-03-01)


### Features

* add feature flagging possibility to build-info ([#4897](https://github.com/netlify/build/issues/4897)) ([a81c24e](https://github.com/netlify/build/commit/a81c24e9547232f17e77c574ba3b5946459df600))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.3 to ^9.8.4

## [6.3.0](https://github.com/netlify/build/compare/build-info-v6.2.3...build-info-v6.3.0) (2023-02-17)


### Features

* make build-info browser compatible ([#4869](https://github.com/netlify/build/issues/4869)) ([a1d247f](https://github.com/netlify/build/commit/a1d247f938ba4e5d150813e73835cbc91fa70fdd))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.8.1 to ^9.8.2

## [6.2.0](https://github.com/netlify/build/compare/build-info-v6.1.4...build-info-v6.2.0) (2023-02-01)


### Features

* add detection for nix build system ([#4818](https://github.com/netlify/build/issues/4818)) ([e3c99a7](https://github.com/netlify/build/commit/e3c99a73194a7d06892bd62f48fd247fecef7032))

## [6.1.4](https://github.com/netlify/build/compare/build-info-v6.1.3...build-info-v6.1.4) (2023-01-18)


### Bug Fixes

* correctly set repository in package.json files ([#4825](https://github.com/netlify/build/issues/4825)) ([f2612d6](https://github.com/netlify/build/commit/f2612d61e14ee2d9976a5ec37698976ac4331ad1))


### Dependencies

* The following workspace dependencies were updated
  * dependencies
    * @netlify/framework-info bumped from ^9.7.0 to ^9.7.1

## [6.1.1](https://github.com/netlify/build/compare/build-info-v6.1.0...build-info-v6.1.1) (2022-12-14)


### Bug Fixes

* separate detectBuildsystems and listFrameworks ([#4766](https://github.com/netlify/build/issues/4766)) ([7f4a2fa](https://github.com/netlify/build/commit/7f4a2faa1b28ecdd2b7d6128a47bf8e0f4a27ad6))

## [6.1.0](https://github.com/netlify/build/compare/build-info-v6.0.8...build-info-v6.1.0) (2022-12-13)


### Features

* add build system detection ([#4763](https://github.com/netlify/build/issues/4763)) ([73bdb7b](https://github.com/netlify/build/commit/73bdb7bed7347cf6a8c4d729142c322297a0dce8))

## [6.0.8](https://github.com/netlify/build/compare/build-info-v6.0.7...build-info-v6.0.8) (2022-12-12)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^9.5.3 ([#4759](https://github.com/netlify/build/issues/4759)) ([53ceb57](https://github.com/netlify/build/commit/53ceb57c05c1498c5dfe77269f3730fcdff9a7c6))

## [6.0.7](https://github.com/netlify/build/compare/build-info-v6.0.6...build-info-v6.0.7) (2022-12-06)


### Bug Fixes

* gracefully handle crashing framework info ([#4742](https://github.com/netlify/build/issues/4742)) ([9d0b1ac](https://github.com/netlify/build/commit/9d0b1aca2d355c48a0dbc21a660547b0e19b5ad7))

## [6.0.6](https://github.com/netlify/build/compare/build-info-v6.0.5...build-info-v6.0.6) (2022-11-30)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^9.5.2 ([#4729](https://github.com/netlify/build/issues/4729)) ([6d4b0cb](https://github.com/netlify/build/commit/6d4b0cbf734dd8b2ee7310e107cd4d2425047b41))

## [6.0.5](https://github.com/netlify/build/compare/build-info-v6.0.4...build-info-v6.0.5) (2022-11-23)


### Bug Fixes

* fixes an issue where the package manager detection is not working for yarn nested repositories ([#4718](https://github.com/netlify/build/issues/4718)) ([4884445](https://github.com/netlify/build/commit/4884445b9a0c9159f7a83d53cb845742ba2fb247))

## [6.0.4](https://github.com/netlify/build/compare/build-info-v6.0.3...build-info-v6.0.4) (2022-11-17)


### Bug Fixes

* **deps:** update dependency @netlify/edge-bundler to v4.1.0 ([#4696](https://github.com/netlify/build/issues/4696)) ([f7044e0](https://github.com/netlify/build/commit/f7044e013804096dfb61ba0459226ff6d702ddf3))

## [6.0.3](https://github.com/netlify/build/compare/build-info-v6.0.2...build-info-v6.0.3) (2022-11-07)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^9.5.0 ([#4677](https://github.com/netlify/build/issues/4677)) ([1959fed](https://github.com/netlify/build/commit/1959fed93522c8d2e8ae49cdb337b1941eb9aebe))

## [6.0.2](https://github.com/netlify/build/compare/build-info-v6.0.1...build-info-v6.0.2) (2022-11-01)


### Bug Fixes

* pin framework-info package to 9.4.0 ([#4664](https://github.com/netlify/build/issues/4664)) ([88a969e](https://github.com/netlify/build/commit/88a969ec4a29c7c6f3e867762fee3a48eb305408))

## [6.0.1](https://github.com/netlify/build/compare/build-info-v6.0.0...build-info-v6.0.1) (2022-10-28)


### Bug Fixes

* add missing dependency yaml ([#4660](https://github.com/netlify/build/issues/4660)) ([ecc83cc](https://github.com/netlify/build/commit/ecc83ccee9d3ac662f955a800e89b4d6da5a3999))

## [6.0.0](https://github.com/netlify/build/compare/build-info-v5.1.1...build-info-v6.0.0) (2022-10-27)


### ⚠ BREAKING CHANGES

* add packageManger information + make jsWorkspace packagePaths relative (#4643)

### Features

* add packageManger information + make jsWorkspace packagePaths relative ([#4643](https://github.com/netlify/build/issues/4643)) ([1b4eed8](https://github.com/netlify/build/commit/1b4eed81cff9cdebc6c848476860835318afb7b8))

## [5.1.1](https://github.com/netlify/build/compare/build-info-v5.1.0...build-info-v5.1.1) (2022-10-19)


### Bug Fixes

* **build,build-info,config:** enforce yargs version 17.6.0 as prior version do not support ESM ([#4641](https://github.com/netlify/build/issues/4641)) ([80c8558](https://github.com/netlify/build/commit/80c85581bd2bcc4a0dc05f8eeb1ffe77733fdf27))

## [5.1.0](https://github.com/netlify/build/compare/build-info-v5.0.0...build-info-v5.1.0) (2022-10-18)


### Features

* add proper types for @netlify/build-info ([#4611](https://github.com/netlify/build/issues/4611)) ([444fdb5](https://github.com/netlify/build/commit/444fdb5e214921dfbe6c29d94ba500a431820cbd))


### Bug Fixes

* run tsc -w if user runs ava -w ([#4601](https://github.com/netlify/build/issues/4601)) ([ebcc8a8](https://github.com/netlify/build/commit/ebcc8a86bc5324ab6c5450fbe396073215aaac6c))

## [5.0.0](https://github.com/netlify/build/compare/build-info-v4.0.11...build-info-v5.0.0) (2022-10-11)


### ⚠ BREAKING CHANGES

* drop node 12 support as it already reached EOL (#4599)

### Bug Fixes

* drop node 12 support as it already reached EOL ([#4599](https://github.com/netlify/build/issues/4599)) ([98d0d1e](https://github.com/netlify/build/commit/98d0d1e4db479fb9bb3a529de590f89aef7dd223))

## [4.0.11](https://github.com/netlify/build/compare/build-info-v4.0.10...build-info-v4.0.11) (2022-10-10)


### Bug Fixes

* move build-info to mono repository of netlify build ([#4584](https://github.com/netlify/build/issues/4584)) ([e058b6d](https://github.com/netlify/build/commit/e058b6d8ecb5c59cb63bca266912b96dcc519f92))

### [4.0.10](https://github.com/netlify/build-info/compare/v4.0.9...v4.0.10) (2022-02-21)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^9.0.2 ([#332](https://github.com/netlify/build-info/issues/332)) ([ee4d3a9](https://github.com/netlify/build-info/commit/ee4d3a98fe320fa7b401790bd3e73bb38f87fe12))

### [4.0.9](https://github.com/netlify/build-info/compare/v4.0.8...v4.0.9) (2022-02-21)


### Bug Fixes

* **deps:** update dependency @npmcli/map-workspaces to v2.0.1 ([#330](https://github.com/netlify/build-info/issues/330)) ([85ab0d0](https://github.com/netlify/build-info/commit/85ab0d09c50a200e4792fa52b71e8846e8c70826))
* **deps:** update dependency read-pkg to v7.1.0 ([#328](https://github.com/netlify/build-info/issues/328)) ([394b842](https://github.com/netlify/build-info/commit/394b842760d355292c67ca5114885c86e3a0dd11))

### [4.0.8](https://github.com/netlify/build-info/compare/v4.0.7...v4.0.8) (2022-02-07)


### Bug Fixes

* **deps:** update dependency read-pkg to v7 ([#323](https://github.com/netlify/build-info/issues/323)) ([9929594](https://github.com/netlify/build-info/commit/99295941729a06fdd4e507b37bd82dc97729efb2))

### [4.0.7](https://github.com/netlify/build-info/compare/v4.0.6...v4.0.7) (2022-01-19)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to v9 ([#312](https://github.com/netlify/build-info/issues/312)) ([db76158](https://github.com/netlify/build-info/commit/db761582372e5992c7441d6152d872a87884339b))

### [4.0.6](https://github.com/netlify/build-info/compare/v4.0.5...v4.0.6) (2022-01-17)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^8.0.2 ([#307](https://github.com/netlify/build-info/issues/307)) ([c36bde6](https://github.com/netlify/build-info/commit/c36bde6921246f62e14670ce602f7fc559faf1f2))

### [4.0.5](https://github.com/netlify/build-info/compare/v4.0.4...v4.0.5) (2022-01-13)


### Bug Fixes

* **deps:** update dependency @npmcli/map-workspaces to v2 ([#301](https://github.com/netlify/build-info/issues/301)) ([9a6c9a0](https://github.com/netlify/build-info/commit/9a6c9a00257c95d89f96d4abb99e4678f3349ddb))

### [4.0.4](https://github.com/netlify/build-info/compare/v4.0.3...v4.0.4) (2022-01-12)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^8.0.1 ([#299](https://github.com/netlify/build-info/issues/299)) ([13e65ed](https://github.com/netlify/build-info/commit/13e65edd0e428f1cb26b065cf0483a8d9b41840e))

### [4.0.3](https://github.com/netlify/build-info/compare/v4.0.2...v4.0.3) (2022-01-10)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to v8 ([#295](https://github.com/netlify/build-info/issues/295)) ([7eb9f3e](https://github.com/netlify/build-info/commit/7eb9f3e9125af63a76cfe97df59a5255fb808dd0))

### [4.0.2](https://www.github.com/netlify/build-info/compare/v4.0.1...v4.0.2) (2021-12-14)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to v7 ([#239](https://www.github.com/netlify/build-info/issues/239)) ([844d91b](https://www.github.com/netlify/build-info/commit/844d91b60d765a28f9e3d001b7853de063b975d6))

### [4.0.1](https://www.github.com/netlify/build-info/compare/v4.0.0...v4.0.1) (2021-12-06)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^6.1.0 ([#222](https://www.github.com/netlify/build-info/issues/222)) ([ee85866](https://www.github.com/netlify/build-info/commit/ee8586670fbe0edb4f621aeddc1d54a4765cb527))

## [4.0.0](https://www.github.com/netlify/build-info/compare/v3.0.1...v4.0.0) (2021-11-29)


### ⚠ BREAKING CHANGES

* use pure ES modules (#208)

### Miscellaneous Chores

* use pure ES modules ([#208](https://www.github.com/netlify/build-info/issues/208)) ([36fad7c](https://www.github.com/netlify/build-info/commit/36fad7ce68bacda5741f6c20a40675fde736a595))

### [3.0.1](https://www.github.com/netlify/build-info/compare/v3.0.0...v3.0.1) (2021-11-24)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to v6 ([#206](https://www.github.com/netlify/build-info/issues/206)) ([09d9005](https://www.github.com/netlify/build-info/commit/09d9005c0749764aa31bd7f4812994e54a310ba6))

## [3.0.0](https://www.github.com/netlify/build-info/compare/v2.0.18...v3.0.0) (2021-11-24)


### ⚠ BREAKING CHANGES

* drop support for Node 10 (#204)

### Miscellaneous Chores

* drop support for Node 10 ([#204](https://www.github.com/netlify/build-info/issues/204)) ([637f1f7](https://www.github.com/netlify/build-info/commit/637f1f7d45eca1cffbf94dd3e76314f004a9e0b3))

### [2.0.18](https://www.github.com/netlify/build-info/compare/v2.0.17...v2.0.18) (2021-10-11)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.11.0 ([#177](https://www.github.com/netlify/build-info/issues/177)) ([67e256a](https://www.github.com/netlify/build-info/commit/67e256a4bbac039d80fb5ed877b559b74275be5e))

### [2.0.17](https://www.github.com/netlify/build-info/compare/v2.0.16...v2.0.17) (2021-09-20)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.9.2 ([#163](https://www.github.com/netlify/build-info/issues/163)) ([f19297c](https://www.github.com/netlify/build-info/commit/f19297c2b38a84b233f1fbee5cd3e7016573dfe4))

### [2.0.16](https://www.github.com/netlify/build-info/compare/v2.0.15...v2.0.16) (2021-08-18)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.7.3 ([#135](https://www.github.com/netlify/build-info/issues/135)) ([de04907](https://www.github.com/netlify/build-info/commit/de04907e3f5a3533b0ab127b88abad2f4482b099))
* **deps:** update dependency @netlify/framework-info to ^5.8.0 ([#137](https://www.github.com/netlify/build-info/issues/137)) ([a22028d](https://www.github.com/netlify/build-info/commit/a22028d536f6f223a08327018bebc77a87c5b914))
* **deps:** update dependency @netlify/framework-info to ^5.9.0 ([#145](https://www.github.com/netlify/build-info/issues/145)) ([8b3b681](https://www.github.com/netlify/build-info/commit/8b3b681b848233fb0b90e7a8c3a0ef340db55fde))
* **deps:** update dependency @netlify/framework-info to ^5.9.1 ([#146](https://www.github.com/netlify/build-info/issues/146)) ([e21ff52](https://www.github.com/netlify/build-info/commit/e21ff52e4b33bbb9106c2878ee27c27a20a74521))
* **deps:** update dependency @npmcli/map-workspaces to v1.0.4 ([#142](https://www.github.com/netlify/build-info/issues/142)) ([a72d70e](https://www.github.com/netlify/build-info/commit/a72d70e8e2b1c58ee15b0abc05c3182b02fe024e))

### [2.0.15](https://www.github.com/netlify/build-info/compare/v2.0.14...v2.0.15) (2021-07-19)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.7.1 ([#124](https://www.github.com/netlify/build-info/issues/124)) ([e421e5f](https://www.github.com/netlify/build-info/commit/e421e5f483bc9dd5cc4433dfdaec4448003c97ea))
* **deps:** update dependency @netlify/framework-info to ^5.7.2 ([#126](https://www.github.com/netlify/build-info/issues/126)) ([6b59bc9](https://www.github.com/netlify/build-info/commit/6b59bc92fdc5226ad3ac43a052e33e42d68c25e5))

### [2.0.14](https://www.github.com/netlify/build-info/compare/v2.0.13...v2.0.14) (2021-07-12)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.7.0 ([#121](https://www.github.com/netlify/build-info/issues/121)) ([657d7c7](https://www.github.com/netlify/build-info/commit/657d7c757eeffc6ffb3180715c0f738d6f01e0c1))

### [2.0.13](https://www.github.com/netlify/build-info/compare/v2.0.12...v2.0.13) (2021-07-11)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.6.1 ([#118](https://www.github.com/netlify/build-info/issues/118)) ([38cb6e0](https://www.github.com/netlify/build-info/commit/38cb6e043a66e0f2986aa755f290b98b97c418ec))

### [2.0.12](https://www.github.com/netlify/build-info/compare/v2.0.11...v2.0.12) (2021-07-05)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.6.0 ([#116](https://www.github.com/netlify/build-info/issues/116)) ([945872e](https://www.github.com/netlify/build-info/commit/945872e579040c92e7f23ada8ba46916b4c7d6b3))

### [2.0.11](https://www.github.com/netlify/build-info/compare/v2.0.10...v2.0.11) (2021-06-30)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.5.0 ([#111](https://www.github.com/netlify/build-info/issues/111)) ([036143a](https://www.github.com/netlify/build-info/commit/036143a293c208da05bfc7ba0c84c7e7e1731ba1))

### [2.0.10](https://www.github.com/netlify/build-info/compare/v2.0.9...v2.0.10) (2021-06-27)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.4.0 ([#106](https://www.github.com/netlify/build-info/issues/106)) ([a898051](https://www.github.com/netlify/build-info/commit/a8980511c75d1431ab76b50440cb250673f0fde2))

### [2.0.9](https://www.github.com/netlify/build-info/compare/v2.0.8...v2.0.9) (2021-06-15)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.3.0 ([#102](https://www.github.com/netlify/build-info/issues/102)) ([9d8fbd8](https://www.github.com/netlify/build-info/commit/9d8fbd8ea6c54d6571ca2021cbd43ce982582457))

### [2.0.8](https://www.github.com/netlify/build-info/compare/v2.0.7...v2.0.8) (2021-06-13)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.2.0 ([#98](https://www.github.com/netlify/build-info/issues/98)) ([8a1a775](https://www.github.com/netlify/build-info/commit/8a1a7757890807ed07040da665f31e6d3812690e))

### [2.0.7](https://www.github.com/netlify/build-info/compare/v2.0.6...v2.0.7) (2021-06-07)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.1.4 ([#94](https://www.github.com/netlify/build-info/issues/94)) ([5289273](https://www.github.com/netlify/build-info/commit/5289273ed7c160e9517cf0c79d0cd49db89e7d96))

### [2.0.6](https://www.github.com/netlify/build-info/compare/v2.0.5...v2.0.6) (2021-06-02)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.1.3 ([#88](https://www.github.com/netlify/build-info/issues/88)) ([44d22e9](https://www.github.com/netlify/build-info/commit/44d22e95b567eed3a71481fcea933e4e1b910bf3))

### [2.0.5](https://www.github.com/netlify/build-info/compare/v2.0.4...v2.0.5) (2021-05-31)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.1.2 ([#86](https://www.github.com/netlify/build-info/issues/86)) ([4d45c54](https://www.github.com/netlify/build-info/commit/4d45c54724f30647ea971b83e3f3624a3b99b703))

### [2.0.4](https://www.github.com/netlify/build-info/compare/v2.0.3...v2.0.4) (2021-05-31)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.1.1 ([#84](https://www.github.com/netlify/build-info/issues/84)) ([9d02106](https://www.github.com/netlify/build-info/commit/9d02106b99d6618750903ec7a94148782d6c0fcd))

### [2.0.3](https://www.github.com/netlify/build-info/compare/v2.0.2...v2.0.3) (2021-05-31)


### Bug Fixes

* **deps:** update dependency yargs to v16 ([#82](https://www.github.com/netlify/build-info/issues/82)) ([b1a0682](https://www.github.com/netlify/build-info/commit/b1a068239f9efa6c9c9efcc0db5fc448a3759aab))

### [2.0.2](https://www.github.com/netlify/build-info/compare/v2.0.1...v2.0.2) (2021-05-30)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^5.1.0 ([#73](https://www.github.com/netlify/build-info/issues/73)) ([f4d6039](https://www.github.com/netlify/build-info/commit/f4d60397148d2d7d3620f478bfff67de9687c8f7))

### [2.0.1](https://www.github.com/netlify/build-info/compare/v2.0.0...v2.0.1) (2021-05-27)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to v5 ([#65](https://www.github.com/netlify/build-info/issues/65)) ([64da81e](https://www.github.com/netlify/build-info/commit/64da81ecd9c04817e273bed3fa064db9a0663a7a))

## [2.0.0](https://www.github.com/netlify/build-info/compare/v1.2.3...v2.0.0) (2021-05-27)


### ⚠ BREAKING CHANGES

* drop support for Node.js 8 (#66)

### Miscellaneous Chores

* drop support for Node.js 8 ([#66](https://www.github.com/netlify/build-info/issues/66)) ([9259b05](https://www.github.com/netlify/build-info/commit/9259b05775c58df86637b89b5e4b304a54a81133))

### [1.2.3](https://www.github.com/netlify/build-info/compare/v1.2.2...v1.2.3) (2021-05-11)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^4.1.0 ([#53](https://www.github.com/netlify/build-info/issues/53)) ([3c3862f](https://www.github.com/netlify/build-info/commit/3c3862f34654f1dee8b690a377a08d3f1b2dd8d6))

### [1.2.2](https://www.github.com/netlify/build-info/compare/v1.2.1...v1.2.2) (2021-05-09)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to ^4.0.1 ([#48](https://www.github.com/netlify/build-info/issues/48)) ([b24c5d7](https://www.github.com/netlify/build-info/commit/b24c5d7634c5ca38717e9d5f4a42b7cc3c19bb5b))

### [1.2.1](https://www.github.com/netlify/build-info/compare/v1.2.0...v1.2.1) (2021-04-27)


### Bug Fixes

* **deps:** update dependency @netlify/framework-info to v4 ([#44](https://www.github.com/netlify/build-info/issues/44)) ([b5d862f](https://www.github.com/netlify/build-info/commit/b5d862fd5caae1a28729fbd31ccc303f99e91b87))

## [1.2.0](https://www.github.com/netlify/build-info/compare/v1.1.1...v1.2.0) (2021-04-13)


### Features

* include framework info ([#35](https://www.github.com/netlify/build-info/issues/35)) ([ffbb6ee](https://www.github.com/netlify/build-info/commit/ffbb6ee236345bd158b4a1a3386ad99eeb5b562d))


### Bug Fixes

* **bin:** remove cli rootDir default setting ([#37](https://www.github.com/netlify/build-info/issues/37)) ([9da8022](https://www.github.com/netlify/build-info/commit/9da80226b7d5442cb69168939148c8aa3b77be94))

### [1.1.1](https://www.github.com/netlify/build-info/compare/v1.1.0...v1.1.1) (2021-04-07)


### Bug Fixes

* **context:** make projectDir resolution based on rootDir ([#26](https://www.github.com/netlify/build-info/issues/26)) ([2a965b4](https://www.github.com/netlify/build-info/commit/2a965b4c973c7e3f0867a321422eb40dcfd82926))
* **package.json:** add main entrypoint ([#30](https://www.github.com/netlify/build-info/issues/30)) ([cc55a9e](https://www.github.com/netlify/build-info/commit/cc55a9e6da9a3be6d6a33c74f38ab35796e9e882))

## [1.1.0](https://www.github.com/netlify/build-info/compare/v1.0.0...v1.1.0) (2021-04-05)


### Features

* add binary ([#15](https://www.github.com/netlify/build-info/issues/15)) ([710d4c9](https://www.github.com/netlify/build-info/commit/710d4c9725120400b49181a19078ae4187b521bd))

## 1.0.0 (2021-03-29)


### Features

* detect js workspaces ([#3](https://www.github.com/netlify/build-info/issues/3)) ([0dbf74b](https://www.github.com/netlify/build-info/commit/0dbf74b78cc9b727ff177adda4bae20b4970f96f))
