type Options = {
  method?: 'GET' | 'POST' | 'DELETE'
  body?: Record<string, unknown>
  query?: Record<string, string>
}

export function useApi() {
  const { apiBase } = useRuntimeConfig().public
  const { locale, t } = useLocale()

  async function api<T>(url: string, options: Options = {}): Promise<T> {
    try {
      return (await $fetch(url, {
        ...options,
        baseURL: apiBase,
        headers: { 'Accept-Language': locale.value },
      })) as T
    } catch (e) {
      const data = (e as { data?: { error?: string } }).data
      throw new Error(data?.error ?? t('apiUnreachable'), { cause: e })
    }
  }

  return api
}
