# Tracing in Netlify Build

Netlify Build relies on Open Telemetry tracing to emit trace data:

- https://opentelemetry.io/docs/instrumentation/js/

In production, trace data is exported to [Honeycomb](https://ui.honeycomb.io). Buildbot is responsible for passing over
trace information which allows build executions to be stitched together into a single trace across Buildbot and
`@netlify/build`. The initialisation for this tracing SDK is done
[here](https://github.com/netlify/build/blob/main/packages/build/src/tracing/main.ts). We also use an open telemetry
collector in production.

## Adding more instrumentation

More data can be added by either generating more spans or adding more attributes to relevant stages. Check the Open
Telemetry docs for manual instrumentation:

- https://opentelemetry.io/docs/instrumentation/js/manual/

We also have some utility methods you can leverage to do this:

- https://github.com/netlify/build/blob/main/packages/build/src/tracing/main.ts

## Exporting data locally

You can export trace data when running `@netlify/build` locally, to do so you just need to leverage the `tracing`
[flag properties](https://github.com/netlify/build/blob/main/packages/build/src/core/flags.js#L194) to point to
Honeycomb directly. For example:

```
node packages/build/bin.js --debug --tracing.enabled=true --tracing.apiKey=<honeycomb-tracing-api-key> --tracing.httpProtocol=https --tracing.host=api.honeycomb.io --tracing.port=443 ../my-site
```

The tracing API Key should be an Honeycomb environment API key. If testing things locally you can use the `dev`
environment.
