# Snapshot report for `tests/utils_build/tests.js`

The actual snapshot is saved in `tests.js.snap`.

Generated by [AVA](https://avajs.dev).

## build.failBuild()

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/fail_build␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/fail_build␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/fail_build/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onPreBuild" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin`

## build.failBuild() error option

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/fail_build_error_option␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/fail_build_error_option␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/fail_build_error_option/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build_error_option␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
      innerTest␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onPreBuild" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build_error_option␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin`

## build.failBuild() inside a callback

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/fail_build_callback␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/fail_build_callback␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/fail_build_callback/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build_callback␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
      This exception was thrown but not caught.␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onPreBuild" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build_callback␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin`

## build.failBuild() is not available within post-deploy events

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/fail_build_post_deploy␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/fail_build_post_deploy␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/fail_build_post_deploy/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build_post_deploy␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    ./plugin (onEnd event)                                        ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    Plugin error: since "onEnd" happens after deploy, the build has already succeeded and cannot fail anymore. This plugin should either:␊
    - use utils.build.failPlugin() instead of utils.build.failBuild() to clarify that the plugin failed, but not the build.␊
    - use "onPostBuild" instead of "onEnd" if the plugin failure should make the build fail too. Please note that "onPostBuild" (unlike "onEnd") happens before deploy.␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onEnd" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_build_post_deploy␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    Netlify Build Complete                                        ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    (Netlify Build completed in 1ms)␊
    Build step duration: Netlify Build completed in 1ms`

## build.failPlugin()

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/fail_plugin␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/fail_plugin␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/fail_plugin/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_plugin␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin_two␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin_two@1.0.0 from netlify.toml␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    ./plugin_two (onPreBuild event)                               ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    onPreBuild␊
    ␊
    (./plugin_two onPreBuild completed in 1ms)␊
    Build step duration: ./plugin_two onPreBuild completed in 1ms␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onPreBuild" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_plugin␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin_two␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    ./plugin_two (onBuild event)                                  ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    onBuild␊
    ␊
    (./plugin_two onBuild completed in 1ms)␊
    Build step duration: ./plugin_two onBuild completed in 1ms␊
    ␊
    Netlify Build Complete                                        ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    (Netlify Build completed in 1ms)␊
    Build step duration: Netlify Build completed in 1ms`

## build.failPlugin() inside a callback

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/fail_plugin_callback␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/fail_plugin_callback␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/fail_plugin_callback/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_plugin_callback␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
      This exception was thrown but not caught.␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onPreBuild" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_plugin_callback␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    Netlify Build Complete                                        ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    (Netlify Build completed in 1ms)␊
    Build step duration: Netlify Build completed in 1ms`

## build.failPlugin() error option

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/fail_plugin_error_option␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/fail_plugin_error_option␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/fail_plugin_error_option/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_plugin_error_option␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin_two␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin_two@1.0.0 from netlify.toml␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    ./plugin_two (onPreBuild event)                               ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    onPreBuild␊
    ␊
    (./plugin_two onPreBuild completed in 1ms)␊
    Build step duration: ./plugin_two onPreBuild completed in 1ms␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
      innerTest␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onPreBuild" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/fail_plugin_error_option␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin_two␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    ./plugin_two (onBuild event)                                  ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    onBuild␊
    ␊
    (./plugin_two onBuild completed in 1ms)␊
    Build step duration: ./plugin_two onBuild completed in 1ms␊
    ␊
    Netlify Build Complete                                        ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    (Netlify Build completed in 1ms)␊
    Build step duration: Netlify Build completed in 1ms`

## build.cancelBuild()

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Build canceled by ./plugin                                    ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      test␊
    `

## build.cancelBuild() inside a callback

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel_callback␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel_callback␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel_callback/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel_callback␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Build canceled by ./plugin                                    ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      test␊
      This exception was thrown but not caught.␊
    `

## build.cancelBuild() error option

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel_error_option␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel_error_option␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel_error_option/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel_error_option␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Build canceled by ./plugin                                    ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      test␊
      innerTest␊
    `

## build.cancelBuild() API call

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      deployId: test␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel␊
      testOpts:␊
        host: /test/socket␊
        pluginsListUrl: test␊
        scheme: http␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Build canceled by ./plugin                                    ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      test␊
    `

> Snapshot 2

    [
      {
        body: '',
        headers: 'accept accept-encoding authorization connection content-length host user-agent',
        method: 'POST',
        url: '/api/v1/deploys/test/cancel',
      },
    ]

## build.cancelBuild() API call no DEPLOY_ID

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel␊
      testOpts:␊
        host: /test/socket␊
        pluginsListUrl: test␊
        scheme: http␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Build canceled by ./plugin                                    ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      test␊
    `

## build.cancelBuild() API call no token

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      deployId: test␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel␊
      testOpts:␊
        host: /test/socket␊
        pluginsListUrl: test␊
        scheme: http␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    Build canceled by ./plugin                                    ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      test␊
    `

## build.cancelBuild() API call failure

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      deployId: test␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel␊
      testOpts:␊
        env: true␊
        host: ...␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    API error on "cancelSiteDeploy"                               ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      request to https://.../api/v1.0.0/deploys/test/cancel failed, reason: getaddrinfo ENOTFOUND ...␊
    ␊
      Error location␊
      While calling the Netlify API endpoint 'cancelSiteDeploy' with:␊
      {␊
        "deploy_id": "test"␊
      }␊
    ␊
      Error properties␊
      {␊
        type: 'system',␊
        errno: 'ENOTFOUND',␊
        code: 'ENOTFOUND',␊
        erroredSysCall: 'getaddrinfo',␊
        url: 'https://.../api/v1.0.0/deploys/test/cancel',␊
        data: {␊
          method: 'POST',␊
          headers: {␊
            accept: 'application/json',␊
            Authorization: 'Bearer test',␊
            'User-agent': 'netlify/js-client'␊
          }␊
        }␊
      }␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin`

## build.cancelBuild() is not available within post-deploy events

> Snapshot 1

    `␊
    Netlify Build                                                 ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    > Version␊
      @netlify/build 1.0.0␊
    ␊
    > Flags␊
      debug: true␊
      repositoryRoot: packages/build/tests/utils_build/fixtures/cancel_post_deploy␊
      testOpts:␊
        pluginsListUrl: test␊
        silentLingeringProcesses: true␊
    ␊
    > Current directory␊
      packages/build/tests/utils_build/fixtures/cancel_post_deploy␊
    ␊
    > Config file␊
      packages/build/tests/utils_build/fixtures/cancel_post_deploy/netlify.toml␊
    ␊
    > Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel_post_deploy␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    > Context␊
      production␊
    ␊
    > Loading plugins␊
       - ./plugin@1.0.0 from netlify.toml␊
    ␊
    ./plugin (onEnd event)                                        ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    Plugin error: since "onEnd" happens after deploy, the build has already succeeded and cannot fail anymore. This plugin should either:␊
    - use utils.build.failPlugin() instead of utils.build.cancelBuild() to clarify that the plugin failed, but not the build.␊
    - use "onPostBuild" instead of "onEnd" if the plugin failure should make the build fail too. Please note that "onPostBuild" (unlike "onEnd") happens before deploy.␊
    ␊
    Plugin "./plugin" failed                                      ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
      Error message␊
      Error: test␊
    ␊
      Plugin details␊
      Package:        ./plugin␊
      Version:        1.0.0␊
      Repository:     git+https://github.com/netlify/build.git␊
      Report issues:  https://github.com/netlify/build/issues␊
    ␊
      Error location␊
      In "onEnd" event in "./plugin" from netlify.toml␊
    STACK TRACE␊
    ␊
      Resolved config␊
      build:␊
        publish: packages/build/tests/utils_build/fixtures/cancel_post_deploy␊
        publishOrigin: default␊
      plugins:␊
        - inputs: {}␊
          origin: config␊
          package: ./plugin␊
    ␊
    Netlify Build Complete                                        ␊
    ────────────────────────────────────────────────────────────────␊
    ␊
    (Netlify Build completed in 1ms)␊
    Build step duration: Netlify Build completed in 1ms`
