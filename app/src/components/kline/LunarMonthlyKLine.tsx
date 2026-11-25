import { useState } from 'react'
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'
import { generateLunarMonthlyKLines, type KLineData } from '@/lib/fortune-score'

interface LunarMonthlyKLineProps {
  chart: FunctionalAstrolabe
}

interface CandleShapeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  payload?: KLineData
  yAxis?: { scale: (value: number) => number }
}

function LunarCandleShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  yAxis,
}: CandleShapeProps) {
  if (!payload) return null

  const isUp = payload.close >= payload.open
  const color = isUp ? '#22c55e' : '#ef4444'
  const top = Math.min(y, y + height)
  const bodyHeight = Math.max(2, Math.abs(height))
  const center = x + width / 2
  const highY = yAxis?.scale(payload.high) ?? y
  const lowY = yAxis?.scale(payload.low) ?? y + height

  return (
    <g>
      <line
        x1={center}
        y1={highY}
        x2={center}
        y2={lowY}
        stroke={color}
        strokeWidth={1.5}
      />
      <rect
        x={x}
        y={top}
        width={width}
        height={bodyHeight}
        fill={color}
        stroke={color}
        rx={1}
      />
    </g>
  )
}

function LunarTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload: KLineData }>
}) {
  if (!active || !payload?.length) return null

  const item = payload[0].payload
  return (
    <div className="rounded-xl border border-white/10 bg-night/95 p-3 text-sm shadow-xl">
      <p className="mb-2 font-semibold text-white">{item.period}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
        <span className="text-text-muted">期初</span><span className="text-right text-white">{item.open}</span>
        <span className="text-text-muted">期末</span><span className="text-right text-white">{item.close}</span>
        <span className="text-text-muted">最高</span><span className="text-right text-green-400">{item.high}</span>
        <span className="text-text-muted">最低</span><span className="text-right text-rose-400">{item.low}</span>
        <span className="text-text-muted">参考分</span><span className="text-right text-gold">{item.score.total}</span>
      </div>
    </div>
  )
}

export function LunarMonthlyKLine({ chart }: LunarMonthlyKLineProps) {
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [splitLeap, setSplitLeap] = useState(true)
  const [data, setData] = useState<KLineData[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = () => {
    const selectedYear = Number(year)
    if (!Number.isInteger(selectedYear) || selectedYear < 1 || selectedYear > 9999) {
      setError('请输入 1 至 9999 之间的有效年份。')
      return
    }

    setError('')
    setIsGenerating(true)
    window.setTimeout(() => {
      try {
        setData(generateLunarMonthlyKLines(chart, selectedYear, splitLeap))
      } catch (cause) {
        console.error('农历流月 K 线生成失败:', cause)
        setData([])
        setError('流月数据生成失败，请检查年份后重试。')
      } finally {
        setIsGenerating(false)
      }
    }, 0)
  }

  const chartData = data.map((item) => ({
    ...item,
    bodyRange: [Math.min(item.open, item.close), Math.max(item.open, item.close)],
  }))

  return (
    <section className="space-y-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-6">
      <div>
        <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-serif)' }}>
          农历流月 K 线
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          按真实农历月份及闰月时段计算，与上方公历月度趋势分开展示。分数为启发式参考，不代表事件概率或确定性预测。
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs text-text-muted">
          农历年份
          <input
            type="number"
            min={1}
            max={9999}
            value={year}
            onChange={(event) => setYear(event.target.value)}
            className="w-28 rounded-lg border border-white/10 bg-night px-3 py-2 text-sm text-white outline-none focus:border-star/60"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-xs text-text-secondary">
          <input
            type="checkbox"
            checked={splitLeap}
            onChange={(event) => setSplitLeap(event.target.checked)}
            className="accent-violet-400"
          />
          闰月拆分为上、下半月
        </label>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="rounded-lg bg-gradient-to-r from-star to-gold px-4 py-2 text-sm font-medium text-night transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-50"
        >
          {isGenerating ? '正在计算流月…' : '生成农历流月'}
        </button>
      </div>

      {error && <p role="alert" className="text-sm text-rose-400">{error}</p>}

      {chartData.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
            <span>共 {chartData.length} 个农历时段</span>
            <span className="text-green-400">绿色：收盘不低于开盘</span>
            <span className="text-rose-400">红色：收盘低于开盘</span>
          </div>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 12, right: 8, left: -12, bottom: 78 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                <XAxis
                  dataKey="period"
                  interval={0}
                  angle={-38}
                  textAnchor="end"
                  height={90}
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.55)' }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.12)' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.45)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<LunarTooltip />} cursor={{ stroke: 'rgba(167,139,250,0.3)' }} />
                <Bar
                  dataKey="bodyRange"
                  shape={<LunarCandleShape />}
                  isAnimationActive={false}
                  maxBarSize={18}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-text-muted">
          选择年份后生成农历流月数据。普通年份通常为 12 个时段；闰月年会随拆分设置显示 13 或 14 个时段。
        </p>
      )}
    </section>
  )
}
