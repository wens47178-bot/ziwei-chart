import http from 'node:http'

const PORT = Number(process.env.PORT || 10000)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite'
const ALLOWED_ORIGINS = new Set([
  'https://tianyan-ziwei-main.onrender.com',
  'https://ouranic.cn',
  'https://www.ouranic.cn',
  'http://localhost:5173',
])
const rateLimits = new Map()
const MAX_BODY_BYTES = 180_000

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(JSON.stringify(body))
}

function allowedOrigin(origin) {
  return !origin || ALLOWED_ORIGINS.has(origin)
}

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || ''
  if (!allowedOrigin(origin)) return sendJson(res, 403, { error: '来源不被允许' })
  if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

  if (req.method === 'GET' && req.url === '/health') {
    return sendJson(res, 200, { ok: true, configured: Boolean(GEMINI_API_KEY) })
  }
  if (req.method !== 'POST' || req.url !== '/api/interpret') {
    return sendJson(res, 404, { error: 'Not found' })
  }
  if (!GEMINI_API_KEY) {
    return sendJson(res, 503, { error: '平台 AI 服务正在完成服务器端配置，请稍后再试。无需用户自行填写 API Key。' })
  }

  const ip = req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'
  const now = Date.now()
  const recent = (rateLimits.get(ip) || []).filter((stamp) => now - stamp < 60_000)
  if (recent.length >= 5) return sendJson(res, 429, { error: '请求过于频繁，请稍后再试。' })
  recent.push(now)
  rateLimits.set(ip, recent)

  try {
    let raw = ''
    for await (const chunk of req) {
      raw += chunk
      if (Buffer.byteLength(raw) > MAX_BODY_BYTES) return sendJson(res, 413, { error: '命盘上下文过长' })
    }
    const payload = JSON.parse(raw)
    const messages = payload?.messages
    if (!Array.isArray(messages) || messages.length !== 2 || !messages.every((m) => ['system', 'user'].includes(m.role) && typeof m.content === 'string')) {
      return sendJson(res, 400, { error: '无效的解读请求' })
    }

    const system = messages.find((m) => m.role === 'system')?.content || ''
    const user = messages.find((m) => m.role === 'user')?.content || ''
    const upstream = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0.45, maxOutputTokens: 12000 },
      }),
      signal: AbortSignal.timeout(180_000),
    })
    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 500)
      return sendJson(res, upstream.status === 429 ? 429 : 502, { error: upstream.status === 429 ? '平台 AI 服务暂时达到调用额度，请稍后重试。' : `AI 服务暂时不可用：${detail}` })
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    })
    const reader = upstream.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    const emit = (event) => {
      const data = event.split(/\\r?\\n/).filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trim()).join('')
      if (!data || data === '[DONE]') return
      try {
        const json = JSON.parse(data)
        const text = (json.candidates?.[0]?.content?.parts || []).map((part) => part.text || '').join('')
        if (text) res.write(`data: ${JSON.stringify({ text })}\\n\\n`)
      } catch { /* ignore incomplete upstream event */ }
    }
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const events = buffer.split(/\\r?\\n\\r?\\n/)
      buffer = events.pop() || ''
      for (const event of events) emit(event)
    }
    buffer += decoder.decode()
    if (buffer.trim()) emit(buffer)
    res.write('data: [DONE]\\n\\n')
    res.end()
  } catch (error) {
    if (!res.headersSent) return sendJson(res, 500, { error: error instanceof Error ? error.message : 'AI 解读失败' })
    res.end()
  }
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Tianyan AI service listening on ${PORT}`)
})
