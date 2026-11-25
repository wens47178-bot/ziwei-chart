import { useMemo, useState } from 'react'
import { useChartStore } from '@/stores'
import { createLocalCalendarDate } from '@/lib/horoscope'
import { extractKnowledge, getStarInfo } from '@/knowledge'

export type AdvancedMode = 'palaces' | 'sihua' | 'decadal' | 'stars' | 'patterns' | 'trines'

const MUTAGENS = ['禄', '权', '科', '忌'] as const
const PALACE_ORDER = ['命宫', '兄弟宫', '夫妻宫', '子女宫', '财帛宫', '疾厄宫', '迁移宫', '交友宫', '官禄宫', '田宅宫', '福德宫', '父母宫']

const MODE_META: Record<AdvancedMode, { title: string; subtitle: string }> = {
  palaces: { title: '十二宫深度解析', subtitle: '逐宫查看宫干、星曜、亮度、四化与大限范围' },
  sihua: { title: '四化飞星', subtitle: '分别查看本命、大限与流年四化，追踪禄权科忌落宫' },
  decadal: { title: '大限运程', subtitle: '按指定年份定位当前大限，并核对大限宫位与四化' },
  stars: { title: '星曜图鉴', subtitle: '从本命盘实际出现的星曜进入星性与宫位说明' },
  patterns: { title: '命盘格局提示', subtitle: '根据命盘星曜位置筛选可核对的组合提示，并展示判断依据' },
  trines: { title: '三方四正', subtitle: '以选定宫位为中心，查看三合宫与对宫的实际星曜配置' },
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="mb-6"><p className="text-[10px] tracking-[.22em] text-[#a58a5d]">{eyebrow}</p><h2 className="mt-2 text-2xl font-semibold text-[#292620]">{title}</h2><p className="mt-2 text-sm leading-7 text-[#898273]">{description}</p></div>
}

function Pill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full border border-[#e6dfd2] bg-[#faf8f3] px-2.5 py-1 text-xs text-[#76684e]">{children}</span>
}

