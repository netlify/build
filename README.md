# Netlify Build (WIP)

Netlify build is the next generation of CI/CD tooling for modern web applications.

We have fully synchronized the Netlify build experience across the board, giving users a the same build pipeline they know & love in Netlify directly on their local machines.

Whether you are building your site locally with `netlify build` or through git commits in Netlify, developers have access to a powerful set of build features.

**Netlify Build** is flexible & build to support any kind of build flow. It is extendable to fit your unique project requirements.

## Design principles

- Extendable core
- Modular components
- Works in CI/CD & local context

##  Requirements

- Must be backwards compatible with existing site builds
- Builds must be cancellable
- Builds must be fast [ref](https://github.com/netlify/build-image/issues/141)
- Builds must handle git + zip/tar/etc builds
- Builds must support [mono-repos](https://github.com/netlify/product/issues/121), [related](https://github.com/netlify/buildbot/pull/309), [ref](https://github.com/netlify/build-image/issues/141)
- Builds must allow [dynamic configuration resolution](https://github.com/netlify/netlify-config)
- Builds should be extendable via plugins
- Build image must have preinstalled `netlify-cli` with prepopulated auth keys
- Improve overall DX [ref](https://github.com/netlify/buildbot/issues/125)
- Builds must account for add-on provisioning/updating

## Ops

Ideal ops state:

- Isolated build environments
- Multi-region failover
- Pro-active alerting
- Configurable log retention

## Logging behavior

- Build Logs will not publicly visible by default (security vector). Users can opt in for public logs

## About

Build steps are codified in the Netlify UI or via `netlify` config file this gives us a version controlled build system of immutable deployments.

```
(Example code WIP)
```

## Lifecycle

Builds typically have a lifecycle associated with them.

What follows is the Netlify build lifecycle:

`configParse`
Parse `netlify.toml` and resolve any dynamic configuration include build image if specified

`getCache`
Fetch previous build cache

`install`
Install project dependancies

`build`
Build project

`package`
Create build artifact

`deploy`
Deploy built artifact

`saveCache`
Save cached assets

`manifest`
Outputs manifest of resources created

`finally`
Last step in deployment chain

These lifecycle hooks are how users, add-ons, and internal products can extend the functionality of the **Netlify Build** process.

WIP flow

<img width="813" alt="wip-build-flow" src="https://user-images.githubusercontent.com/532272/60057812-bb1ed200-969a-11e9-9721-2d606a4ed027.png">

## Build Environment

This section describes the netlify build environment.

### Directories

`.netlify`
`.netlify/src` - Source code from repo, zip, tar
`.netlify/cache` - Files persisted across builds
`.netlify/cache/dependancies` - All dependancies are cache here. These are used for lookup / install process.
`.netlify/build` - Built files

### Environment variables

The build environment variables should be codified and used to automatically populate the [docs page](https://www.netlify.com/docs/continuous-deployment/#environment-variables).

List TBH. Backwards compatible

## Open questions

- Context overhaul. How will stages work?
- Isolated build images for stages? re: actions/codePipeline
- Parallel Step execution?
- Canary deployments?

## CLI Commands

Run the build

```
netlify build
```

Test out the build flow. This will output everything that happens in the build flow without executing the commands

```
netlify build --dry-run
```

## References & research

- [Travis](https://docs.travis-ci.com/user/job-lifecycle)
- [AWS codeBuild](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html#build-spec-ref-syntax)
- [GCP cloudBuild](https://cloud.google.com/cloud-build/docs/configuring-builds/create-basic-configuration) [video](https://www.youtube.com/watch?v=iyGHW4UQ_Ts)
- [Circle CI](https://circleci.com/docs/2.0/sample-config/#sample-configuration-with-sequential-workflow)
- [Codeship CI](https://documentation.codeship.com/pro/builds-and-configuration/steps/#parallelizing-steps-and-tests)
- [Github Actions](https://help.github.com/en/articles/creating-a-workflow-with-github-actions)
- [Gitlab CI](https://docs.gitlab.com/ee/user/project/pages/getting_started_part_four.html)
- [CI tool ecosystem](https://github.com/ligurio/awesome-ci)
- [Custom hooks](https://www.npmjs.com/package/serverless-scriptable-plugin)

## Notes

- [Allow for variables before deployment](https://community.netlify.com/t/variable-setting-before-deploy/1416) [ref](https://github.com/netlify/buildbot/issues/320 )
- [Fix auto publishing issues](https://netlify.slack.com/archives/CJNDNPXEC/p1561433292306900)
- [Fix local testing issues](https://github.com/netlify/build-image/issues/273)
- [Fix development process](https://github.com/netlify/buildbot/issues/345)

## Future

- BYOImage. [ref](https://github.com/netlify/netlify-react-ui/issues/2386)
- [Allow for scheduled builds](https://github.com/netlify/product/issues/81)
