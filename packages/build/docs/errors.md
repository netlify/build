# Errors in Netlify Build

## Error handling

### Strictness

Netlify Build error handling is strict and errs towards failing builds. Deploying a site even when it has build issues
leads to bigger problems for users than failing a build.

### Throwing errors

Errors are reported by throwing error instances. Netlify Build does not use different error classes. Instead, error
types and information are using an `error.customErrorInfo` object property. That property is get and set using
[helper functions](https://github.com/netlify/build/blob/558fe8869f47ecc84d05bd4d26d32df00f47a3b9/packages/build/src/error/info.js#L1).

Examples:

- [Throwing a new error](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/core/user_node_version.js#L35-L37)
- [Wrapping an error with a specific type](https://github.com/netlify/build/blob/0fd5d1fea070a7b1af2bbe40e11093da04b2efae/packages/build/src/plugins/child/validate.js#L18)
- [Wrapping an error with additional information](https://github.com/netlify/build/blob/91c4293dbcf31baa2d568f6b2bbfc463fbb3bae8/packages/build/src/plugins/manifest/load.js#L17-L21)

### Catching errors

Every function which might throw should be wrapped in a `try`/`catch` block to add the proper type and information.

The Bitballoon API client
[is automatically wrapped](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/api.js#L7).

It is critical to handle any potential exception inside the error handling logic itself. Otherwise, it would never be
reported.

### Top-level handler

Errors are propagated to the top of the logic, reaching
[a top-level `try`/`catch` block](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/core/main.js#L114)
which:

- Calls the
  [main error handling logic](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/handle.js#L14).
- Fails the build, setting the exit code based on
  [the error's severity](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/core/severity.js#L3)
  (user/plugin/system)
- Reports the
  [failed build for telemetry purpose](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/telemetry/main.js#L18)
  (which is distinct from error monitoring with Busgnag)

### Non-critical errors

There are a few cases where build errors do not cause the build to fail. In those instances, the same main error
handling logic as above is called so the error is printed in logs, reporting for monitoring, etc. However, the error is
not propagated to prevent the build from failing.

This happens when:

- [A plugin uses `utils.build.failPlugin()`](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/steps/error.js#L73)
  (as opposed to `utils.build.failBuild()`)
- A non-critical request to the Bitballoon API has failed. At the moment, this includes:
  - [Updating the pinned version of a plugin](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/plugins/pinned_version.js#L124)
  - [Reporting that a plugin has completed](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/status/report.js#L126)

### Child process errors

Plugins are run in child processes, but the error handling logic is running in the main parent process. Therefore, child
processes have
[top-level error handling logic](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/plugins/child/error.js#L9)
which sends the error to the parent process using Node.js
[builtin `ipc` mechanism](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/plugins/spawn.js#L42).
The error is
[serialized from/to JSON](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/build.js#L8),
including its stack trace and static properties.

### Irregular error instances

While most libraries throw error instances, some throw weird types: strings, arrays, or error instances without any
`message` or `stack` properties. When handling errors, the current logic normalizes them first
[to take this into account](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/normalize.js#L4).

## Error information

### Error types

Every error should be assigned
[a type](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/type.js#L42).
New error types can be added.

Each error type
[declares a set of properties](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/type.js#L7)
indicating how it should be printed, reported to Bugsnag, etc.

Errors without any assigned types are assigned a default type
[reserved for system bugs](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/type.js#L181-L182).

### Severity

Every error type has a
[specific severity level](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/core/severity.js#L3).
That severity level is used to determine:

- Whether the build should fail, and with which exit code
- How to print the error in the build logs
- The
  [severity reported in Bugsnag](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/monitor/report.js#L39)
  (for error monitoring). For example, errors with lower severity might not page nor create alerts.

### Titles

Each error type has
[a main title](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/parse.js#L91)
that is
[printed in the build logs](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/serialize_log.js#L8)
and
[reported to Bugsnag](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/monitor/report.js#L21).

Some of those titles
[are static](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/type.js#L163).
Others take the error's
[location information as input](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/type.js#L67).

### Static properties

If the error instance has static properties, we make sure
[to keep those](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/parse.js#L75),
print them
[to the build logs](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/serialize_log.js#L41).

### Netlify configuration

The
[Netlify configuration](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/log/messages/config.js#L88)
is printed in the build logs on build failures.

### Location

The
[error location](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/location.js#L5)
describes where an error happened.

Depending on the error type, this might include or not the stack trace. For example, user configuration errors do not
include the stack trace, since those are not system bugs.

The location adds additional context specific to the error type such as the build command, the core step name, the
Function being bundled, the plugin name and event, or the API endpoint.

### Plugin information

When the error happens while a plugin is executing, we add some
[information about that plugin](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/plugin.js#L3):
name, version and URLs (repository, issues, npm). This encourages users to report bugs directly to plugin authors.

### TypeScript

When the error happens while a TypeScript is plugin is executing, we
[include the TypeScript configuration](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/plugins/child/typescript.js#L32).

### CLI version

It is common for CLI builds to fail due to the user's Netlify CLI version being outdated. We detect this situation and
[print an error message accordingly](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/log/old_version.js#L12).

## Build logs

### Purpose

Printing rich and human-friendly errors in the build logs allows users to debug their own problems without reaching out
to support. Most build errors are caused by user logic, not bugs on our side. Clearly separating those two allows us to
focus on fixing actual bugs instead of debugging user logic, which is often complicated and time-consuming.

### Human-friendliness

The errors printed in the build logs aim at being easy to discover and read for users. We use some extensive logic to
make it so. We also handle edge cases such
[as removing ANSI sequences](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/colors.js#L4).

Some errors are sent to Bugsnag,
[but not printed to the build logs](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/handle.js#L26),
such as telemetry errors.

### Stack traces

Stack traces are only useful for plugin and system errors, not user errors. Therefore,
[we do not print them then](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/stack.js#L13).

Most errors are caught as JavaScript error instances in the same process, making `error.stack` available. However, some
errors (such as in the build command or when requesting Bitballoon API) are triggered in a different process. In those
cases, we need to parse the error string
[to find the stack trace](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/stack.js#L19).

The stack trace is cleaned up to
[make it human-friendlier](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/clean_stack.js#L14)
using some rather intricate logic. This is not performed
[for system bugs](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/parse/clean_stack.js#L21)
or in debug mode, in case that cleanup logic would remove important information.

### Secret information

While we want to provide as much debugging information as possible to users, support and product engineers, we must
ensure no secret information is being leaked either in the build logs or in Bugsnag. The current logic is intentionally
skipping any information which might potentially be secret.

## Bugsnag

### Purpose

Every build error is reported to our [error monitoring tool Bugsnag](https://app.bugsnag.com/netlify/netlify-build).

The primary purpose is alerting: new errors are forwarded to Slack. The second purpose is debugging: each error includes
lots of insightful information.

### Grouping

It is important for Bugsnag to group errors:

- Sufficiently. If the same bug is being reported as separate error instances, Bugsnag becomes spammy, leading us to
  completely ignore it.
- But not too much. If separate error instances are grouped together, we are not being alerted of new bugs.

Grouping errors is very tricky. By default, Bugsnag uses the error message only, which is not good since it might
contain some information unique to each build, leading to not enough grouping. Bugsnag can also use stack trace, but
line numbers might change after each release, making it less useful.

Therefore, we use some
[custom logic to group errors on Bugsnag](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/monitor/report.js#L55).
Most error types re-use the error [title](#title) as a key to group errors. A few use
[a separate `group` function](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/type.js#L76).

Additional,
[we normalize](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/monitor/normalize.js#L4)
this group key to remove any build-specific information: URLs, file paths, versions, local machine information, IDs,
numbers, user configuration, etc. We do this with a series of regular expressions.

This normalization logic must be maintained by adding/modifying those regular expressions from time to time. Otherwise,
new error instances tend to be reported as separate errors, leading to lots of notification on Slack, which are
ultimately ignored.

## Additional information

Every information printed in the build logs is also sent to Bugsnag. Furthermore, we sent some additional properties
such as the Netlify Build version and
[the deploy URL](https://github.com/netlify/build/blob/4511447230ae5b582821b40499ae29d97af0aeae/packages/build/src/error/monitor/location.js#L13).
All of those are available under several tabs when looking at an error report in Bugsnag.

## Resolving errors

Bugsnag allows updating errors in several ways: comments, issues linking, status, etc.

Currently, we use the following process:

- When an error is reported on Slack, we debug it to ensure it is actually new. If it turns out another instance of the
  same error was already reported in Bugsnag, we fix the error grouping logic to ensure those are grouped together. We
  then mark the issue as Ignored.
- If the error is known not to be a problem, we mark the issue as Ignored.
- Otherwise, we create a GitHub issue, then link it in Bugsnag. We also add a comment in Bugsnag.
- Once the issue has been fixed, we mark the error as Solved in Bugsnag.

Our bookmarks and alerts currently ignore issues that are either Solved or have linked GitHub issues, which is why
following that process is important.

## Bookmarks

Bookmarks are the term Bugsnag uses for saved search queries. Those are also used for alerts.

We use an extensive list of bookmarks. We must keep those organized and updated.

The search queries mostly relies on error attributes based on the information sent to Bugsnag: error type, plugin name,
etc.

The current logic is:

- Each error type (called `errorClass` in Bugsnag) gets its own bookmark. When renaming, adding or removing error types,
  Bugsnag bookmarks should be updated.
- Essential plugins (Gatsby, Next.js) and core plugins (Edge handlers) have their own bookmarks for system bugs only.
  They are explicitely excluded from other bookmarks, but only from those which are plugin-related. When adding a new
  Essential plugin, Bugsnag bookmarks should be updated.
- Local plugins have their own bookmarks and are excluded from other plugin-related bookmarks.
- Linking an issue or marking an error Solved removes it from some of the bookmarks used for alerts.

Special bookmarks:

- "Specific plugin": errors on any given plugin
- "All events": all new errors without any filters
- "Development": same but without errors marked as Solved
- "All events (open)": same but without local plugins
- "All errors": system errors in Netlify Build
- "All warnings": errors which are most likely not bugs in Netlify Build, but could potentially be

# Alerts

Each Slack alert is tied to a specific Bugsnag bookmark. Netlify Build includes logic from different Pods and guilds. We
separate those into separate error types, bookmarks and alerts to ensure the right people are being alerted. The current
setup is:

- Netlify Build system errors: #notify-dev-tooling
- Functions bundling system errors: #notify-dev-tooling
- Functions bundling user errors: #notify-functions-bundling
- Edge handlers system errors: #monitoring-test
- Essential Gatsby plugin system errors: #notify-gatsby-framework
- Essential Next.js plugin system errors: #notify-nextjs-framework
- API system errors, including during Deploy API call: #notify-bugsnag-api

Additionally, any spike in number of warnings in Netlify Build is reported in #notify-dev-tooling
