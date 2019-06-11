# Netlify Build

Netlify build is the next generation of CI/CD tooling for modern web applications.

We have fully synchronized the Netlify build experience across the board, giving users a the same build pipeline directly on their local machines.

Whether you are building your site locally with `netlify build` or through git commits in Netlify, developers have access to a powerful set of build features.

Netlify Build is flexible enough for any kind of build setup & is extendable to fit your unique project requirements.

##  Requirements

- must be backwards compatible with existing site builds
- Builds must be cancellable
- Builds must be fast
- Builds must handle git + zip builds
- Builds must account for add-on provisioning/updating

## About

Build steps are codified in the Netlify UI or via `netlify` config file this gives us a version controlled build system of immutable deployments.

```
(Example code)
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

These lifecycle hooks are how users, addons, and internal products can extend the functionality of the build process.

## Open questions

- Context overhaul. How will stages work?
- Parallel Step execution?
- Canary deployments

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
