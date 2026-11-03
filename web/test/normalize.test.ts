import { describe, expect, it } from 'vitest'
import { isLocale } from '../shared/utils/locale'
import { normalize } from '../shared/utils/normalize'

describe('normalize', () => {
  it('strips accents and lowercases', () => {
    expect(normalize('Salamèche')).toBe('salameche')
  })
})

describe('isLocale', () => {
  it('accepts supported locales only', () => {
    expect(isLocale('fr')).toBe(true)
    expect(isLocale('it')).toBe(false)
    expect(isLocale(undefined)).toBe(false)
  })
})
