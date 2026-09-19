import { describe, expect, it } from 'vitest'
import { resolveRequestId } from '../../src/api/middleware/request-context'

describe('request ID resolution', () => {
  it('accepts a bounded safe caller request ID', () => {
    expect(resolveRequestId('client-request-123')).toBe('client-request-123')
  })

  it('replaces missing or unsafe request IDs', () => {
    expect(resolveRequestId(undefined)).toMatch(/^req_[0-9a-f-]{36}$/)
    expect(resolveRequestId('bad value with spaces')).toMatch(
      /^req_[0-9a-f-]{36}$/,
    )
  })
})