export function AdvancedAnalysis({ mode }: { mode: AdvancedMode }) {
  const { chart, birthInfo } = useChartStore()
  const [selectedPalace, setSelectedPalace] = useState('命宫')
  const [selectedStar, setSelectedStar] = useState('')
  const [targetYear, setTargetYear] = useState(new Date().getFullYear())

  const palaces = useMemo(() => chart?.palaces ?? [], [chart])
  const selected = palaces.find((palace) => palace.name === selectedPalace) ?? palaces[0]
  const horoscope = useMemo(() => {
    if (!chart) return null
    try { return chart.horoscope(createLocalCalendarDate(targetYear, 6, 15)) } catch { return null }
  }, [chart, targetYear])

  const patternHints = useMemo(() => chart ? extractKnowledge(chart, birthInfo?.year).格局提示 : [], [chart, birthInfo?.year])
  const trinePalaces = useMemo(() => {
    if (!selected) return []
    const byIndex = (offset: number) => palaces.find((palace) => palace.index === (selected.index + offset + 12) % 12)
    return [
      { label: '本宫', palace: selected },
      { label: '三合宫一', palace: byIndex(4) },
      { label: '三合宫二', palace: byIndex(8) },
      { label: '对宫', palace: byIndex(6) },
    ].filter((item) => item.palace)
  }, [palaces, selected])

  const observedStars = useMemo(() => {
    const names = new Set<string>()
    for (const palace of palaces) {
      for (const star of [...(palace.majorStars ?? []), ...(palace.minorStars ?? [])]) names.add(String(star.name))
      for (const star of palace.adjectiveStars ?? []) names.add(String(star.name))
    }
    return [...names].sort((a, b) => a.localeCompare(b, 'zh-CN'))
  }, [palaces])
  const activeStar = observedStars.includes(selectedStar) ? selectedStar : (observedStars[0] ?? '')

  if (!chart) return <div className="rounded-2xl border border-dashed border-[#ded8cc] p-10 text-center text-sm text-[#8c8579]">请先建立命盘，再查看这项分析。</div>

  return <div className="space-y-6">
    <div className="rounded-2xl border border-[#e9e5dc] bg-white p-5 md:p-7">
      <SectionHeading eyebrow={`ANALYSIS / ${mode.toUpperCase()}`} title={MODE_META[mode].title} description={MODE_META[mode].subtitle} />

      {mode === 'palaces' && <>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {PALACE_ORDER.map((name) => <button key={name} onClick={() => setSelectedPalace(name)} className={`rounded-xl border px-3 py-3 text-sm transition ${selectedPalace === name ? 'border-[#bda77e] bg-[#f8f5ee] text-[#5f4d2f]' : 'border-[#e8e5df] bg-white text-[#777166] hover:bg-[#faf9f6]'}`}>{name}</button>)}
        </div>
        {selected && <div className="mt-5 rounded-2xl bg-[#faf9f6] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs tracking-widest text-[#a58a5d]">{selected.heavenlyStem}{selected.earthlyBranch} PALACE</p><h3 className="mt-1 text-xl font-semibold text-[#2d2922]">{selected.name}{selected.isBodyPalace ? ' · 身宫' : ''}</h3></div><Pill>大限 {selected.decadal?.range?.join('–') ?? '未提供'} 岁</Pill></div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><p className="mb-2 text-xs text-[#9a907f]">主星</p><div className="flex flex-wrap gap-2">{(selected.majorStars ?? []).map((star, i) => <Pill key={i}>{star.name}{star.brightness ? ` · ${star.brightness}` : ''}{star.mutagen ? ` · 化${star.mutagen}` : ''}</Pill>)}{!selected.majorStars?.length && <span className="text-sm text-[#8c8579]">无主星，需结合对宫参考</span>}</div></div>
            <div><p className="mb-2 text-xs text-[#9a907f]">辅星</p><div className="flex flex-wrap gap-2">{(selected.minorStars ?? []).map((star, i) => <Pill key={i}>{star.name}{star.mutagen ? ` · 化${star.mutagen}` : ''}</Pill>)}{!selected.minorStars?.length && <span className="text-sm text-[#8c8579]">暂无辅星记录</span>}</div></div>
            <div><p className="mb-2 text-xs text-[#9a907f]">杂曜</p><div className="flex flex-wrap gap-2">{(selected.adjectiveStars ?? []).map((star, i) => <Pill key={i}>{star.name}</Pill>)}{!selected.adjectiveStars?.length && <span className="text-sm text-[#8c8579]">暂无杂曜记录</span>}</div></div>
            <div><p className="mb-2 text-xs text-[#9a907f]">宫位辅助信息</p><div className="flex flex-wrap gap-2"><Pill>长生：{selected.changsheng12 || '—'}</Pill><Pill>博士：{selected.boshi12 || '—'}</Pill><Pill>宫干：{selected.heavenlyStem || '—'}</Pill></div></div>
          </div>
        </div>}
      </>}

      {mode === 'sihua' && <>
        <div className="grid gap-4 md:grid-cols-3">
          {(['origin', 'decadal', 'yearly'] as const).map((scope) => {
            const title = scope === 'origin' ? '本命四化' : scope === 'decadal' ? '大限四化' : '流年四化'
            const palaceNames = scope === 'origin' ? [] : horoscope?.[scope]?.palaceNames ?? []
            const mutagens = scope === 'origin' ? [] : horoscope?.[scope]?.mutagen ?? []
            const placements = scope === 'origin'
              ? palaces.flatMap((palace) => [...(palace.majorStars ?? []), ...(palace.minorStars ?? [])].filter((star) => star.mutagen).map((star) => ({ palace: palace.name, star: String(star.name), mutagen: String(star.mutagen) })))
              : palaceNames.flatMap((palaceName) => MUTAGENS.filter((mutagen) => horoscope?.hasHoroscopeMutagen(palaceName as never, scope, mutagen as never)).map((mutagen) => ({ palace: palaceName, star: '', mutagen })))
            return <div key={scope} className="rounded-xl border border-[#e9e5dc] p-4"><p className="text-sm font-semibold text-[#554b39]">{title}</p><div className="mt-3 space-y-2">{placements.map((item, i) => <div key={i} className="flex items-center justify-between gap-2 border-b border-[#f0eee9] pb-2 text-sm"><span className="text-[#625c51]">{item.star ? `${item.star}化${item.mutagen}` : `化${item.mutagen}`}</span><span className="rounded-full bg-[#faf8f3] px-2.5 py-1 text-xs text-[#76684e]">{item.palace}</span></div>)}{placements.length === 0 && <p className="text-xs leading-6 text-[#9a9387]">{scope === 'origin' ? '本命星曜未返回四化标记。' : '当前盘层没有可确认的四化落宫。'}</p>}</div>{scope !== 'origin' && <p className="mt-3 text-[11px] text-[#9a9387]">干支：{horoscope?.[scope]?.heavenlyStem ?? '—'} · 四化：{mutagens.join('、') || '—'}</p>}</div>
          })}
        </div>
        <div className="mt-4 rounded-xl bg-[#faf9f6] p-4 text-xs leading-6 text-[#898273]">本命四化来自星曜本身的四化标记；大限与流年落宫由排盘引擎按对应盘层查询。不同盘层分开呈现，不混用本命四化标签。</div>
      </>}

      {mode === 'decadal' && <>
        <div className="flex flex-wrap items-end gap-3 rounded-xl bg-[#faf9f6] p-4">
          <label className="flex flex-col gap-2 text-xs text-[#827a6d]">定位年份<input type="number" min="1" max="9999" value={targetYear} onChange={(event) => setTargetYear(Number(event.target.value))} className="w-36 rounded-xl border border-[#dedbd5] bg-white px-3 py-2.5 text-sm text-[#37332d]" /></label>
          <Pill>出生年份：{birthInfo?.year ?? '—'}</Pill>
          <Pill>对应虚实岁以排盘引擎为准</Pill>
        </div>
        {horoscope && <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-[#e9e5dc] p-5"><p className="text-xs tracking-widest text-[#a58a5d]">CURRENT DECADAL</p><h3 className="mt-2 text-xl font-semibold text-[#302b23]">{horoscope.decadal.palaceNames[0] ?? '未取得大限命宫'}</h3><p className="mt-3 text-sm text-[#766f63]">大限天干：{horoscope.decadal.heavenlyStem || '—'}</p><p className="mt-2 text-sm text-[#766f63]">大限四化：{horoscope.decadal.mutagen.join('、') || '—'}</p></div>
          <div className="rounded-xl border border-[#e9e5dc] p-5"><p className="text-xs tracking-widest text-[#a58a5d]">YEARLY OVERLAY</p><h3 className="mt-2 text-xl font-semibold text-[#302b23]">{horoscope.yearly.palaceNames[0] ?? '未取得流年命宫'}</h3><p className="mt-3 text-sm text-[#766f63]">流年干支：{horoscope.yearly.heavenlyStem}{horoscope.yearly.earthlyBranch}</p><p className="mt-2 text-sm text-[#766f63]">流年四化：{horoscope.yearly.mutagen.join('、') || '—'}</p></div>
        </div>}
        {horoscope && <div className="mt-5 rounded-xl bg-[#faf9f6] p-5"><h3 className="font-semibold text-[#554b39]">当前大限十二宫映射</h3><div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{horoscope.decadal.palaceNames.map((name, i) => <div key={i} className="rounded-lg border border-[#ebe6dc] bg-white px-3 py-2 text-xs text-[#6e6658]"><span className="mr-2 text-[#b19a6e]">{String(i + 1).padStart(2, '0')}</span>{name}</div>)}</div></div>}
        {!horoscope && <p className="mt-4 text-sm text-[#8c8579]">当前年份无法取得运限资料，请检查年份后重试。</p>}
      </>}

      {mode === 'patterns' && <>
        <div className="rounded-xl bg-[#faf9f6] p-4 text-xs leading-6 text-[#898273]">以下为规则筛选提示，不等同于完整古法格局定论。每条结果均需结合全盘、亮度、四化与流派规则复核；未满足规则时不会强行生成格局。</div>
        <div className="mt-4 space-y-3">{patternHints.map((hint, i) => <div key={i} className="rounded-xl border border-[#e9e5dc] p-4"><div className="flex items-start gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#f5f0e5] text-xs text-[#92794f]">{String(i + 1).padStart(2, '0')}</span><p className="text-sm leading-7 text-[#5f594e]">{hint}</p></div></div>)}{patternHints.length === 0 && <div className="rounded-xl border border-dashed border-[#ded8cc] p-8 text-center text-sm text-[#8c8579]">当前规则未检出已收录的格局提示。未检出不代表命盘没有其他格局。</div>}</div>
      </>}

      {mode === 'trines' && <>
        <div className="flex flex-wrap gap-2">{PALACE_ORDER.map((name) => <button key={name} onClick={() => setSelectedPalace(name)} className={`rounded-xl border px-3 py-2 text-sm ${selectedPalace === name ? 'border-[#bda77e] bg-[#f8f5ee] text-[#5f4d2f]' : 'border-[#e8e5df] text-[#777166]'}`}>{name}</button>)}</div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">{trinePalaces.map(({ label, palace }) => palace && <div key={label} className="rounded-xl border border-[#e9e5dc] p-4"><div className="flex items-center justify-between"><span className="text-xs tracking-wider text-[#a58a5d]">{label}</span><Pill>{palace.heavenlyStem}{palace.earthlyBranch}</Pill></div><h3 className="mt-2 text-lg font-semibold text-[#302b23]">{palace.name}{palace.isBodyPalace ? ' · 身宫' : ''}</h3><div className="mt-3 flex flex-wrap gap-2">{[...(palace.majorStars ?? []), ...(palace.minorStars ?? [])].map((star, i) => <Pill key={i}>{star.name}{star.brightness ? ` · ${star.brightness}` : ''}{star.mutagen ? ` · 化${star.mutagen}` : ''}</Pill>)}{!(palace.majorStars?.length || palace.minorStars?.length) && <span className="text-xs text-[#9a9387]">当前宫位未记录主星或辅星</span>}</div></div>)}</div>
        <p className="mt-4 rounded-xl bg-[#faf9f6] p-4 text-xs leading-6 text-[#898273]">此处按排盘数组的十二宫索引展示三合（相隔四宫）与对宫（相隔六宫）位置，提供结构核对，不直接推断吉凶。</p>
      </>}

      {mode === 'stars' && <>
        <div className="flex flex-wrap gap-2">{observedStars.map((name) => <button key={name} onClick={() => setSelectedStar(name)} className={`rounded-full border px-3 py-2 text-xs ${activeStar === name ? 'border-[#bda77e] bg-[#f8f5ee] text-[#5f4d2f]' : 'border-[#e8e5df] text-[#777166]'}`}>{name}</button>)}</div>
        {(() => {
          const info = getStarInfo(activeStar)
          const placements = palaces.flatMap((palace) => [...(palace.majorStars ?? []), ...(palace.minorStars ?? []), ...(palace.adjectiveStars ?? [])].filter((star) => String(star.name) === activeStar).map(() => palace.name))
          return <div className="mt-5 rounded-2xl bg-[#faf9f6] p-5"><p className="text-xs tracking-widest text-[#a58a5d]">STAR PROFILE</p><h3 className="mt-2 text-2xl font-semibold text-[#302b23]">{activeStar}</h3>{info ? <><p className="mt-2 text-sm text-[#847a68]">{info.group} · {info.wuxing} · {info.yinyang}</p><p className="mt-4 text-sm leading-7 text-[#5f594e]">{info.description}</p><div className="mt-4 flex flex-wrap gap-2">{info.traits.map((trait) => <Pill key={trait}>{trait}</Pill>)}</div></> : <p className="mt-3 text-sm leading-7 text-[#827a6d]">知识库暂未收录这颗星曜的详细释义；此处只显示命盘中实际出现的位置，不补造星性说明。</p>}<div className="mt-5 border-t border-[#e7e2d8] pt-4"><p className="text-xs text-[#9a907f]">本命盘落宫</p><div className="mt-2 flex flex-wrap gap-2">{placements.map((name, i) => <Pill key={i}>{name}</Pill>)}{placements.length === 0 && <span className="text-sm text-[#8c8579]">当前命盘未发现此星曜</span>}</div></div></div>
        })()}
      </>}
    </div>
  </div>
}
