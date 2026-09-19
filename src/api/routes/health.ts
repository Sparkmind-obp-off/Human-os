import { Hono } from 'hono'
import type { AppEnvironment } from '../../types'

export const healthRoutes = new Hono<AppEnvironment>()

healthRoutes.get('/health', (context) => {
  const config = context.var.config
  const request = context.var.requestContext

  return context.json({
    success: true,
    data: {
      status: 'healthy',
      service: config.service.name,
      version: config.service.version,
      api_version: config.service.apiVersion,
    },
    meta: {
      request_id: request.requestId,
      timestamp: new Date().toISOString(),
    },
  })
})
