const KEY = 'visitor-id'
let fallback: string | undefined

// random anonymous id for this browser, used to like each pokemon once.
// browser-only; falls back to a per-tab id if localStorage is unavailable
export function useVisitorId(): string {
  const stored = loadJson<unknown>(KEY, null)
  if (typeof stored === 'string') return stored

  const id = crypto.randomUUID()
  if (saveJson(KEY, id)) return id
  return (fallback ??= id)
}
