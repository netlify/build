import { z } from 'zod'

export interface TrafficRules {
  action: {
    type: string
    config: {
      rateLimitConfig: {
        algorithm: string
        windowSize: number
        windowLimit: number
      }
      aggregate: {
        keys: {
          type: string
        }[]
      }
      to?: string
    }
  }
}

const rateLimitAction = z.enum(['rate_limit', 'rewrite'])
const rateLimitAlgorithm = z.enum(['sliding_window'])
const rateLimitAggregator = z.enum(['domain', 'ip'])
const slidingWindow = z.object({
  windowLimit: z.number(),
  windowSize: z.number(),
})
const rewriteActionConfig = z.object({
  to: z.string(),
})

export const rateLimit = z
  .object({
    action: rateLimitAction.optional(),
    aggregateBy: rateLimitAggregator.or(z.array(rateLimitAggregator)).optional(),
    algorithm: rateLimitAlgorithm.optional(),
  })
  .merge(slidingWindow)
  .merge(rewriteActionConfig.partial())

type RateLimit = z.infer<typeof rateLimit>

/**
 * Takes a rate limiting configuration object and returns a traffic rules
 * object that is added to the manifest.
 */
export const getTrafficRulesConfig = (input: RateLimit): TrafficRules | undefined => {
  const { windowSize, windowLimit, algorithm, aggregateBy, action, to } = input
  const rateLimitAgg = Array.isArray(aggregateBy) ? aggregateBy : [rateLimitAggregator.Enum.domain]
  const rewriteConfig = to ? { to: input.to } : undefined

  return {
    action: {
      type: action || rateLimitAction.Enum.rate_limit,
      config: {
        ...rewriteConfig,
        rateLimitConfig: {
          windowLimit,
          windowSize,
          algorithm: algorithm || rateLimitAlgorithm.Enum.sliding_window,
        },
        aggregate: {
          keys: rateLimitAgg.map((agg) => ({ type: agg })),
        },
      },
    },
  }
}
