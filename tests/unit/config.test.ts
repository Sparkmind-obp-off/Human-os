import { describe, expect, it } from 'vitest'
import { getConfig } from '../../src/config/env'
import { AppError } from '../../src/core/errors/app-error'

describe('central configuration', () => {
  it('parses safe defaults and reports binding presence only', () => {
    const config = getConfig({ ENVIRONMENT: 'test' })

    expect(config.service).toEqual({
      name: 'kaevos-api',
      apiVersion: 'v1',
      version: '0.1.0',
      environment: 'test',
    })
    expect(config.provider.selected).toBe('mock')
    expect(config.connectors.mode).toBe('disabled')
    expect(config.bindings.databaseConfigured).toBe(false)
  })

  it('fails closed for unsupported environment values', () => {
    expect(() => getConfig({ ENVIRONMENT: 'unknown' })).toThrowError(AppError)
  })

  it('rejects unsafe runtime limits', () => {
    expect(() => getConfig({ REQUEST_TIMEOUT_MS: '999999' })).toThrowError(
      'Invalid runtime limit configuration.',
    )
  })
})
