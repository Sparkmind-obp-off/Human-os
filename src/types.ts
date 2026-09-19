import type { AppConfig, CloudflareBindings } from './config/env'
import type { RequestContext } from './api/middleware/request-context'

export interface AppVariables {
  config: AppConfig
  requestContext: RequestContext
}

export type AppEnvironment = {
  Bindings: CloudflareBindings
  Variables: AppVariables
}
