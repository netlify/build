# Changelog

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
