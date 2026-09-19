import { Hono } from 'hono'
import { configurationMiddleware } from './api/middleware/configuration'
import { handleError } from './api/middleware/error-handler'
import { requestContextMiddleware } from './api/middleware/request-context'
import { healthRoutes } from './api/routes/health'
import { AppError } from './core/errors/app-error'
import type { AppEnvironment } from './types'

export function createApp(): Hono<AppEnvironment> {
  const app = new Hono<AppEnvironment>()

  app.onError(handleError)
  app.use('*', configurationMiddleware)
  app.use('*', requestContextMiddleware)

  app.route('/v1', healthRoutes)

  app.all('*', () => {
    throw new AppError('NOT_FOUND')
  })

  return app
}

const app = createApp()

export default app
