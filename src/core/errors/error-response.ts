import type { AppError } from './app-error'

export interface ErrorEnvelope {
  success: false
  error: {
    code: AppError['code']
    message: string
    details?: Record<string, unknown>
  }
  meta: {
    request_id: string
    timestamp: string
  }
}

export function createErrorEnvelope(
  error: AppError,
  requestId: string,
  timestamp = new Date().toISOString(),
): ErrorEnvelope {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.publicMessage,
      ...(error.publicDetails ? { details: error.publicDetails } : {}),
    },
    meta: {
      request_id: requestId,
      timestamp,
    },
  }
}
