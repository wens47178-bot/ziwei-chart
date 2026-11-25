import { afterEach, describe, expect, it, vi } from 'vitest'
import { streamChat } from './llm'

afterEach(() => {
  vi.unstubAllGlobals()
})

function createSSEStream(chunks: string[]): Response {
  const encoder = new TextEncoder()
  let index = 0

  return new Response(new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close()
        return
      }

      controller.enqueue(encoder.encode(chunks[index]))
      index += 1
    },
  }), {
    headers: { 'Content-Type': 'text/event-stream' },
  })
}

describe('Gemini API streaming', () => {
  it('sends the API key in a header and requests SSE', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createSSEStream([
      'data: {"candidates":[{"content":{"parts":[{"text":"hello"}],"role":"model"}}]}\n\n',
    ]))
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
    expect(requestUrl).toContain(':streamGenerateContent?alt=sse')
    expect(requestUrl).not.toContain('test-gemini-key')
    expect(new Headers(requestInit.headers).get('x-goog-api-key')).toBe('test-gemini-key')
  })

  it('parses split SSE events and multiple text parts without breaking escaped quotes', async () => {
    const eventOne = 'data: {"candidates":[{"content":{"parts":[{"text":"Hello "},{"text":"world"}],"role":"model"}}]}\r\n\r\n'
    const eventTwo = 'data: {"candidates":[{"content":{"parts":[{"text":"It \\"works\\"."}],"role":"model"}}]}\n\n'
    const fetchMock = vi.fn().mockResolvedValue(createSSEStream([
      eventOne.slice(0, 23),
      eventOne.slice(23) + eventTwo.slice(0, 41),
      eventTwo.slice(41),
    ]))
    vi.stubGlobal('fetch', fetchMock)

    const tokens: string[] = []
    for await (const token of streamChat(
      { provider: 'gemini', apiKey: 'test-gemini-key' },
      [{ role: 'user', content: 'Say hello' }],
    )) {
      tokens.push(token)
    }

    expect(tokens.join('')).toBe('Hello worldIt "works".')
  })

  it('flushes a final SSE event even when the stream ends without a blank line', async () => {
    const fetchMock = vi.fn().mockResolvedValue(createSSEStream([
      'data: {"candidates":[{"content":{"parts":[{"text":"final chunk"}]}}]}',
    ]))
    vi.stubGlobal('fetch', fetchMock)

    const tokens: string[] = []
    for await (const token of streamChat(
      { provider: 'gemini', apiKey: 'test-gemini-key' },
      [{ role: 'user', content: 'Say hello' }],
    )) {
      tokens.push(token)
    }

    expect(tokens.join('')).toBe('final chunk')
  })
})
