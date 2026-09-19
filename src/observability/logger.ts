export interface RequestLogEvent {
  event: 'request.completed' | 'request.failed'
  requestId: string
  method: string
  path: string
  status: number
  durationMs: number
  errorCode?: string
}

export function logRequest(event: RequestLogEvent): void {
  console.log(JSON.stringify(event))
}
