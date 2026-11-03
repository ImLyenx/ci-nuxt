const KEY = 'visitor-id'
let fallback: string | undefined

// random anonymous id for this browser, used to like each pokemon once.
// browser-only; falls back to a per-tab id if localStorage is unavailable
export function useVisitorId(): string {
  try {
    let id = localStorage.getItem(KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(KEY, id)
    }
    return id
  } catch {
    return (fallback ??= crypto.randomUUID())
  }
}
