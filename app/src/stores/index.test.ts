import { describe, expect, it } from 'vitest'
import { sanitizePersistedSettings } from './index'

describe('sanitizePersistedSettings', () => {
  it('removes provider and search credentials while preserving non-secret preferences', () => {
    const persisted = sanitizePersistedSettings({
      provider: 'gemini',
      providerSettings: {
        kimi: {
          apiKey: 'kimi-secret',
          customBaseUrl: 'https://kimi.example/v1',
          customModel: 'kimi-model',
        },
        gemini: {
          apiKey: 'gemini-secret',
          customBaseUrl: 'https://gemini.example/v1',
          customModel: 'gemini-model',
        },
      },
      enableThinking: true,
      enableWebSearch: true,
      searchApiKey: 'tavily-secret',
    })

    expect(persisted.provider).toBe('gemini')
    expect(persisted.providerSettings?.kimi.apiKey).toBe('')
    expect(persisted.providerSettings?.gemini.apiKey).toBe('')
    expect(persisted.providerSettings?.kimi.customBaseUrl).toBe('https://kimi.example/v1')
    expect(persisted.providerSettings?.gemini.customModel).toBe('gemini-model')
    expect(persisted.enableThinking).toBe(true)
    expect(persisted.enableWebSearch).toBe(true)
    expect(persisted.searchApiKey).toBe('')
  })

  it('clears credentials from legacy persisted settings during migration', () => {
    const migrated = sanitizePersistedSettings({
      provider: 'deepseek',
      providerSettings: {
        deepseek: {
          apiKey: 'legacy-provider-secret',
          customBaseUrl: '',
          customModel: '',
        },
      },
      searchApiKey: 'legacy-tavily-secret',
    })

    expect(migrated.provider).toBe('deepseek')
    expect(migrated.providerSettings?.deepseek.apiKey).toBe('')
    expect(migrated.searchApiKey).toBe('')
  })

  it('falls back safely when persisted settings are malformed', () => {
    const sanitized = sanitizePersistedSettings(null)

    expect(sanitized.provider).toBe('kimi')
    expect(sanitized.providerSettings?.kimi.apiKey).toBe('')
    expect(sanitized.searchApiKey).toBe('')
  })
})
