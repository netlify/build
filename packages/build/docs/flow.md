# Build flow

## Buildbot

Flow when a build is triggered, from a buildbot standpoint:

- [The Bitballoon API](https://github.com/netlify/bitballoon) sends a
  [build payload](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/messages/cmd_data.go#L12)
  to [the buildbot](https://github.com/netlify/buildbot).
- The buildbot
  [parses that payload](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/cmd/build_cmd.go#L72)
  then starts the
  [build logic](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/bot/buildbot.go#L64).
- Multiple
  [build stages](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/bot/buildbot.go#L227)
  are run serially.
- One those stages is
  [calling the `@netlify/config` binary](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/bot/configuration.go#L119),
  which [resolves the Netlify configuration](https://github.com/netlify/build/blob/main/packages/config/README.md).
- [The build information](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/bot/stage_build.go#L95)
  (Netlify configuration, build payload, feature flags, etc.) is passed to
  [a Bash script](https://github.com/netlify/buildbot/blob/master/script/run-build.sh).
- That Bash script
  [executes](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/script/run-build.sh#L54)
  the logic [from the `build-image`](https://github.com/netlify/build-image), specially
  [the `run-build-functions.sh` file](https://github.com/netlify/build-image/blob/focal/run-build-functions.sh). That
  file mostly installs site dependencies, including
  [the Node.js binary](https://github.com/netlify/build-image/blob/195fbe127e5c374d9c4758652cb62e3b8936a395/run-build-functions.sh#L270)
  and
  [modules](https://github.com/netlify/build-image/blob/195fbe127e5c374d9c4758652cb62e3b8936a395/run-build-functions.sh#L173).
- [Netlify Build is called](https://github.com/netlify/buildbot/blob/b6c6fc159f077f5dbda69ceb17363960232243fe/script/run-build.sh#L66).
  This runs the build command, Build plugins, Functions bundling and site deploy.
- The buildbot exits and the backend runs some post-build logic, such as assets optimization.

## Netlify Build

### Flow

Flow when a build is triggered, from a Netlify Build standpoint:

- Initialize
  [monitoring timers](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/time/main.js#L7).
- Load and normalize
  [the CLI flags](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/normalize_flags.js#L9).
  - Including the
    [user's Node.js version](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/user_node_version.js#L18)
    used for the build command and plugins.
- Load the
  [Netlify configuration](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/config.js#L107).
- Load the
  [site's `package.json`](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/config.js#L82).
- Compute
  [the `constants`](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/constants.js#L10)
  passed to Build plugins.
  - Note: some of those
    [are re-computed](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/constants.js#L61)
    when a plugin updates the Netlify configuration.
- [Compute the list of plugins](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins/options.js#L13)
  expected to run and their configuration. The plugins
  [processes](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins/spawn.js#L20)
  are all spawned in parallel, for performance reason. They are
  [then loaded](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins/load.js#L9)
  but not run yet.
- Each build step
  [is run one by one](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/steps/run_steps.js#L14):
  build command, Build plugins, Functions bundling, site deploy.
- [Some post-build warnings](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/main.js#L536)
  are potentially logged, such
  [as lingering processes](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/lingering.js#L21).
- [Some build results](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/core/main.js#L375)
  are reported to the API, such as
  [plugin statuses](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/status/report.js#L7)
  and
  [major versions](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins/pinned_version.js#L41).
- [Monitoring timers are sent](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/time/report.js#L13)
  to Datadog.
- [A telemetry request](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/telemetry/main.js#L18)
  is sent as well.

### Build steps

Build steps are either core steps or build plugins.

#### Core steps

Each
["core step"](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/steps/core_step.js#L7)
declares a
[set of properties](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins_core/build_command.js#L68),
such as its event, name, main function, an optional condition, etc.

Current core steps are:

- The
  [build command](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins_core/build_command.js#L11).
- [Functions bundling](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins_core/functions/index.js#L142),
  which uses [`zip-it-and-ship-it`](https://github.com/netlify/zip-it-and-ship-it).
- Secrets Scanning only runs when the account passes non-empty explicitSecretKeys, or when the account has
  enhancedSecretScan enabled (only applies to certain plan types).
- [Site deploy](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins_core/deploy/index.js#L66):
  - This sends a network request to the buildbot to initiate site deploy.
  - When the buildbot
    [receives that event](https://github.com/netlify/buildbot/blob/9da271052159db19d168d450e832390b93ca1300/deployserver/deploy_server.go#L107),
    it forwards it to the Bitballoon API.
  - This flow allows Netlify Build to run some logic after the site has been deployed, specifically Build plugins logic
    in the `onSuccess` event.

#### Build plugins

[A build plugin](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/steps/plugin.js#L11)
is selected and configured either by:

- Users ("user plugin")
- System logic ("core plugin")

Core plugins:

- We want to remove that concept and
  [replace it with "core steps" only](https://github.com/netlify/pillar-workflow/issues/113).
- At the moment, there are only two core plugins, which are planned to be removed:
  - The [Edge handlers core plugin](https://github.com/netlify/pillar-workflow/issues/113) is currently being replaced
    by some new logic which will not be a plugin.
  - The
    [Functions install core plugin](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/build/src/plugins_core/functions_install/index.js#L6)
    is [deprecated](https://github.com/netlify/pillar-workflow/issues/216).

#### Order

Build steps are run serially.
[Event names](https://github.com/netlify/build/blob/9b261a6182e1ba6853966bd8d0bde9064209af7d/packages/config/src/events.js#L1)
are used to order build steps with each other.

- `onPreBuild`: before the build command.
- `onBuild`: after the build command, but before Functions bundling.
- `onPostBuild`: after Functions bundling, but before site deploy.
- `onSuccess`: when the build succeeds, i.e. after site deploy.
- `onError`: when the build fails.
- `onEnd`: when the build either succeeds or fails.

When a build step fails, it usually interrupts the whole flow and make the build fail. There are a few exceptions:

- When a plugin calls `utils.build.failPlugin()`, the plugin
  [stops running but not the build](https://github.com/netlify/build/blob/0d9058cb5538a74b7819fd8962145f781fe09db0/packages/build/src/steps/run_step.js#L193).
- This also happens
  [when an error happens during after site deploy](https://github.com/netlify/build/blob/0d9058cb5538a74b7819fd8962145f781fe09db0/packages/build/src/steps/error.js#L36),
  e.g. in `onSuccess`, `onError` or `onEnd`.
