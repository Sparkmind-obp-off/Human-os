import { createMiddleware } from 'hono/factory'
import { getConfig } from '../../config/env'
import type { AppEnvironment } from '../../types'

export const configurationMiddleware = createMiddleware<AppEnvironment>(
  async (context, next) => {
    context.set('config', getConfig(context.env))
    await next()
  },
)
