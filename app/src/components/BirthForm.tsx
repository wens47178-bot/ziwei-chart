/* ============================================================
   生辰输入表单 - 高级玻璃态设计
   ============================================================ */

import { useEffect, useState } from 'react'
import { Button, Input, Select } from '@/components/ui'
import { generateChart, getSolarDateFromLunar, type BirthInfo, type Gender } from '@/lib/astro'
import { clampDayToMonth, getDayOptions, getMonthOptions, getYearOptions } from '@/lib/birth-date'
import { searchBirthplacesAsync, resolveBirthTimeAsync, type Birthplace } from '@/lib/true-solar-time'
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

  const [dateType, setDateType] = useState<'solar' | 'lunar'>('solar')
  const [isLeapMonth, setIsLeapMonth] = useState(false)
  const [year, setYear] = useState(1990)
  const [month, setMonth] = useState(1)
  const [day, setDay] = useState(1)
  const [hour, setHour] = useState(12)
  const [minute, setMinute] = useState(0)
  const [gender, setGender] = useState<Gender>('male')
  const [birthplace, setBirthplace] = useState('')
  const [trueSolarEnabled, setTrueSolarEnabled] = useState(true)
  const [matchedBirthplace, setMatchedBirthplace] = useState<Birthplace | null>(null)
  const [birthplaceSuggestions, setBirthplaceSuggestions] = useState<Birthplace[]>([])
  const [matchingBirthplace, setMatchingBirthplace] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const dayOptions = dateType === 'solar' ? getDayOptions(year, month) : Array.from({ length: 30 }, (_, index) => ({ value: index + 1, label: `${index + 1}日` }))

  useEffect(() => {
    let active = true
    const trimmedBirthplace = birthplace.trim()
    if (!trueSolarEnabled || trimmedBirthplace.length < 2 || matchedBirthplace) return

    // Search both domestic and overseas cities as the user types.
    const timer = window.setTimeout(() => {
      searchBirthplacesAsync(trimmedBirthplace)
        .then((places) => {
          if (active) setBirthplaceSuggestions(places)
        })
        .catch(() => {
          if (active) setBirthplaceSuggestions([])
        })
        .finally(() => {
          if (active) setMatchingBirthplace(false)
        })
    }, 300)

    return () => {
      active = false
      window.clearTimeout(timer)
    }
  }, [birthplace, trueSolarEnabled, matchedBirthplace])

  const handleBirthplaceChange = (value: string) => {
    setBirthplace(value)
    setMatchedBirthplace(null)
    setBirthplaceSuggestions([])
    setMatchingBirthplace(trueSolarEnabled && value.trim().length >= 2)
  }

  const handleTrueSolarToggle = (enabled: boolean) => {
    setTrueSolarEnabled(enabled)
    setMatchedBirthplace(null)
    setBirthplaceSuggestions([])
    setMatchingBirthplace(enabled && birthplace.trim().length >= 2)
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
      const safeDay = dateType === 'solar' ? clampDayToMonth(year, month, day) : Math.min(day, 30)
      const solarDate = dateType === 'lunar'
        ? getSolarDateFromLunar(year, month, safeDay, isLeapMonth, hour, gender)
        : { year, month, day: safeDay }
      const resolvedBirthTime = trueSolarEnabled ? await resolveBirthTimeAsync({
        year: solarDate.year,
        month: solarDate.month,
        day: solarDate.day,
        hour,
        minute,
        birthplace,
        enabled: trueSolarEnabled,
      }) : undefined
      const birthInfo: BirthInfo = {
        year,
        month,
        day: safeDay,
        hour,
        minute,
        gender,
        dateType,
        isLeapMonth: dateType === 'lunar' && isLeapMonth,
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
          ? error.message.includes('does not exist')
            ? '该历史日期当地时钟曾向前调整，这个出生时间不存在，请核对出生记录。'
            : '出生日期或时间无效，请检查后重试。'
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
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-[#716b5e] font-medium">出生日期</span>
            <div className="flex rounded-xl border border-[#e4dfd5] bg-[#f7f5f1] p-1">
              {(['solar', 'lunar'] as const).map((type) => <button key={type} type="button" onClick={() => { setDateType(type); setIsLeapMonth(false); setDay(1) }} className={`rounded-lg px-4 py-2 text-sm transition ${dateType === type ? 'bg-[#28251f] text-white shadow-sm' : 'text-[#766b56] hover:bg-white'}`}>{type === 'solar' ? '阳历' : '农历'}</button>)}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select
              options={YEAR_OPTIONS}
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
            />
            <Select
              options={MONTH_OPTIONS.map((option) => ({ ...option, label: dateType === 'lunar' ? `农历${option.value}月` : option.label }))}
              value={month}
              onChange={(e) => handleMonthChange(Number(e.target.value))}
            />
            <Select
              options={dayOptions}
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
            />
          </div>
          {dateType === 'lunar' && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e9e5dc] bg-[#faf9f6] px-4 py-3">
            <div><p className="text-sm text-[#5f594e]">闰月设置</p><p className="mt-1 text-xs text-[#918879]">只有出生月份确为闰月时才勾选</p></div>
            <label className="flex items-center gap-2 text-sm text-[#625b50]"><input type="checkbox" checked={isLeapMonth} onChange={(event) => setIsLeapMonth(event.target.checked)} className="h-4 w-4 accent-[#8f7956]" />闰{month}月</label>
          </div>}
          <p className="text-xs text-[#918879]">{dateType === 'solar' ? '按公历年月日输入，系统直接按阳历排盘。' : '按农历年月日输入；闰月请单独勾选。系统会按农历日期排盘，并在启用真太阳时时先换算为对应公历日期。'}</p>
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
        <div className="relative space-y-2">
          <Input
            label="出生地（可选）"
            placeholder="输入城市即可搜索全球地点，如：深圳、Phnom Penh、Tokyo、New York"
            hint={
              !trueSolarEnabled
                ? '已关闭真太阳时校正'
                : matchedBirthplace
                  ? `已选择：${matchedBirthplace.name}${matchedBirthplace.province ? ` · ${matchedBirthplace.province}` : ''}${matchedBirthplace.country ? ` · ${matchedBirthplace.country}` : ''}${matchedBirthplace.timeZone ? ` · ${matchedBirthplace.timeZone}` : ''}`
                  : matchingBirthplace
                    ? '正在搜索全球城市…'
                    : birthplace.trim().length >= 2
                      ? '请选择下方匹配的城市；同名城市会显示所属国家和州／省'
                      : '支持国内及海外城市，可输入中文、英文或当地名称'
            }
            value={birthplace}
            onChange={(e) => handleBirthplaceChange(e.target.value)}
          />
          {birthplaceSuggestions.length > 0 && !matchedBirthplace && (
            <div className="absolute z-30 top-full left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-xl border border-[#dedbd5] bg-white shadow-xl">
              <div className="px-4 py-2 text-xs text-[#8b8376] border-b border-[#eeeae3]">
                全球匹配结果 · 选择出生城市
              </div>
              {birthplaceSuggestions.map((place, index) => (
                <button
                  key={`${place.name}-${place.province}-${place.country}-${index}`}
                  type="button"
                  onClick={() => {
                    const fullName = [place.name, place.province, place.country].filter(Boolean).join(', ')
                    setBirthplace(fullName)
                    setMatchedBirthplace(place)
                    setBirthplaceSuggestions([])
                    setMatchingBirthplace(false)
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-[#f8f6f1] border-b border-[#f0ede7] last:border-b-0 transition-colors"
                >
                  <span className="block text-sm font-medium text-[#302d27]">{place.name}</span>
                  <span className="block mt-1 text-xs text-[#898276]">
                    {[place.province, place.country].filter(Boolean).join(' · ')}
                    {place.timeZone ? ` · ${place.timeZone}` : ''}
                  </span>
                </button>
              ))}
            </div>
          )}
          {matchedBirthplace && (
            <button
              type="button"
              onClick={() => {
                setMatchedBirthplace(null)
                setBirthplace('')
                setBirthplaceSuggestions([])
              }}
              className="text-xs text-[#8b7653] hover:text-[#5f4b2d]"
            >
              更改出生地
            </button>
          )}
        </div>

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
        可输入阳历或农历日期；农历闰月请准确勾选，出生地用于真太阳时校正
      </p>

    </form>
  )
}
