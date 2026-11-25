import { afterEach, describe, expect, it, vi } from 'vitest'
import { streamChat } from './llm'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('Gemini API authentication', () => {
  it('sends the API key in a header instead of the request URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('{"text":"hello"}'))
    vi.stubGlobal('fetch', fetchMock)

    const tokens: string[] = []
    for await (const token of streamChat(
      { provider: 'gemini', apiKey: 'test-gemini-key' },
      [{ role: 'user', content: 'Say hello' }],
    )) {
      tokens.push(token)
    }

    expect(tokens.join('')).toBe('hello')
    expect(fetchMock).toHaveBeenCalledOnce()

    const requestUrl = fetchMock.mock.calls[0][0] as string
    const requestInit = fetchMock.mock.calls[0][1] as RequestInit
    expect(requestUrl).not.toContain('test-gemini-key')
    expect(requestUrl).not.toContain('?key=')
    expect(new Headers(requestInit.headers).get('x-goog-api-key')).toBe('test-gemini-key')
  })
})
