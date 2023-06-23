import { getBaggage } from '@opentelemetry/api/build/src/baggage/context-helpers.js'
import test from 'ava'

import { setMultiSpanAttributes } from '../../lib/tracing/main.js'

test('Tracing set multi span attributes', async (t) => {
  const ctx = setMultiSpanAttributes({ some: 'test', foo: 'bar' })
  const baggage = getBaggage(ctx)
  t.is(baggage.getEntry('some').value, 'test')
  t.is(baggage.getEntry('foo').value, 'bar')
})
