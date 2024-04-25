import { hrtime } from 'process'

const NANOSECS_TO_SECS = 1e9
const NANOSECS_TO_MSECS = 1e6

/** Starts a timer */
export const startTimer = hrtime

/** Stops a timer */
export const endTimer = ([startSecs, startNsecs]: [number, number]) => {
  const [endSecs, endNsecs] = hrtime()
  const durationNs = (endSecs - startSecs) * NANOSECS_TO_SECS + endNsecs - startNsecs
  return durationNs
}

/**
 * statsd expects milliseconds integers.
 * To prevent double rounding errors, rounding should only be applied once.
 */
export const roundTimerToMillisecs = (durationNs: number) => Math.round(durationNs / NANOSECS_TO_MSECS)
