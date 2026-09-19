import { AppError } from '../core/errors/app-error'

export type RuntimeEnvironment = 'local' | 'test' | 'staging' | 'production'
export type ProviderSelection = 'mock' | 'gemini'
export type ConnectorMode = 'disabled' | 'test'

export interface CloudflareBindings {
  DB?: D1Database
  ENVIRONMENT?: string
  KAEVOS_VERSION?: string
  LLM_PROVIDER?: string
  CONNECTOR_MODE?: string
  REQUEST_TIMEOUT_MS?: string
}

export interface AppConfig {
  service: {
    name: 'kaevos-api'
    apiVersion: 'v1'
    version: string
    environment: RuntimeEnvironment
  }
  provider: {
    selected: ProviderSelection
  }
  connectors: {
    mode: ConnectorMode
  }
  runtime: {
    requestTimeoutMs: number
  }
  bindings: {
    databaseConfigured: boolean
  }
}

const ENVIRONMENTS = new Set<RuntimeEnvironment>([
  'local',
  'test',
  'staging',
  'production',
])
const PROVIDERS = new Set<ProviderSelection>(['mock', 'gemini'])
const CONNECTOR_MODES = new Set<ConnectorMode>(['disabled', 'test'])

function parseEnum<T extends string>(
  value: string | undefined,
  fallback: T,
  allowed: Set<T>,
  field: string,
): T {
  const candidate = (value ?? fallback) as T
  if (!allowed.has(candidate)) {
    throw new AppError('CONFIGURATION_ERROR', {
      publicMessage: `Invalid ${field} configuration.`,
    })
  }
  return candidate
}

function parseRequestTimeout(value: string | undefined): number {
  const parsed = Number(value ?? '10000')
  if (!Number.isInteger(parsed) || parsed < 100 || parsed > 30000) {
    throw new AppError('CONFIGURATION_ERROR', {
      publicMessage: 'Invalid runtime limit configuration.',
    })
  }
  return parsed
}

export function getConfig(bindings: CloudflareBindings): AppConfig {
  return {
    service: {
      name: 'kaevos-api',
      apiVersion: 'v1',
      version: bindings.KAEVOS_VERSION?.trim() || '0.1.0',
      environment: parseEnum(
        bindings.ENVIRONMENT,
        'local',
        ENVIRONMENTS,
        'environment',
      ),
    },
    provider: {
      selected: parseEnum(
        bindings.LLM_PROVIDER,
        'mock',
        PROVIDERS,
        'provider',
      ),
    },
    connectors: {
      mode: parseEnum(
        bindings.CONNECTOR_MODE,
        'disabled',
        CONNECTOR_MODES,
        'connector mode',
      ),
    },
    runtime: {
      requestTimeoutMs: parseRequestTimeout(bindings.REQUEST_TIMEOUT_MS),
    },
    bindings: {
      databaseConfigured: Boolean(bindings.DB),
    },
  }
}
