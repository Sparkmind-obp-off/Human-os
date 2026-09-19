import type { Context } from 'hono'
import { createErrorEnvelope } from '../../core/errors/error-response'
import { normalizeError } from '../../core/errors/app-error'
import { logRequest } from '../../observability/logger'
import type { AppEnvironment } from '../../types'
import { resolveRequestId } from './request-context'

export function handleError(error: unknown, context: Context<AppEnvironment>): Response {
  const normalized = normalizeError(error)
  const requestContext = context.get('requestContext')
  const requestId =
    requestContext?.requestId ?? resolveRequestId(context.req.header('X-Request-ID'))
  const startedAtMs = requestContext?.startedAtMs ?? Date.now()

  context.header('X-Request-ID', requestId)
  logRequest({
    event: 'request.failed',
    requestId,
    method: context.req.method,
    path: context.req.path,
    status: normalized.status,
    durationMs: Date.now() - startedAtMs,
    errorCode: normalized.code,
  })

  return context.json(
    createErrorEnvelope(normalized, requestId),
    normalized.status as 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 502 | 503 | 504,
  )
}
