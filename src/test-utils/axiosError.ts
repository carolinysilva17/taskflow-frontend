export function axiosError(errorCode: string) {
  return { isAxiosError: true, response: { data: { errorCode } } }
}
