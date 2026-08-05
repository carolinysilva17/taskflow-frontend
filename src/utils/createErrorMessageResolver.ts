import { getErrorCode } from './getErrorCode'

export function createErrorMessageResolver<Code extends string>(messages: Record<Code, string>) {
  return function resolveErrorMessage(err: unknown, fallback: string): string {
    const code = getErrorCode(err)
    return code != null && code in messages ? messages[code as Code] : fallback
  }
}
