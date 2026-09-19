import { describe, expect, it } from 'vitest'
import { AppError, normalizeError } from '../../src/core/errors/app-error'
import { createErrorEnvelope } from '../../src/core/errors/error-response'

describe('application errors', () => {
  it('maps stable public errors to HTTP status codes', () => {
    expect(new AppError('VALIDATION_ERROR').status).toBe(422)
    expect(new AppError('AUTHENTICATION_ERROR').status).toBe(401)
    expect(new AppError('AUTHORIZATION_ERROR').status).toBe(403)
    expect(new AppError('NOT_FOUND').status).toBe(404)
    expect(new AppError('CONFLICT').status).toBe(409)
    expect(new AppError('RATE_LIMITED').status).toBe(429)
    expect(new AppError('UPSTREAM_FAILURE').status).toBe(502)
    expect(new AppError('UNAVAILABLE').status).toBe(503)
    expect(new AppError('TIMEOUT').status).toBe(504)
  })

  it('normalizes unknown failures without exposing implementation details', () => {
    const normalized = normalizeError(
      new Error('Authorization: Bearer secret-token at /private/path'),
    )
    const envelope = createErrorEnvelope(normalized, 'req_test-safe')
    const serialized = JSON.stringify(envelope)

    expect(normalized.code).toBe('INTERNAL_ERROR')
    expect(serialized).not.toContain('secret-token')
    expect(serialized).not.toContain('/private/path')
    expect(serialized).not.toContain('stack')
  })
})
