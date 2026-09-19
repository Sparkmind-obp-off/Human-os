import { createMiddleware } from 'hono/factory'
import { logRequest } from '../../observability/logger'
import type { AppEnvironment } from '../../types'

const REQUEST_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/

export interface RequestActorBoundary {
  authenticated: false
  actorId: null
  source: 'not_implemented'
}

export interface RequestContext {
  requestId: string
  actor: RequestActorBoundary
  environment: string
  startedAt: string
  startedAtMs: number
}

export function resolveRequestId(value: string | undefined): string {
  if (value && REQUEST_ID_PATTERN.test(value)) {
    return value
  }
  return `req_${crypto.randomUUID()}`
}

export const requestContextMiddleware = createMiddleware<AppEnvironment>(
  async (context, next) => {
    const startedAtMs = Date.now()
    const requestId = resolveRequestId(context.req.header('X-Request-ID'))
    const requestContext: RequestContext = {
      requestId,
      actor: {
        authenticated: false,
        actorId: null,
        source: 'not_implemented',
      },
      environment: context.var.config.service.environment,
      startedAt: new Date(startedAtMs).toISOString(),
      startedAtMs,
    }

    context.set('requestContext', requestContext)
    context.header('X-Request-ID', requestId)

    await next()

    logRequest({
      event: 'request.completed',
      requestId,
      method: context.req.method,
      path: context.req.path,
      status: context.res.status,
      durationMs: Date.now() - startedAtMs,
    })
  },
)
