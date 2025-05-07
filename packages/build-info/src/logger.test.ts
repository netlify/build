import { describe, expect, test, vi } from 'vitest'

import { DefaultLogger } from './logger.js'

describe('DefaultLogger', () => {
  test('Should have the default log level to error', () => {
    const logger = new DefaultLogger()

    const logSpy = vi.spyOn(console, 'log')
    const infoSpy = vi.spyOn(console, 'info')
    const warnSpy = vi.spyOn(console, 'warn')
    const debugSpy = vi.spyOn(console, 'debug')
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /** noop */
    })

    logger.debug('debug')
    logger.log('log')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')
    expect(debugSpy).not.toHaveBeenCalled()
    expect(logSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(errorSpy).toHaveBeenCalledWith('error')
  })

  test('Should log all levels if set to debug', () => {
    const logger = new DefaultLogger('debug')
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
      /** noop */
    })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      /** noop */
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      /** noop */
    })
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {
      /** noop */
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /** noop */
    })

    logger.debug('debug')
    logger.log('log')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')
    expect(debugSpy).toHaveBeenCalledWith('debug')
    expect(logSpy).toHaveBeenCalledWith('log')
    expect(infoSpy).toHaveBeenCalledWith('info')
    expect(warnSpy).toHaveBeenCalledWith('warn')
    expect(errorSpy).toHaveBeenCalledWith('error')
  })

  test('should not log the debug and log if set to info level', () => {
    const logger = new DefaultLogger('info')
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {
      /** noop */
    })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      /** noop */
    })
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {
      /** noop */
    })
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {
      /** noop */
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {
      /** noop */
    })

    logger.debug('debug')
    logger.log('log')
    logger.info('info')
    logger.warn('warn')
    logger.error('error')
    expect(debugSpy).not.toHaveBeenCalled()
    expect(logSpy).not.toHaveBeenCalled()
    expect(infoSpy).toHaveBeenCalledWith('info')
    expect(warnSpy).toHaveBeenCalledWith('warn')
    expect(errorSpy).toHaveBeenCalledWith('error')
  })
})
