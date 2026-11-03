import { beforeEach, describe, expect, it, vi } from 'vitest'
import { loadJson, saveJson } from '../app/utils/storage'

function memoryStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  }
}

beforeEach(() => {
  vi.unstubAllGlobals()
  vi.stubGlobal('localStorage', memoryStorage())
})

describe('storage', () => {
  it('saves and reads a value', () => {
    expect(saveJson('list', [1, 2])).toBe(true)
    expect(loadJson('list', [])).toEqual([1, 2])
  })

  it('returns the fallback when empty', () => {
    expect(loadJson('list', [])).toEqual([])
  })

  it('returns the fallback on invalid json', () => {
    localStorage.setItem('list', '{not json')
    expect(loadJson('list', [])).toEqual([])
  })

  it('does not throw when localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', undefined)
    expect(loadJson('list', [])).toEqual([])
    expect(saveJson('list', [1])).toBe(false)
  })
})
