export const LOCALES = ['en', 'fr', 'es', 'de'] as const

export const isLocale = (value: unknown): value is Locale =>
  LOCALES.includes(value as Locale)
