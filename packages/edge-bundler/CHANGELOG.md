# Changelog

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
