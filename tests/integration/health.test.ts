import { describe, expect, it } from 'vitest'
import { createApp } from '../../src/index'
import type { CloudflareBindings } from '../../src/config/env'

const bindings: CloudflareBindings = {
  ENVIRONMENT: 'test',
  KAEVOS_VERSION: '0.1.0',
  LLM_PROVIDER: 'mock',
  CONNECTOR_MODE: 'disabled',
  REQUEST_TIMEOUT_MS: '10000',
}

describe('GET /v1/health', () => {
  it('returns a safe health envelope and propagates the request ID', async () => {
    const app = createApp()
    const response = await app.request(
      '/v1/health',
      { headers: { 'X-Request-ID': 'health-test-123' } },
      bindings,
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get('X-Request-ID')).toBe('health-test-123')
    expect(body).toMatchObject({
      success: true,
      data: {
        status: 'healthy',
        service: 'kaevos-api',
        version: '0.1.0',
        api_version: 'v1',
      },
      meta: { request_id: 'health-test-123' },
    })
    expect(JSON.stringify(body)).not.toMatch(
      /token|secret|credential|api[_-]?key|environment|cloudflare/i,
    )
  })

  it('returns a normalized safe 404 envelope', async () => {
    const app = createApp()
    const response = await app.request('/not-found', {}, bindings)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found.',
      },
    })
    expect(response.headers.get('X-Request-ID')).toMatch(/^req_/)
  })

  it('fails safely when configuration is invalid', async () => {
    const app = createApp()
    const response = await app.request(
      '/v1/health',
      {},
      { ...bindings, ENVIRONMENT: 'private-production-secret' },
    )
    const body = await response.json()
    const serialized = JSON.stringify(body)

    expect(response.status).toBe(500)
    expect(body).toMatchObject({
      success: false,
      error: {
        code: 'CONFIGURATION_ERROR',
        message: 'Invalid environment configuration.',
      },
    })
    expect(serialized).not.toContain('private-production-secret')
  })
})
