import { isAxiosError } from 'axios'

export function getErrorCode(error: unknown): string | undefined {
  return isAxiosError(error) ? error.response?.data?.errorCode : undefined
}
