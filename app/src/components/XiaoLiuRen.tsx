import { useEffect, useState } from 'react'
import { calculateXiaoLiuRen, XIAO_LIU_REN_PALACES } from '@/lib/xiaoliuren'

const SHICHEN = [
  { name: '子时', range: '23:00–00:59' },
  { name: '丑时', range: '01:00–02:59' },
  { name: '寅时', range: '03:00–04:59' },
  { name: '卯时', range: '05:00–06:59' },
  { name: '辰时', range: '07:00–08:59' },
  { name: '巳时', range: '09:00–10:59' },
  { name: '午时', range: '11:00–12:59' },
  { name: '未时', range: '13:00–14:59' },
  { name: '申时', range: '15:00–16:59' },
  { name: '酉时', range: '17:00–18:59' },
  { name: '戌时', range: '19:00–20:59' },
  { name: '亥时', range: '21:00–22:59' },
]

type Cast = { month: number; day: number; hour: number; question: string; category: string; timestamp: string }
const categories = ['综合', '事业', '感情', '财务', '出行', '寻物', '学业']
const guidance: Record<string, string> = {
  综合: '明确目标、核实事实，再决定下一步。',
  事业: '梳理任务、沟通对象与实际期限，优先完成可控事项。',
  感情: '尊重双方意愿，通过直接沟通了解真实情况。',
  财务: '核对预算、合同及风险，不以起课结果决定投资。',
  出行: '核实交通、天气与安全条件，准备备用方案。',
  寻物: '回顾最后使用地点，按时间顺序检查并联系相关人员。',
  学业: '检查学习进度，安排复习与反馈。'
}
function currentTime() {
  try {
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-u-ca-chinese', {month:'numeric',day:'numeric'}).formatToParts(now)
  const month = parseInt(parts.find(p => p.type === 'month')?.value ?? '', 10)
  const day = parseInt(parts.find(p => p.type === 'day')?.value ?? '', 10)
  if (!(month >= 1 && month <= 12 && day >= 1 && day <= 30)) return null
  return {month, day, hour: Math.floor((now.getHours()+1)/2)%12}
  } catch { return null }
}
export function XiaoLiuRen() {
  const [month, setMonth] = useState(() => currentTime()?.month ?? 1)
  const [day, setDay] = useState(() => currentTime()?.day ?? 1)
  const [hour, setHour] = useState(() => currentTime()?.hour ?? 0)
  const [category, setCategory] = useState('综合')
  const [history, setHistory] = useState<Cast[]>([])
  const [timeError, setTimeError] = useState(() => currentTime() ? '' : '无法自动识别农历，请手动核对月日及时辰。')
  const [question, setQuestion] = useState('')
  const [cast, setCast] = useState<Cast | null>(null)
  const [step, setStep] = useState(0)
  const result = calculateXiaoLiuRen(cast?.month ?? month, cast?.day ?? day, cast?.hour ?? hour)
  const casting = !!cast && step < 3
  useEffect(() => {
    if (!cast || step >= 3) return
    const timer = window.setTimeout(() => setStep(value => value + 1), window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 20 : 650)
    return () => window.clearTimeout(timer)
  }, [cast, step])
  const highlighted = step === 0 ? 0 : step === 1 ? result.monthPalaceIndex : step === 2 ? result.dayPalaceIndex : result.resultIndex
  const monthName = XIAO_LIU_REN_PALACES[result.monthPalaceIndex].name
  const dayName = XIAO_LIU_REN_PALACES[result.dayPalaceIndex].name

  return (
    <div className="xiaoliuren-page">
      <section className="xiaoliuren-intro">
        <span className="xiaoliuren-eyebrow">TIANYAN / SIX SPIRITS DIVINATION</span>
        <h2>小六壬</h2>
        <p>以农历月、日与时辰起课，依六宫掌诀顺数，查看当下事项的传统象意。</p>
        <div className="xiaoliuren-tags"><span>大安</span><i /> <span>留连</span><i /> <span>速喜</span><i /> <span>赤口</span><i /> <span>小吉</span><i /> <span>空亡</span></div>
      </section>

      <form className="xiaoliuren-input-card" onSubmit={event => { event.preventDefault(); if (!question.trim() || casting) return; setStep(0); const entry = {month, day, hour, question: question.trim(), category, timestamp: new Date().toISOString()}; setCast(entry); setHistory(items => [entry, ...items].slice(0,20)) }}>
        <div className="xiaoliuren-card-heading"><div><small>01 / CAST YOUR READING</small><h3>起课资料</h3></div><span>手动输入农历</span></div>
        <label className="mb-4 block text-sm font-semibold">您想了解什么？<textarea required maxLength={300} rows={3} value={question} disabled={casting} onChange={event => setQuestion(event.target.value)} placeholder="例如：近期工作安排应注意什么？" className="mt-2 block w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm font-normal" /></label>
        <div className="mb-4 flex flex-wrap gap-2">{categories.map(item => <button key={item} type="button" disabled={casting} aria-pressed={category === item} onClick={() => setCategory(item)} className={category === item ? 'rounded-full bg-neutral-900 px-3 py-1 text-sm text-white' : 'rounded-full border border-neutral-300 px-3 py-1 text-sm'}>{item}</button>)}</div>
        <button type="button" disabled={casting} className="mb-3 text-sm underline" onClick={() => {const time = currentTime(); if (!time) {setTimeError('无法识别当前农历，请手动选择。'); return} setMonth(time.month);setDay(time.day);setHour(time.hour);setTimeError('')}}>使用当前农历与时辰（设备当地时间）</button>
        {timeError && <p role="alert">{timeError}</p>}
        <div className="xiaoliuren-fields">
          <label>农历月份
            <select disabled={casting} value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}月</option>)}
            </select>
          </label>
          <label>农历日期
            <select disabled={casting} value={day} onChange={(event) => setDay(Number(event.target.value))}>
              {Array.from({ length: 30 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}日</option>)}
            </select>
          </label>
          <label>时辰
            <select disabled={casting} value={hour} onChange={(event) => setHour(Number(event.target.value))}>
              {SHICHEN.map((item, index) => <option key={item.name} value={index}>{item.name}（{item.range}）</option>)}
            </select>
          </label>
        </div>
        <p className="xiaoliuren-hint">请按起课时刻对应的农历月日选择。闰月按该月序号起课；不同传承的闰月处理可能不同。</p>
        <button type="submit" disabled={!question.trim() || casting} className="mt-4 w-full rounded-xl bg-neutral-900 px-5 py-3 font-semibold text-white disabled:opacity-50">{casting ? "正在起课…" : cast ? "重新起课" : "开始起课"}</button>
      </form>

      {cast && <section className="xiaoliuren-result-card" aria-live="polite">
        <div className="xiaoliuren-card-heading"><div><small>02 / THE RESULT</small><h3>本课落宫</h3></div><span>常见六宫掌诀法</span></div>
        <p className="mb-4 break-words text-sm text-neutral-600">所问事项：{cast.question}</p>
        {casting ? <div role="status" className="rounded-xl bg-neutral-50 p-6 text-center"><div className="mx-auto mb-3 h-10 w-10 rounded-full border-2 border-neutral-200 border-t-amber-700 motion-safe:animate-spin" /><p>{["正月起大安 · 正在数月","月宫起初一 · 正在数日","日宫起子时 · 正在数时"][step]}</p></div> : <div className="xiaoliuren-result-main">
          <div className="xiaoliuren-seal"><span>{result.palace.nature === '吉' ? '吉' : result.palace.nature === '平' ? '平' : '慎'}</span><strong>{result.palace.name}</strong><small>{result.palace.element} · {result.palace.direction}</small></div>
          <div className="xiaoliuren-reading"><span className={'xiaoliuren-nature nature-' + result.palace.nature}>{result.palace.nature}象</span><h4>{result.palace.summary}</h4><p>{result.palace.detail}</p><p className="mt-3 text-sm">{cast.category}事项建议：{guidance[cast.category]} 以上仅为传统象意与一般行动建议，不是确定预测。</p></div>
        </div>}
        <div className="xiaoliuren-steps">
          <div><small>起月</small><strong>{cast.month}月 → {step >= 1 ? monthName : "待定"}</strong><span>正月起大安，逐月顺数</span></div>
          <div><small>数日</small><strong>{cast.day}日 → {step >= 2 ? dayName : "待定"}</strong><span>从月宫起初一，逐日顺数</span></div>
          <div><small>数时</small><strong>{SHICHEN[cast.hour].name} → {step >= 3 ? result.palace.name : "待定"}</strong><span>从日宫起子时，逐时顺数</span></div>
        </div>
      </section>}

      <section className="xiaoliuren-palace-card">
        <div className="xiaoliuren-card-heading"><div><small>03 / SIX PALACES</small><h3>六宫象意</h3></div><span>起课时依次点亮六宫</span></div>
        <div className="xiaoliuren-palace-grid">
          {XIAO_LIU_REN_PALACES.map((palace, index) => <article key={palace.name} className={cast && highlighted === index ? 'active motion-safe:transition-all motion-safe:duration-300' : ''}>
            <span>0{index + 1}</span><strong>{palace.name}</strong><small>{palace.nature} · {palace.element}</small><p>{palace.summary}</p>
          </article>)}
        </div>
      </section>
      {history.length > 0 && <section className="xiaoliuren-input-card"><div className="flex items-center justify-between"><h3 className="font-semibold">本次会话起课记录</h3><button type="button" onClick={() => setHistory([])} className="text-sm underline">清空记录</button></div>{history.map((item,index) => <button key={item.timestamp + index} type="button" disabled={casting} onClick={() => {setCast(item);setStep(3)}} className="mt-2 block w-full rounded-lg border border-neutral-200 p-3 text-left"><strong>{item.category} · {calculateXiaoLiuRen(item.month,item.day,item.hour).palace.name}</strong><p className="break-words text-sm">{item.question}</p><small>{new Date(item.timestamp).toLocaleString()}</small></button>)}</section>}
      <p className="xiaoliuren-disclaimer">说明：小六壬属于传统民俗术数的象意参考，不是经科学验证的预测工具。此处采用常见“正月起大安、月日起日宫、时辰起课”的掌诀法；各地与师承在起课、闰月及子时换日等细节上可能有差异。请勿将结果作为医疗、法律、投资或其他重大决策的唯一依据。</p>
    </div>
  )
}
