# Opentelemetry SDK Setup

This package extracts the logic necessary to initialise the Opentelemetry JS SDK using our tracing exporter. This not
only allows us to reuse the initialisation logic across different node process executions but also means **our modules
don't need to depend on any @opentelemetry module other than the @opentelemetry/api**

## How to use it?

This module is designed to be preloaded via [--import](https://nodejs.org/docs/latest-v18.x/api/cli.html#--importmodule)
on any node execution. For example:

```
$> node --import=./lib/bin.js ../build/lib/core/bin.js --debug --tracing.enabled=false --tracing.httpProtocol=https --tracing.host=api.honeycomb.io --tracing.port=443 --tracing.debug=true --tracing.preloadingEnabled=true .
```

On the script we're instrumenting we can just rely on `@opentelemetry/api` to create spans and interact with the SDK:

```ts
  import { trace } from '@opentelemetry/api'
  const tracer = trace.getTracer('secrets-scanning')

  const myInstrumentedFunction = async function() {
    await tracer.startActiveSpan(
      'scanning-files',
      { attributes: { myAttribute: 'foobar' } },
      async (span) => {
        doSomeWork()
        span.end()
      }
  }

```

## Sharing and receiving context from outside of the process

Our SDK initialisation is prepared to receive [trace](https://opentelemetry.io/docs/concepts/signals/traces/) and
[baggage](https://opentelemetry.io/docs/concepts/signals/baggage/) context from outside of the process. This allow us
to, for example, hook this node process execution to an ongoing trace which is already taking place or share the baggage
attributes for that execution with the spans created in this process. The list of tracing options show the options
available to the executable and what they mean.

Unfortunately, to our knowledge, the current `@opentelemetry` setup does not allow us to define an initial global
context that the root span can inherit from. As a consequence we had to get creative in order to pass the ingested
attributes to our main script execution, so that the root span can get the newly ingested attributes. We're relying on a
global property which can be accessed via `@netlify/opentelemetry-utils`. If your process receives any outside
attributes you can do the following:

```
$> node --import=./lib/bin.js my-instrumented-script --tracing.httpProtocol=https --tracing.host=api.honeycomb.io --tracing.port=443 --tracing.debug=true --tracing.preloadingEnabled=true --tracing.baggageFilePath='./my-baggage-filepath' --tracing.traceId=<my-trace-id> --tracing.parentSpanId=<the-span-id-of-the-parent>
```

And on the instrumented script:

```ts
  import { trace } from '@opentelemetry/api'
  import { getGlobalContext } from '@netlify/opentelemetry-utils'
  const tracer = trace.getTracer('secrets-scanning')

  const myInstrumentedFunction = async function() {
    await tracer.startActiveSpan(
      'scanning-files',
      { attributes: { myAttribute: 'foobar' } },
      getGlobalContext(),
      async (span) => {
        doSomeWork()
        span.end()
      }
  }

```
