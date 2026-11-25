/* 天衍主应用：白色简约布局，功能统一收纳于左侧导航 */

import { useState, type ReactNode } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { BirthForm } from '@/components/BirthForm'
import { ChartDisplay } from '@/components/chart'
import { AIInterpretation } from '@/components/AIInterpretation'
import { SettingsPanel } from '@/components/SettingsPanel'
import { YearlyFortune } from '@/components/fortune'
import { LifeKLine } from '@/components/kline'
import { KLineIcon } from '@/components/icons/KLineIcon'
import { MatchAnalysis } from '@/components/match'
import { OpenSourceFooterLinks } from '@/components/OpenSourceLinks'
import { ShareCard } from '@/components/share'
import { useChartStore } from '@/stores'

type TabType = 'chart' | 'fortune' | 'kline' | 'match' | 'share'

const TABS: Array<{ key: TabType; label: string; icon: ReactNode }> = [
  { key: 'chart', label: '命盘解读', icon: '☰' },
  { key: 'fortune', label: '年度运势', icon: '◎' },
  { key: 'kline', label: '人生K线', icon: <KLineIcon className="h-4 w-4" /> },
  { key: 'match', label: '双人合盘', icon: '⚭' },
  { key: 'share', label: '分享卡片', icon: '◈' },
]

