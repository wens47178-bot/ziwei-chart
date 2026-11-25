/* 天衍：参考图驱动的独立功能工作台 */
import { useState, type ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BirthForm } from '@/components/BirthForm'
import { ChartDisplay } from '@/components/chart'
import { AIInterpretation } from '@/components/AIInterpretation'
import { SettingsPanel } from '@/components/SettingsPanel'
import { YearlyFortune } from '@/components/fortune'
import { LifeKLine } from '@/components/kline'
import { MatchAnalysis } from '@/components/match'
import { ShareCard } from '@/components/share'
import { AdvancedAnalysis, type AdvancedMode } from '@/components/AdvancedAnalysis'
import { useChartStore } from '@/stores'

type PageKey = 'birth' | 'chart' | 'palaces' | 'sihua' | 'decadal' | 'stars' | 'fortune' | 'kline' | 'match' | 'ai' | 'share'
type PageMeta = { key: PageKey; label: string; en: string; title: string; subtitle: string; note: string; icon: string }

const PAGES: PageMeta[] = [
  { key: 'birth', label: '起紫微命盘', en: '01 / DESTINY ENGINE', title: '起紫微命盘', subtitle: '输入出生年月日時', note: '以准确的出生资料为起点，建立专属命盘。', icon: '✳' },
  { key: 'chart', label: '本命十二宫', en: '02 / NATAL CHART', title: '本命十二宫', subtitle: '十二宫位 · 星曜结构 · 命身格局', note: '从十二宫与星曜落点，逐层认识本命结构。', icon: '⌘' },
  { key: 'palaces', label: '十二宫详解', en: '03 / TWELVE PALACES', title: '十二宫深度解析', subtitle: '宫位结构 · 星曜组合 · 宫干信息', note: '逐宫检视星曜配置与宫位结构，查看命盘细节。', icon: '▦' },
  { key: 'sihua', label: '四化飞星', en: '04 / FOUR TRANSFORMATIONS', title: '四化飞星', subtitle: '本命四化 · 大限四化 · 流年四化', note: '区分不同盘层的禄权科忌，查看实际落宫。', icon: '✧' },
  { key: 'decadal', label: '大限运程', en: '05 / DECADAL CYCLES', title: '大限运程', subtitle: '十年运限 · 大限命宫 · 流年叠宫', note: '指定年份定位大限，观察大限与流年的盘层关系。', icon: '◷' },
  { key: 'stars', label: '星曜图鉴', en: '06 / STAR ATLAS', title: '星曜图鉴', subtitle: '主星 · 辅星 · 星曜落宫', note: '从命盘实际出现的星曜进入知识说明与落宫查看。', icon: '✦' },
  { key: 'fortune', label: '年度运势', en: '07 / YEARLY ALMANAC', title: '年度运势', subtitle: '流年主题 · 重点宫位 · 行动提醒', note: '查看当年运势重点与阶段变化。', icon: '◷' },
  { key: 'kline', label: '人生趋势', en: '08 / LIFE TIMELINE', title: '人生趋势 K 线', subtitle: '大限走势 · 年度变化 · 农历流月', note: '以时间轴与数据图表观察人生不同阶段。', icon: '⌁' },
  { key: 'match', label: '双人合盘', en: '09 / SYNASTRY', title: '双人合盘', subtitle: '双方资料 · 宫位关联 · 互动主题', note: '并列比较两张命盘，理解彼此的互动结构。', icon: '◉' },
  { key: 'ai', label: 'AI 深度解读', en: '10 / AI INTERPRETATION', title: 'AI 深度解读', subtitle: '命格批注 · 事业财帛 · 情感人际', note: '基于命盘资料与知识上下文生成辅助解读。', icon: '✧' },
  { key: 'share', label: '命盘典藏卡', en: '11 / PERSONAL KEEPSAKE', title: '命盘典藏卡', subtitle: '命盘摘要 · 专属金句 · 保存分享', note: '将命盘重点整理成可保存与分享的个人卡片。', icon: '◇' },
]

export default function App() {
  const { chart, birthInfo } = useChartStore()
  const [activePage, setActivePage] = useState<PageKey>('birth')
  const [showSettings, setShowSettings] = useState(false)
  const page = PAGES.find((item) => item.key === activePage) ?? PAGES[0]

  const renderWorkspace = (): ReactNode => {
    if (activePage === 'birth') return <BirthForm onSuccess={() => setActivePage('chart')} />
    if (activePage === 'chart') return chart ? <ChartDisplay /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'palaces' || activePage === 'sihua' || activePage === 'decadal' || activePage === 'stars') return chart ? <AdvancedAnalysis mode={activePage as AdvancedMode} /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'fortune') return chart ? <YearlyFortune /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'kline') return chart ? <LifeKLine /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'match') return <MatchAnalysis />
    if (activePage === 'ai') return chart ? <AIInterpretation /> : <PageEmpty onClick={() => setActivePage('birth')} />
    if (activePage === 'share') return chart ? <ShareCard /> : <PageEmpty onClick={() => setActivePage('birth')} />
    return null
  }

  return (
    <div className="min-h-screen bg-[#fff] text-[#211f1b]">
      <header className="reference-header">
        <button className="brand-lockup" onClick={() => setActivePage('birth')} aria-label="天衍首页">
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

      <main className="reference-layout">
        <section className="editorial-panel">
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
                    <strong>{birthInfo.year}年{birthInfo.month}月{birthInfo.day}日 · {birthInfo.hour}时</strong>
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
            <button className="workspace-settings" onClick={() => setShowSettings(true)}>偏好设置 <span>↗</span></button>
          </div>
          <div className={activePage === 'birth' ? 'workspace-content birth-workspace' : 'workspace-content'}>
            {renderWorkspace()}
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
