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

export function XiaoLiuRen() {
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState(0)
  const [question, setQuestion] = useState('')
  const [cast, setCast] = useState<{ month: number; day: number; hour: number; question: string } | null>(null)
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

      <form className="xiaoliuren-input-card" onSubmit={event => { event.preventDefault(); if (!question.trim() || casting) return; setStep(0); setCast({month, day, hour, question: question.trim()}) }}>
        <div className="xiaoliuren-card-heading"><div><small>01 / CAST YOUR READING</small><h3>起课资料</h3></div><span>手动输入农历</span></div>
        <label className="mb-4 block text-sm font-semibold">您想了解什么？<textarea required maxLength={300} rows={3} value={question} disabled={casting} onChange={event => setQuestion(event.target.value)} placeholder="例如：近期工作安排应注意什么？" className="mt-2 block w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm font-normal" /></label>
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
          <div className="xiaoliuren-reading"><span className={'xiaoliuren-nature nature-' + result.palace.nature}>{result.palace.nature}象</span><h4>{result.palace.summary}</h4><p>{result.palace.detail}</p><p className="mt-3 text-sm">结合所问事项，可将上述象意作为反思和行动安排的参考，而非确定预测。</p></div>
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
      <p className="xiaoliuren-disclaimer">说明：小六壬属于传统民俗术数的象意参考，不是经科学验证的预测工具。此处采用常见“正月起大安、月日起日宫、时辰起课”的掌诀法；各地与师承在起课、闰月及子时换日等细节上可能有差异。请勿将结果作为医疗、法律、投资或其他重大决策的唯一依据。</p>
    </div>
  )
}