export default function App() {
  const { chart } = useChartStore()
  const [showSettings, setShowSettings] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('chart')

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">

      {/* 头部 - 毛玻璃导航 */}
      {/* 左侧功能导航：桌面端纵向固定，窄屏保留左侧图标栏 */}
      <aside className="sticky top-0 z-40 flex h-screen w-[76px] shrink-0 flex-col border-r border-slate-200 bg-white px-2 py-5 shadow-sm sm:w-[220px] sm:px-4 lg:w-[248px]">
        <div className="mb-8 flex items-center justify-center gap-3 px-1 sm:justify-start sm:px-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-100 bg-violet-50 text-xl text-violet-700">✦</div>
          <div className="hidden min-w-0 sm:block">
            <h1 className="truncate text-lg font-semibold tracking-wide text-slate-900" style={{ fontFamily: 'var(--font-serif)' }}>天衍</h1>
            <p className="text-xs text-slate-500">紫微命理与人生分析</p>
          </div>
        </div>
        <p className="mb-2 hidden px-3 text-[11px] font-semibold tracking-[0.16em] text-slate-400 sm:block">功能导航</p>
        <nav aria-label="主功能" className="flex flex-1 flex-col gap-1">
          {TABS.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} aria-current={activeTab === tab.key ? 'page' : undefined}
              className={`group flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm font-medium transition-colors sm:justify-start sm:px-3
                ${activeTab === tab.key ? 'bg-violet-50 text-violet-800 ring-1 ring-inset ring-violet-100' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center text-base ${activeTab === tab.key ? 'text-violet-700' : 'text-slate-400 group-hover:text-slate-600'}`}>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {activeTab === tab.key && <span className="ml-auto hidden h-1.5 w-1.5 rounded-full bg-violet-600 sm:block" />}
            </button>
          ))}
        </nav>
        <div className="mt-5 border-t border-slate-100 pt-4">
          <button onClick={() => setShowSettings(true)} title="设置" className="flex w-full items-center justify-center gap-3 rounded-xl px-2 py-3 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:justify-start sm:px-3">
            <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
            <span className="hidden sm:inline">设置</span>
          </button>
          <div className="mt-2 hidden px-3 text-[11px] leading-5 text-slate-400 sm:block">简洁 · 清晰 · 专注</div>
        </div>
      </aside>

      {/* 主内容 */}
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* 命盘解读标签 */}
          {activeTab === 'chart' && (
            !chart ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <BirthForm />
              </div>
            ) : (
              <div className="animate-fade-in space-y-8">
                <section className="mb-2 rounded-2xl border border-violet-100 bg-violet-50/60 px-6 py-5"><p className="text-xs font-semibold tracking-widest text-violet-700">NATAL CHART</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">命盘解读</h2><p className="mt-1 text-sm text-slate-600">十二宫位星图 · 星曜四化 · 命身结构</p></section>
                {/* 命盘 - 横向展开 */}
                <div className="w-full">
                  <ChartDisplay />
                </div>

                {/* AI 解读 - 下方展示，与命盘等宽 */}
                <div className="w-full max-w-6xl mx-auto">
                  <AIInterpretation />
                </div>

                {/* 重新输入按钮 */}
                <div className="text-center">
                  <button
                    onClick={() => useChartStore.getState().clear()}
                    className="
                      inline-flex items-center gap-2 px-4 py-2 rounded-lg
                      text-sm text-text-muted
                      hover:text-text hover:bg-white/[0.04]
                      transition-all duration-200
                    "
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    重新输入
                  </button>
                </div>
              </div>
            )
          )}

          {/* 年度运势标签 */}
          {activeTab === 'fortune' && (
            !chart ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <EmptyState
                  message="请先在「命盘解读」中输入您的生辰信息"
                  action={() => setActiveTab('chart')}
                  actionLabel="前往输入"
                />
              </div>
            ) : (
              <section className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/60 px-6 py-5"><p className="text-xs font-semibold tracking-widest text-amber-700">YEARLY ALMANAC</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">年度运势</h2><p className="mt-1 text-sm text-slate-600">年度主题 · 重点宫位 · 行动提醒</p></section><YearlyFortune />
            )
          )}

          {/* 人生K线标签 */}
          {activeTab === 'kline' && (
            !chart ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <EmptyState
                  message="请先在「命盘解读」中输入您的生辰信息"
                  action={() => setActiveTab('chart')}
                  actionLabel="前往输入"
                />
              </div>
            ) : (
              <section className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-6 py-5"><p className="text-xs font-semibold tracking-widest text-emerald-700">LIFE TIMELINE</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">人生 K 线</h2><p className="mt-1 text-sm text-slate-600">人生阶段 · 趋势曲线 · 农历流月数据</p></section><LifeKLine />
            )
          )}

          {/* 双人合盘标签 */}
          {activeTab === "match" && <><section className="mb-6 rounded-2xl border border-rose-100 bg-rose-50/60 px-6 py-5"><p className="text-xs font-semibold tracking-widest text-rose-700">SYNASTRY</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">双人合盘</h2><p className="mt-1 text-sm text-slate-600">双方资料 · 宫位关联 · 互动主题</p></section><MatchAnalysis /></>}

          {/* 分享卡片标签 */}
          {activeTab === 'share' && (
            !chart ? (
              <div className="flex items-center justify-center min-h-[60vh]">
                <EmptyState
                  message="请先在「命盘解读」中输入您的生辰信息"
                  action={() => setActiveTab('chart')}
                  actionLabel="前往输入"
                />
              </div>
            ) : (
              <div className="max-w-3xl mx-auto"><section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 px-6 py-5"><p className="text-xs font-semibold tracking-widest text-indigo-700">PERSONAL KEEPSAKE</p><h2 className="mt-1 text-2xl font-semibold text-slate-900">分享卡片</h2><p className="mt-1 text-sm text-slate-600">命盘摘要 · 专属金句 · 典藏分享</p></section>
                <ShareCard />
              </div>
            )
          )}
        </div>
      </main>

      {/* 设置弹窗 */}
      {showSettings && (
        <div
          className="
            fixed inset-0 z-50
            bg-black/60 backdrop-blur-sm
            flex items-center justify-center p-4
          "
          onClick={(e) => e.target === e.currentTarget && setShowSettings(false)}
        >
          <div className="animate-fade-in">
            <SettingsPanel onClose={() => setShowSettings(false)} />
          </div>
        </div>
      )}

      <div className="sr-only"><OpenSourceFooterLinks /></div>

      <Analytics />
    </div>
  )
}

/* ------------------------------------------------------------
   空状态组件
   ------------------------------------------------------------ */

interface EmptyStateProps {
  message: string
  action: () => void
  actionLabel: string
}

function EmptyState({ message, action, actionLabel }: EmptyStateProps) {
  return (
    <div
      className="
        text-center p-8 rounded-2xl
        bg-white/[0.02] border border-white/[0.06]
      "
    >
      <div className="text-4xl mb-4 opacity-30">☆</div>
      <p className="text-text-muted mb-4">{message}</p>
      <button
        onClick={action}
        className="
          inline-flex items-center gap-2
          px-4 py-2 rounded-lg
          bg-star/20 text-star-light
          hover:bg-star/30 transition-colors
        "
      >
        {actionLabel}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </div>
  )
}
