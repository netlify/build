# Tracing in Netlify Build

Netlify Build relies on Open Telemetry tracing to emit trace data:

- https://opentelemetry.io/docs/instrumentation/js/

In production, trace data is exported over OTLP/gRPC to an Open Telemetry collector. Buildbot is responsible for passing
over trace information which allows build executions to be stitched together into a single trace across Buildbot and
`@netlify/build`.

`@netlify/build` itself only depends on `@opentelemetry/api`. The SDK is initialised in a separate package,
[`@netlify/opentelemetry-sdk-setup`](../../opentelemetry-sdk-setup), which is preloaded into a process via node's
`--import` flag. See that package's README for the available `--tracing.*` options.

## Adding more instrumentation

More data can be added by either generating more spans or adding more attributes to relevant stages. Check the Open
Telemetry docs for manual instrumentation:

- https://opentelemetry.io/docs/instrumentation/js/manual/

We also have some utility methods you can leverage to do this:

- [`@netlify/opentelemetry-utils`](../../opentelemetry-utils/src/index.ts) — helpers to add attributes, errors and
  events to the active span, and to set baggage attributes that propagate to child spans.
- [`packages/build/src/tracing/main.ts`](../src/tracing/main.ts) — maps build errors and step metadata onto span
  attributes.

## Exporting data locally

Tracing is off unless it is explicitly preloaded, so exporting locally means running the build through the preloader and
pointing it at a collector. For example, against a collector listening for OTLP/gRPC on `localhost:4317`:

```
node --import=./packages/opentelemetry-sdk-setup/lib/bin.js packages/build/bin.js --debug --tracing.preloadingEnabled=true --tracing.httpProtocol=http --tracing.host=localhost --tracing.port=4317 ../my-site
```

Add `--tracing.debug=true` to log Open Telemetry diagnostics to stdout.
