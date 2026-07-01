import type { Attributes } from '@opentelemetry/api'

import type { FeatureFlags } from '../../../feature_flags.js'
import type { ZipFunctionResult } from '../../runtime.js'
import type { BundlerReason, NodeBundlerName } from '../bundlers/types.js'

/* Span attributes describing a function and how it is bundled */
export const getFunctionBundleSpanAttributes = ({
  featureFlags,
  name,
  generator,
  runtimeName,
  runtimeAPIVersion,
  bundlerName,
  bundlerReason,
}: {
  featureFlags: FeatureFlags
  name: string
  generator: string | undefined
  runtimeName: string
  runtimeAPIVersion: number
  bundlerName: NodeBundlerName
  bundlerReason: BundlerReason
}): Attributes => ({
  feature_flags: JSON.stringify(featureFlags),
  'function.name': name,
  'function.generator': generator,
  'function.runtime': runtimeName,
  'function.runtime_api_version': runtimeAPIVersion,
  'bundler.name': bundlerName,
  'bundler.reason': bundlerReason,
})

/* Span attributes known only once bundling has finished */
export const getBundleResultSpanAttributes = (
  result: ZipFunctionResult,
  sizeBytes: number | undefined,
): Attributes => ({
  'bundler.warnings_count': result.bundlerWarnings?.length ?? 0,
  'bundler.errors_count': result.bundlerErrors?.length ?? 0,
  'bundle.size_bytes': sizeBytes,
})
