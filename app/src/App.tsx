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
  const [showSettings, setShowSettings] = useState(false)
  const [expandedChart, setExpandedChart] = useState(false)
  const [chartTab, setChartTab] = useState<'palaces' | 'sihua' | 'decadal' | 'stars' | 'trines' | 'ai'>('palaces')
  const page = PAGES.find((item) => item.key === activePage) ?? PAGES[0]

  const renderWorkspace = (): ReactNode => {
    if (activePage === 'birth') return <BirthForm onSuccess={() => setActivePage('chart')} />
    if (activePage === 'chart') return chart ? <div className="min-w-0"><div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-2"><span className="text-sm font-semibold text-neutral-800">本命十二宫</span><button type="button" aria-pressed={expandedChart} onClick={() => setExpandedChart(v => !v)} className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-700 hover:bg-neutral-100">{expandedChart ? '退出放大' : '放大命盘 ↗'}</button></div><div className={expandedChart ? 'grid grid-cols-1 gap-5' : 'grid grid-cols-1 lg:grid-cols-[minmax(540px,44fr)_minmax(0,56fr)] items-start gap-4'}><div className={expandedChart ? 'mx-auto w-full max-w-[900px]' : 'min-w-0'}><ChartDisplay /></div><div className="min-w-0"><nav aria-label="命盘分析" className="mb-3 flex flex-wrap gap-1 border-b border-neutral-200 pb-2">{([["palaces","命盘分析"],["sihua","四化飞星"],["decadal","大限流年"],["stars","星曜详情"],["trines","三方四正"],["ai","AI 解读"]] as const).map(([key,label]) => <button type="button" key={key} aria-pressed={chartTab === key} onClick={() => setChartTab(key)} className={`rounded px-2 py-1.5 text-xs ${chartTab === key ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>{label}</button>)}</nav>{chartTab === "ai" && <AIInterpretation />}{chartTab !== "ai" && <AdvancedAnalysis mode={chartTab} />}</div></div></div> : <PageEmpty onClick={() => setActivePage('birth')} />
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
      <HomeLanding onEnter={(key) => setActivePage(key)} onSettings={() => setShowSettings(true)} />
      {showSettings && <div className="settings-overlay" onClick={(event) => event.target === event.currentTarget && setShowSettings(false)}><div><SettingsPanel onClose={() => setShowSettings(false)} /></div></div>}
      <Analytics />
    </>
  )
  return (
    <div className="min-h-screen bg-[#fff] text-[#211f1b]">
      <header className="reference-header">
        <button className="brand-lockup" onClick={() => setActivePage('home')} aria-label="天衍首页">
          <span className="brand-word">天衍</span><span className="brand-mark">✳</span>
          <span className="brand-caption">ZIWEI DESTINY STUDIO</span>
        </button>
        <div className="header-account">
          <span className="account-avatar">T</span>
          <span className="account-name">个人空间</span>
          <span className="account-divider">·</span>
          <span className="account-tier">标准版</span>
          <button className="account-menu" onClick={() => setShowSettings(true)} aria-label="打开设置">⌄</button>
        </div>
      </header>

      <main className="reference-layout" style={activePage === "chart" ? { gridTemplateColumns: "minmax(0, 1fr)", maxWidth: "none", width: "100%" } : undefined}>
        <section className="editorial-panel" style={activePage === "chart" ? { display: "none" } : undefined}>
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

        <section className="workspace-panel" aria-label={page.label}>
          <div className="workspace-topline">
            <div><span className="workspace-kicker">YOUR PERSONAL STAR MAP</span><span className="workspace-current">{page.label}</span></div>
            <div className="workspace-actions"><button className="workspace-settings" onClick={() => setActivePage("home")}>← 返回首页</button><button className="workspace-settings" onClick={() => setShowSettings(true)}>偏好设置 <span>↗</span></button></div>
          </div>
          <div className={activePage === 'birth' ? 'workspace-content birth-workspace' : 'workspace-content'}>
            <Suspense fallback={<div className="workspace-loading">正在载入功能内容…</div>}>{renderWorkspace()}</Suspense>
          </div>
        </section>
      </main>

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
