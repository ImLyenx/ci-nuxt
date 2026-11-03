import de from './locales/de.json' with { type: 'json' }
import en from './locales/en.json' with { type: 'json' }
import es from './locales/es.json' with { type: 'json' }
import fr from './locales/fr.json' with { type: 'json' }

const messages = { en, fr, es, de }

type Locale = keyof typeof messages
export type MessageKey = keyof typeof en

export function locale(acceptLanguage: string | undefined): Locale {
  const lang = acceptLanguage?.slice(0, 2).toLowerCase() ?? ''
  return lang in messages ? (lang as Locale) : 'en'
}

export function translate(
  acceptLanguage: string | undefined,
  key: MessageKey,
  params: Record<string, string | number> = {},
): string {
  return messages[locale(acceptLanguage)][key].replace(
    /\{(\w+)\}/g,
    (_, name: string) => String(params[name]),
  )
}
