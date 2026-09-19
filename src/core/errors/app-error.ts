export const APP_ERROR_CODES = [
  'INVALID_REQUEST',
  'VALIDATION_ERROR',
  'AUTHENTICATION_ERROR',
  'AUTHORIZATION_ERROR',
  'NOT_FOUND',
  'CONFLICT',
  'IDEMPOTENCY_CONFLICT',
  'RATE_LIMITED',
  'TIMEOUT',
  'UNAVAILABLE',
  'UPSTREAM_FAILURE',
  'CONFIGURATION_ERROR',
  'INTERNAL_ERROR',
] as const

export type AppErrorCode = (typeof APP_ERROR_CODES)[number]

const HTTP_STATUS_BY_CODE: Record<AppErrorCode, number> = {
  INVALID_REQUEST: 400,
  VALIDATION_ERROR: 422,
  AUTHENTICATION_ERROR: 401,
  AUTHORIZATION_ERROR: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  IDEMPOTENCY_CONFLICT: 409,
  RATE_LIMITED: 429,
  TIMEOUT: 504,
  UNAVAILABLE: 503,
  UPSTREAM_FAILURE: 502,
  CONFIGURATION_ERROR: 500,
  INTERNAL_ERROR: 500,
}

const DEFAULT_PUBLIC_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_REQUEST: 'The request is invalid.',
  VALIDATION_ERROR: 'The request could not be validated.',
  AUTHENTICATION_ERROR: 'Authentication is required.',
  AUTHORIZATION_ERROR: 'This action is not authorized.',
  NOT_FOUND: 'The requested resource was not found.',
  CONFLICT: 'The request conflicts with the current state.',
  IDEMPOTENCY_CONFLICT: 'The idempotency key conflicts with an earlier request.',
  RATE_LIMITED: 'Too many requests.',
  TIMEOUT: 'The operation timed out.',
  UNAVAILABLE: 'The service is temporarily unavailable.',
  UPSTREAM_FAILURE: 'An upstream service failed.',
  CONFIGURATION_ERROR: 'The service is not configured correctly.',
  INTERNAL_ERROR: 'An unexpected internal error occurred.',
}

export interface AppErrorOptions {
  status?: number
  publicMessage?: string
  publicDetails?: Record<string, unknown>
  cause?: unknown
}

export class AppError extends Error {
  readonly code: AppErrorCode
  readonly status: number
  readonly publicMessage: string
  readonly publicDetails?: Record<string, unknown>

  constructor(code: AppErrorCode, options: AppErrorOptions = {}) {
    super(options.publicMessage ?? DEFAULT_PUBLIC_MESSAGES[code], {
      cause: options.cause,
    })
    this.name = 'AppError'
    this.code = code
    this.status = options.status ?? HTTP_STATUS_BY_CODE[code]
    this.publicMessage = options.publicMessage ?? DEFAULT_PUBLIC_MESSAGES[code]
    this.publicDetails = options.publicDetails
  }
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error
  }

  return new AppError('INTERNAL_ERROR', { cause: error })
}
