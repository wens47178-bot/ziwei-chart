/* 天衍：参考图驱动的独立功能工作台 */
import { lazy, Suspense, useState, type ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import '@/perf-lazy-load.css'
import { SettingsPanel } from '@/components/SettingsPanel'
import { useChartStore } from '@/stores'
import { HomeLanding } from '@/components/HomeLanding'
import type { AdvancedMode } from '@/components/AdvancedAnalysis'

const BirthForm = lazy(() => import('@/components/BirthForm').then((module) => ({ default: module.BirthForm })))
const ChartDisplay = lazy(() => import('@/components/chart').then((module) => ({ default: module.ChartDisplay })))
const AIInterpretation = lazy(() => import('@/components/AIInterpretation').then((module) => ({ default: module.AIInterpretation })))
const YearlyFortune = lazy(() => import('@/components/fortune').then((module) => ({ default: module.YearlyFortune })))
const LifeKLine = lazy(() => import('@/components/kline').then((module) => ({ default: module.LifeKLine })))
const MatchAnalysis = lazy(() => import('@/components/match').then((module) => ({ default: module.MatchAnalysis })))
const ShareCard = lazy(() => import('@/components/share').then((module) => ({ default: module.ShareCard })))
const AdvancedAnalysis = lazy(() => import('@/components/AdvancedAnalysis').then((module) => ({ default: module.AdvancedAnalysis })))
const LunarMonthlyKLine = lazy(() => import('@/components/kline/LunarMonthlyKLine').then((module) => ({ default: module.LunarMonthlyKLine })))
const AcademicCenter = lazy(() => import('@/components/AcademicCenter').then((module) => ({ default: module.AcademicCenter })))
const XiaoLiuRen = lazy(() => import('@/components/XiaoLiuRen').then((module) => ({ default: module.XiaoLiuRen })))

export type PageKey = 'birth' | 'chart' | 'palaces' | 'sihua' | 'decadal' | 'stars' | 'patterns' | 'trines' | 'fortune' | 'lunar' | 'kline' | 'match' | 'ai' | 'share' | 'academy' | 'xiaoliuren'
type PageMeta = { key: PageKey; label: string; en: string; title: string; subtitle: string; note: string; icon: string }

const PAGES: PageMeta[] = [
  { key: 'birth', label: '起紫微命盘', en: '01 / DESTINY ENGINE', title: '起紫微命盘', subtitle: '输入出生年月日時', note: '以准确的出生资料为起点，建立专属命盘。', icon: '✳' },
  { key: 'chart', label: '本命十二宫', en: '02 / NATAL CHART', title: '本命十二宫', subtitle: '十二宫位 · 星曜结构 · 命身格局', note: '从十二宫与星曜落点，逐层认识本命结构。', icon: '⌘' },
  { key: 'palaces', label: '十二宫详解', en: '03 / TWELVE PALACES', title: '十二宫深度解析', subtitle: '宫位结构 · 星曜组合 · 宫干信息', note: '逐宫检视星曜配置与宫位结构，查看命盘细节。', icon: '▦' },
  { key: 'sihua', label: '四化飞星', en: '04 / FOUR TRANSFORMATIONS', title: '四化飞星', subtitle: '本命四化 · 大限四化 · 流年四化', note: '区分不同盘层的禄权科忌，查看实际落宫。', icon: '✧' },
  { key: 'decadal', label: '大限运程', en: '05 / DECADAL CYCLES', title: '大限运程', subtitle: '十年运限 · 大限命宫 · 流年叠宫', note: '指定年份定位大限，观察大限与流年的盘层关系。', icon: '◷' },
  { key: 'stars', label: '星曜图鉴', en: '06 / STAR ATLAS', title: '星曜图鉴', subtitle: '主星 · 辅星 · 星曜落宫', note: '从命盘实际出现的星曜进入知识说明与落宫查看。', icon: '✦' },
  { key: 'patterns', label: '命盘格局', en: '07 / CHART PATTERNS', title: '命盘格局提示', subtitle: '星曜组合 · 格局依据 · 判断边界', note: '展示当前规则可以核对的格局线索，并保留判断依据。', icon: '✥' },
  { key: 'trines', label: '三方四正', en: '08 / TRIANGLE & OPPOSITION', title: '三方四正', subtitle: '本宫 · 三合宫 · 对宫', note: '查看选定宫位的三合与对宫星曜结构。', icon: '⌘' },
  { key: 'fortune', label: '年度运势', en: '09 / YEARLY ALMANAC', title: '年度运势', subtitle: '流年主题 · 重点宫位 · 行动提醒', note: '查看当年运势重点与阶段变化。', icon: '◷' },
  { key: 'lunar', label: '农历流月', en: '10 / LUNAR MONTHLY CYCLES', title: '农历流月趋势', subtitle: '农历月份 · 闰月拆分 · 流日四化', note: '独立查看农历月份与闰月区间的趋势变化。', icon: '☾' },
  { key: 'kline', label: '人生趋势', en: '11 / LIFE TIMELINE', title: '人生趋势 K 线', subtitle: '大限走势 · 年度变化 · 农历流月', note: '以时间轴与数据图表观察人生不同阶段。', icon: '⌁' },
  { key: 'match', label: '双人合盘', en: '12 / SYNASTRY', title: '双人合盘', subtitle: '双方资料 · 宫位关联 · 互动主题', note: '并列比较两张命盘，理解彼此的互动结构。', icon: '◉' },
  { key: 'ai', label: 'AI 深度解读', en: '13 / AI INTERPRETATION', title: 'AI 深度解读', subtitle: '命格批注 · 事业财帛 · 情感人际', note: '基于命盘资料与知识上下文生成辅助解读。', icon: '✧' },
  { key: 'share', label: '命盘典藏卡', en: '14 / PERSONAL KEEPSAKE', title: '命盘典藏卡', subtitle: '命盘摘要 · 专属金句 · 保存分享', note: '将命盘重点整理成可保存与分享的个人卡片。', icon: '◇' },
  { key: 'xiaoliuren', label: '小六壬', en: '16 / SIX SPIRITS DIVINATION', title: '小六壬', subtitle: '六宫掌诀 · 农历月日 · 时辰起课', note: '以传统六宫掌诀起课，查看大安、留连、速喜、赤口、小吉与空亡的象意。', icon: '☯' },
  { key: 'academy', label: '学术中心', en: '15 / ACADEMIC LIBRARY', title: '学术中心', subtitle: '命理典籍 · 流派参考 · 研读路径', note: '从书目、知识来源与循序研读路径，系统了解传统命理。', icon: '▤' },
]

export default function App() {
  const { chart, birthInfo } = useChartStore()
  const [activePage, setActivePage] = useState<PageKey | 'home'>('home')
  const [pendingPage, setPendingPage] = useState<PageKey>('chart')
  const [showSettings, setShowSettings] = useState(false)
  const [expandedChart, setExpandedChart] = useState(false)
  const [analysisView, setAnalysisView] = useState<'report' | 'chat'>('report')
  const page = PAGES.find((item) => item.key === activePage) ?? PAGES[0]

  const chartPages: PageKey[] = ['chart','palaces','sihua','decadal','stars','patterns','trines','fortune','lunar','kline','ai','share']
  const hasChartWorkspace = !!chart && chartPages.includes(activePage as PageKey)
  const renderWorkspace = (): ReactNode => {
    if (activePage === 'birth') return <BirthForm onSuccess={() => setActivePage(pendingPage)} />
    if (activePage === 'chart') return chart ? <><AIInterpretation view={analysisView} />{analysisView === 'report' && <div className="mt-6 divide-y rounded-xl border border-neutral-200">{([['palaces','命盘依据'],['patterns','命盘推演'],['trines','三方四正联动'],['sihua','四化路径分析'],['decadal','大限运程'],['stars','星曜详情']] as const).map(([mode,label]) => <details key={mode} className="p-4"><summary className="cursor-pointer font-semibold">{label}</summary><AdvancedAnalysis mode={mode} /></details>)}</div>}</> : <PageEmpty onClick={() => { setPendingPage(activePage as PageKey); setActivePage('birth') }} />
    if (activePage === 'palaces' || activePage === 'sihua' || activePage === 'decadal' || activePage === 'stars' || activePage === 'patterns' || activePage === 'trines') return chart ? <AdvancedAnalysis mode={activePage as AdvancedMode} /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'fortune') return chart ? <YearlyFortune /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'lunar') return chart ? <LunarMonthlyKLine chart={chart} /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'kline') return chart ? <LifeKLine /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'match') return <MatchAnalysis />
    if (activePage === 'ai') return chart ? <AIInterpretation /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'share') return chart ? <ShareCard /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'academy') return <AcademicCenter />
    if (activePage === 'xiaoliuren') return <XiaoLiuRen />
    return null
  }

  if (activePage === 'home') return (
    <>
      <HomeLanding onEnter={(key) => { if (key !== 'home' && !chart && chartPages.includes(key)) { setPendingPage(key); setActivePage('birth') } else { setPendingPage('chart'); setActivePage(key) } }} onSettings={() => setShowSettings(true)} />
      {showSettings && <div className="settings-overlay" onClick={(event) => event.target === event.currentTarget && setShowSettings(false)}><div><SettingsPanel onClose={() => setShowSettings(false)} /></div></div>}
      <Analytics />
    </>
  )
  return (
    <div className="min-h-screen bg-[#fff] text-[#211f1b]">
      <header className="reference-header" style={hasChartWorkspace ? {height: 56, minHeight: 56, padding: "0 16px"} : undefined}>
        <button className="brand-lockup" onClick={() => setActivePage('home')} aria-label="天衍首页">
          <span className="brand-word">天衍</span><span className="brand-mark">✳</span>
          <span className="brand-caption">ZIWEI DESTINY STUDIO</span>
        </button>
        {hasChartWorkspace && <nav aria-label="命盘功能" className="flex min-w-0 flex-1 items-center gap-3 overflow-x-auto px-4 text-sm"><button className="shrink-0" onClick={() => setActivePage('birth')}>‹ 返回</button><span className="shrink-0 font-semibold">{birthInfo?.year}年{birthInfo?.month}月{birthInfo?.day}日</span>{([['chart','本命'],['decadal','大限'],['fortune','流年'],['lunar','流月']] as const).map(([key,label]) => <button key={key} onClick={() => setActivePage(key)} className={activePage === key ? 'shrink-0 rounded-lg bg-neutral-100 px-3 py-2 font-semibold' : 'shrink-0 px-2 py-2 text-neutral-600'}>{label}</button>)}<select aria-label="更多功能" value="" onChange={e => setActivePage(e.target.value as PageKey)} className="shrink-0 rounded border-0 bg-transparent text-xs"><option value="" disabled>更多功能</option>{PAGES.map(item => <option key={item.key} value={item.key}>{item.label}</option>)}</select></nav>}
        <div className="header-account">
          <span className="account-avatar">T</span>
          <span className="account-name">个人空间</span>
          <span className="account-divider">·</span>
          <span className="account-tier">标准版</span>
          <button className="account-menu" onClick={() => setShowSettings(true)} aria-label="打开设置">⌄</button>
        </div>
      </header>

      {activePage === 'birth' ? <main className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-center gap-12 px-6 py-8 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-20 lg:items-start">
        <section className="min-w-0 lg:sticky lg:top-24 lg:pl-8 lg:pt-56">
          <button type="button" onClick={() => setActivePage('home')} className="mb-10 text-sm text-neutral-500">‹ 返回首页</button>
          <p className="text-sm tracking-[.25em] text-[#92794d]">01 / DESTINY ENGINE</p>
          <h1 className="mt-5 text-5xl font-bold tracking-tight lg:text-7xl">起紫微命盘</h1>
          <p className="mt-5 text-neutral-500">输入出生年月日時</p>
          <div className="my-8 h-px w-24 bg-neutral-300" />
          <div className="flex justify-between text-sm text-neutral-500"><span>最近命盘 {chart && birthInfo ? 1 : 0}</span><span>本机保存</span></div>
          {chart && birthInfo ? <button type="button" onClick={() => setActivePage(pendingPage)} className="mt-4 flex w-full items-center justify-between border-b border-neutral-200 py-4 text-left"><span>{birthInfo.name && <strong className="mr-2">{birthInfo.name}</strong>}{birthInfo.dateType === 'lunar' ? '农历' : '公历'}{birthInfo.year}年{birthInfo.month}月{birthInfo.day}日<br/><small className="text-neutral-500">{birthInfo.birthplace || '未填写出生地'} · {birthInfo.gender === 'male' ? '男' : '女'}</small></span><span>›</span></button> : <p className="mt-4 text-sm text-neutral-400">暂无命盘</p>}
        </section>
        <section className="min-w-0 rounded-3xl border border-neutral-200 bg-white p-6 shadow-[0_12px_48px_rgba(0,0,0,0.08)] sm:p-8"><Suspense fallback={<div>正在载入…</div>}>{renderWorkspace()}</Suspense></section>
      </main> : <main className="reference-layout" style={{ gridTemplateColumns: "minmax(0, 1fr)", maxWidth: "none", width: "100%", padding: 0, gap: 0 }}>
        <section className="editorial-panel" style={{ display: "none" }}>
          <div className="editorial-inner">
            <p className="eyebrow">{page.en}</p>
            <h1>{page.title}</h1>
            <p className="editorial-subtitle">{page.subtitle}</p>
            <div className="gold-rule" />
            <div className="editorial-description">{page.note}</div>

            {chart && birthInfo && (
              <section className="recent-chart">
                <div className="section-heading">
                  <span>最近命盘 <span className="recent-count">1</span></span>
                  <span className="saved-label">已保存在本机</span>
                </div>
                <button className="recent-entry" onClick={() => setActivePage('chart')}>
                  <span>
                    <strong>{birthInfo.year}年{birthInfo.month}月{birthInfo.day}日 · {String(birthInfo.hour).padStart(2, '0')}:{String(birthInfo.minute ?? 0).padStart(2, '0')}</strong>
                    <small>{birthInfo.gender === 'male' ? '男' : '女'} · {birthInfo.birthplace || '未填写出生地'}</small>
                  </span>
                  <span className="recent-arrow">›</span>
                </button>
                <button className="clear-chart" onClick={() => { useChartStore.getState().clear(); setActivePage('birth') }}>清空当前命盘</button>
              </section>
            )}

            <div className="feature-index">
              <div className="feature-index-heading">功能目录 <span>EXPLORE</span></div>
              <nav aria-label="功能目录">
                {PAGES.map((item, index) => (
                  <button key={item.key} onClick={() => setActivePage(item.key)} className={activePage === item.key ? 'feature-link active' : 'feature-link'} aria-current={activePage === item.key ? 'page' : undefined}>
                    <span className="feature-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="feature-icon">{item.icon}</span>
                    <span className="feature-label">{item.label}</span>
                    <span className="feature-chevron">›</span>
                  </button>
                ))}
              </nav>
            </div>
            <div className="editorial-footer">知命 · 观势 · 行动 <span>天衍命理探索</span></div>
          </div>
        </section>

        <section className="workspace-panel" style={hasChartWorkspace ? {padding:0, border:0, minWidth:0} : undefined} aria-label={page.label}>
          <div className="workspace-topline" style={hasChartWorkspace ? {display:"none"} : undefined}>
            <div><span className="workspace-kicker">YOUR PERSONAL STAR MAP</span><span className="workspace-current">{page.label}</span></div>
            <div className="workspace-actions"><button className="workspace-settings" onClick={() => setActivePage("home")}>← 返回首页</button><button className="workspace-settings" onClick={() => setShowSettings(true)}>偏好设置 <span>↗</span></button></div>
          </div>
          <nav style={hasChartWorkspace ? {display:"none"} : undefined} aria-label="全部功能" className="flex flex-wrap gap-1 border-b border-neutral-200 px-3 py-2">{PAGES.map(item => <button key={item.key} type="button" aria-current={activePage === item.key ? 'page' : undefined} onClick={() => { setActivePage(item.key); setExpandedChart(false) }} className={activePage === item.key ? 'rounded bg-neutral-900 px-2 py-1.5 text-xs text-white' : 'rounded px-2 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100'}>{item.label}</button>)}</nav>
          <div style={hasChartWorkspace ? {padding:0, maxWidth:"none"} : undefined} className="workspace-content">
            <Suspense fallback={<div className="workspace-loading">正在载入功能内容…</div>}>{hasChartWorkspace ? <div className="min-w-0"><div className="hidden"><span className="text-xs text-neutral-600">本命十二宫 · {page.label}</span><button type="button" onClick={() => setExpandedChart(v => !v)} aria-pressed={expandedChart} className="rounded border px-2 py-1 text-xs">{expandedChart ? '恢复分栏' : '放大命盘'}</button></div><div className={expandedChart ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 lg:grid-cols-[minmax(0,41fr)_minmax(0,59fr)] items-start gap-0'}><div className={expandedChart ? 'mx-auto w-full max-w-[900px]' : 'min-w-0 border-b lg:border-b-0 lg:border-r border-neutral-200 px-2 sm:px-4 lg:sticky lg:top-0 lg:max-h-[calc(100dvh-56px)] lg:overflow-y-auto'}><ChartDisplay activeLayer={activePage === 'decadal' ? 'decadal' : activePage === 'fortune' ? 'yearly' : activePage === 'chart' ? 'origin' : undefined} /></div><div className="min-w-0 px-3 sm:px-5 pt-4 lg:max-h-[calc(100dvh-56px)] lg:overflow-y-auto"><button type="button" title="放大或恢复命盘" aria-label="放大或恢复命盘" aria-pressed={expandedChart} onClick={() => setExpandedChart(v => !v)} className="float-right rounded-lg border border-neutral-200 px-3 py-2 text-neutral-600">{expandedChart ? "↙ 恢复分栏" : "↗ 放大命盘"}</button>{activePage === 'chart' && <nav aria-label="命盘分析" className="sticky top-0 z-10 mb-4 flex flex-wrap items-center gap-1 rounded-xl bg-neutral-100 p-1 w-fit">{([['report','命盘分析'],['chat','AI 对话']] as const).map(([key,label]) => <button key={key} type="button" aria-pressed={analysisView === key} onClick={() => setAnalysisView(key)} className={analysisView === key ? 'rounded-lg bg-white px-5 py-3 font-semibold shadow-sm' : 'rounded-lg px-5 py-3 text-neutral-600'}>{label}</button>)}</nav>}{renderWorkspace()}</div></div></div> : renderWorkspace()}</Suspense>
          </div>
        </section>
      </main>}

      {showSettings && (
        <div className="settings-overlay" onClick={(event) => event.target === event.currentTarget && setShowSettings(false)}>
          <div><SettingsPanel onClose={() => setShowSettings(false)} /></div>
        </div>
      )}
      <Analytics />
    </div>
  )
}

function PageEmpty({ onClick }: { onClick: () => void }) {
  return (
    <div className="page-empty">
      <span className="empty-symbol">✳</span>
      <h2>先建立你的专属命盘</h2>
      <p>完成出生资料后，即可使用这项分析功能。</p>
      <button onClick={onClick}>前往填写出生资料 <span>→</span></button>
    </div>
  )
}
