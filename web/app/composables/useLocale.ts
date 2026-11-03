import de from '~~/locales/de.json'
import en from '~~/locales/en.json'
import es from '~~/locales/es.json'
import fr from '~~/locales/fr.json'

export type MessageKey = keyof typeof en

const messages: Record<Locale, Record<MessageKey, string>> = { en, fr, es, de }

export function useLocale() {
  const cookie = useCookie<string | undefined>('lang', {
    maxAge: 60 * 60 * 24 * 365,
  })
  const locale = useState<Locale>('locale', () =>
    isLocale(cookie.value) ? cookie.value : 'en',
  )

  function setLocale(value: Locale) {
    locale.value = value
    cookie.value = value
  }

  function t(key: MessageKey, params: Record<string, string | number> = {}) {
    return messages[locale.value][key].replace(/\{(\w+)\}/g, (_, name) =>
      String(params[name]),
    )
  }

  return { locale, setLocale, t, cookie }
}
