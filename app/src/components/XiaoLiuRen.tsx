import { useMemo, useState } from 'react'
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
  const result = useMemo(() => calculateXiaoLiuRen(month, day, hour), [month, day, hour])
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

      <section className="xiaoliuren-input-card">
        <div className="xiaoliuren-card-heading"><div><small>01 / CAST YOUR READING</small><h3>起课资料</h3></div><span>手动输入农历</span></div>
        <div className="xiaoliuren-fields">
          <label>农历月份
            <select value={month} onChange={(event) => setMonth(Number(event.target.value))}>
              {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}月</option>)}
            </select>
          </label>
          <label>农历日期
            <select value={day} onChange={(event) => setDay(Number(event.target.value))}>
              {Array.from({ length: 30 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}日</option>)}
            </select>
          </label>
          <label>时辰
            <select value={hour} onChange={(event) => setHour(Number(event.target.value))}>
              {SHICHEN.map((item, index) => <option key={item.name} value={index}>{item.name}（{item.range}）</option>)}
            </select>
          </label>
        </div>
        <p className="xiaoliuren-hint">请按起课时刻对应的农历月日选择。闰月按该月序号起课；不同传承的闰月处理可能不同。</p>
      </section>

      <section className="xiaoliuren-result-card">
        <div className="xiaoliuren-card-heading"><div><small>02 / THE RESULT</small><h3>本课落宫</h3></div><span>常见六宫掌诀法</span></div>
        <div className="xiaoliuren-result-main">
          <div className="xiaoliuren-seal"><span>{result.palace.nature === '吉' ? '吉' : result.palace.nature === '平' ? '平' : '慎'}</span><strong>{result.palace.name}</strong><small>{result.palace.element} · {result.palace.direction}</small></div>
          <div className="xiaoliuren-reading"><span className={'xiaoliuren-nature nature-' + result.palace.nature}>{result.palace.nature}象</span><h4>{result.palace.summary}</h4><p>{result.palace.detail}</p></div>
        </div>
        <div className="xiaoliuren-steps">
          <div><small>起月</small><strong>{month}月 → {monthName}</strong><span>正月起大安，逐月顺数</span></div>
          <div><small>数日</small><strong>{day}日 → {dayName}</strong><span>从月宫起初一，逐日顺数</span></div>
          <div><small>数时</small><strong>{SHICHEN[hour].name} → {result.palace.name}</strong><span>从日宫起子时，逐时顺数</span></div>
        </div>
      </section>

      <section className="xiaoliuren-palace-card">
        <div className="xiaoliuren-card-heading"><div><small>03 / SIX PALACES</small><h3>六宫象意</h3></div><span>点击查看当前落宫</span></div>
        <div className="xiaoliuren-palace-grid">
          {XIAO_LIU_REN_PALACES.map((palace, index) => <article key={palace.name} className={result.resultIndex === index ? 'active' : ''}>
            <span>0{index + 1}</span><strong>{palace.name}</strong><small>{palace.nature} · {palace.element}</small><p>{palace.summary}</p>
          </article>)}
        </div>
      </section>
      <p className="xiaoliuren-disclaimer">说明：小六壬属于传统民俗术数的象意参考，不是经科学验证的预测工具。此处采用常见“正月起大安、月日起日宫、时辰起课”的掌诀法；各地与师承在起课、闰月及子时换日等细节上可能有差异。请勿将结果作为医疗、法律、投资或其他重大决策的唯一依据。</p>
    </div>
  )
}
