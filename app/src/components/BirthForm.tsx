/* ============================================================
   生辰输入表单 - 高级玻璃态设计
   ============================================================ */

import { useEffect, useState } from 'react'
import { Button, Input, Select } from '@/components/ui'
import { generateChart, type BirthInfo, type Gender } from '@/lib/astro'
import { clampDayToMonth, getDayOptions, getMonthOptions, getYearOptions } from '@/lib/birth-date'
import { findBirthplaceAsync, resolveBirthTimeAsync, type Birthplace } from '@/lib/true-solar-time'
import { useChartStore } from '@/stores'

const YEAR_OPTIONS = getYearOptions()
const MONTH_OPTIONS = getMonthOptions()
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => ({ value: hour, label: `${String(hour).padStart(2, '0')} 时` }))
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, minute) => ({ value: minute, label: `${String(minute).padStart(2, '0')} 分` }))

const GENDER_OPTIONS = [
  { value: 'male', label: '男', icon: '♂' },
  { value: 'female', label: '女', icon: '♀' },
]

export function BirthForm({ onSuccess }: { onSuccess?: () => void }) {
  const { setBirthInfo, setChart } = useChartStore()

  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [gender, setGender] = useState<Gender>('male')
  const [birthplace, setBirthplace] = useState('')
  const [trueSolarEnabled, setTrueSolarEnabled] = useState(true)
  const [matchedBirthplace, setMatchedBirthplace] = useState<Birthplace | null>(null)
  const [matchingBirthplace, setMatchingBirthplace] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const dayOptions = getDayOptions(year, month)

  useEffect(() => {
    let active = true
    const trimmedBirthplace = birthplace.trim()

    if (!trueSolarEnabled || !trimmedBirthplace) return

    findBirthplaceAsync(trimmedBirthplace)
      .then((place) => {
        if (active) setMatchedBirthplace(place)
      })
      .catch(() => {
        if (active) setMatchedBirthplace(null)
      })
      .finally(() => {
        if (active) setMatchingBirthplace(false)
      })

    return () => {
      active = false
    }
  }, [birthplace, trueSolarEnabled])

  const handleBirthplaceChange = (value: string) => {
    setBirthplace(value)
    setMatchedBirthplace(null)
    setMatchingBirthplace(trueSolarEnabled && value.trim().length > 0)
  }

  const handleTrueSolarToggle = (enabled: boolean) => {
    setTrueSolarEnabled(enabled)
    setMatchedBirthplace(null)
    setMatchingBirthplace(enabled && birthplace.trim().length > 0)
  }

  const handleYearChange = (nextYear: number) => {
    setYear(nextYear)
    setDay((currentDay) => clampDayToMonth(nextYear, month, currentDay))
  }

  const handleMonthChange = (nextMonth: number) => {
    setMonth(nextMonth)
    setDay((currentDay) => clampDayToMonth(year, nextMonth, currentDay))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError('')

    try {
      const safeDay = clampDayToMonth(year, month, day)
      const resolvedBirthTime = await resolveBirthTimeAsync({
        year,
        month,
        day: safeDay,
        hour,
        minute,
        birthplace,
        enabled: trueSolarEnabled,
      })
      const birthInfo: BirthInfo = {
        year,
        month,
        day: safeDay,
        hour,
        minute,
        gender,
        birthplace: birthplace.trim() || undefined,
        trueSolarEnabled,
        resolvedBirthTime,
      }
      const chart = generateChart(birthInfo)

      setBirthInfo(birthInfo)
      setChart(chart)
      onSuccess?.()
    } catch (error) {
      console.error('排盘失败:', error)
      setSubmitError(
        error instanceof RangeError
          ? '出生日期或时间无效，请检查后重试。'
          : '排盘失败，请稍后重试。'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative w-full max-w-none p-0 sm:p-1
        bg-transparent border-0 rounded-none shadow-none
      "
    >
      {/* 标题区域 */}
      <div className="text-left mb-8">
        <h2
          className="
            text-2xl font-semibold mb-2 text-[#25231f]
          "
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          输入您的出生信息
        </h2>
        <p className="text-sm text-text-muted">
          精准排盘，探索命运轨迹
        </p>
      </div>

      <div className="space-y-6">
        {/* 出生日期区块 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#716b5e] font-medium">出生日期</span>
            <span
              className="
                text-xs px-3 py-1 rounded-full
                bg-[#f5f3ef] text-[#766b56] border border-[#e4dfd5]
              "
            >
              阳历
            </span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select
              options={YEAR_OPTIONS}
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
            />
            <Select
              options={MONTH_OPTIONS}
              value={month}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
            />
            <Select
              options={dayOptions}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
            />
          </div>
        </div>

        {/* 精确出生时间 */}
        <div className="space-y-2">
          <span className="text-sm text-text-secondary font-medium">出生时间（尽量填写准确时分）</span>
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="小时"
              options={HOUR_OPTIONS}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
            />
            <Select
              label="分钟"
              options={MINUTE_OPTIONS}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
            />
          </div>
          <p className="text-xs text-text-muted">系统会按具体出生时分判断时辰；23:00–23:59 为晚子时，00:00–00:59 为早子时。</p>
        </div>

        {/* 性别选择 - 胶囊按钮组 */}
        <div className="space-y-2">
          <span className="text-sm text-text-secondary font-medium">性别</span>
          <div className="flex gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`
                  group relative flex-1 py-3 px-4 rounded-xl
                  flex items-center justify-center gap-2
                  cursor-pointer transition-all duration-200
                  ${gender === opt.value
                    ? 'bg-[#28251f] text-white shadow-sm'
                    : 'bg-[#faf9f7] border border-[#dedbd5] text-[#625d54] hover:bg-[#f3f0e9] hover:border-[#c9b991]'
                  }
                `}
              >
                <input
                  type="radio"
                  name="gender"
                  value={opt.value}
                  checked={gender === opt.value}
                  onChange={() => setGender(opt.value as Gender)}
                  className="sr-only"
                />
                <span
                  className={`
                    text-lg transition-transform duration-200
                    ${gender === opt.value ? 'scale-110' : 'opacity-60 group-hover:opacity-80'}
                  `}
                >
                  {opt.icon}
                </span>
                <span className="font-medium">{opt.label}</span>
                {/* 选中指示器 */}
                {gender === opt.value && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-gold shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                )}
              </label>
            ))}
          </div>
        </div>

        {/* 出生地（可选） */}
        <Input
          label="出生地（可选）"
          placeholder="如：北京、成都、乌鲁木齐"
          hint={
            trueSolarEnabled
              ? matchingBirthplace
                ? '正在匹配出生地'
                : matchedBirthplace
                ? `已匹配 ${matchedBirthplace.name}，系统会自动校正真太阳时`
                : birthplace.trim()
                  ? '暂未匹配该出生地，将按原时辰排盘'
                  : '直接输入出生地，系统会在后台自动匹配'
              : '已关闭真太阳时校正'
          }
          value={birthplace}
          onChange={(e) => handleBirthplaceChange(e.target.value)}
        />

        <label
          className="
            flex items-center justify-between gap-4 rounded-xl
            bg-[#f8f7f4] border border-[#e5e1d9]
            px-4 py-3 cursor-pointer
          "
        >
          <span>
            <span className="block text-sm text-text-secondary font-medium">自动真太阳时校正</span>
            <span className="block text-xs text-text-muted mt-0.5">
              根据出生地自动处理，普通用户无需填写经纬度
            </span>
          </span>
          <input
            type="checkbox"
            checked={trueSolarEnabled}
            onChange={(e) => handleTrueSolarToggle(e.target.checked)}
            className="h-5 w-5 accent-star"
          />
        </label>

        {/* 分隔线 */}
        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
        </div>

        {submitError && (
          <p role="alert" aria-live="polite" className="text-sm text-rose-700">
            {submitError}
          </p>
        )}

        {/* 提交按钮 */}
        <Button
          type="submit"
          variant="gold"
          size="lg"
          className="w-full group"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              排盘中...
            </>
          ) : (
            <>
              <span>开始排盘</span>
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </Button>
      </div>

      {/* 底部提示 */}
      <p className="text-xs text-text-muted text-center mt-6 flex items-center justify-center gap-1.5">
        <svg className="w-3.5 h-3.5 text-star-light" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        请输入阳历（公历）日期，系统会自动转为农历排盘
      </p>

    </form>
  )
}
