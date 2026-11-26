/* ============================================================
   iztro 排盘引擎封装
   ============================================================

   流派标准（文墨天机对齐）:
   - 年分界: 正月初一 (yearDivide: normal)
   - 运限分界: 正月初一 (horoscopeDivide: normal)
   - 子初换日: 23:00 即换日 (dayDivide: forward)
   - 小限分界: 自然年 (ageDivide: normal)
   - 安星法: 中州派 (algorithm: zhongzhou)
   ============================================================ */

import { astro } from 'iztro'
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'
import { resolveBirthTime, type ResolvedBirthTime } from './true-solar-time'

/* ------------------------------------------------------------
   全局配置初始化 - 文墨天机标准
   ------------------------------------------------------------ */

astro.config({
  yearDivide: 'normal',       // 年干四化: 正月初一分年
  horoscopeDivide: 'normal',  // 大限流年: 正月初一分界
  ageDivide: 'normal',        // 小限: 按自然年分
  dayDivide: 'forward',       // 子初换日: 23:00 即换日
  algorithm: 'zhongzhou',     // 安星法: 中州派
})

export type Gender = 'male' | 'female'

export interface BirthInfo {
  year: number
  month: number
  day: number
  hour: number
  minute?: number
  gender: Gender
  birthplace?: string
  trueSolarEnabled?: boolean
  resolvedBirthTime?: ResolvedBirthTime
  dateType?: 'solar' | 'lunar'
  isLeapMonth?: boolean
  fixLeap?: boolean
}

/* ------------------------------------------------------------
   生成命盘
   ------------------------------------------------------------ */

export function generateChart(info: BirthInfo): FunctionalAstrolabe {
  const { gender, fixLeap = true, dateType = 'solar', isLeapMonth = false } = info
  const dateStr = `${info.year}-${info.month}-${info.day}`
  const timeIndex = info.resolvedBirthTime?.timeIndex ?? getTimeIndex(info.hour, info.minute ?? 0)
  const genderName = gender === 'male' ? '男' : '女'

  // Lunar dates are native inputs to iztro. If true-solar correction is enabled,
  // first resolve the lunar date to its Gregorian civil date, then correct local time.
  if (dateType === 'lunar') {
    const lunarChart = astro.byLunar(dateStr, timeIndex, genderName, isLeapMonth, fixLeap)
    if (!info.resolvedBirthTime && !(info.trueSolarEnabled ?? true)) return lunarChart
    if (!info.resolvedBirthTime && (info.trueSolarEnabled ?? true)) {
      const [solarYear, solarMonth, solarDay] = lunarChart.solarDate.split('-').map(Number)
      const resolved = resolveBirthTime({
        year: solarYear, month: solarMonth, day: solarDay,
        hour: info.hour, minute: info.minute ?? 0,
        birthplace: info.birthplace, enabled: info.trueSolarEnabled ?? true,
      })
      return astro.bySolar(`${resolved.year}-${resolved.month}-${resolved.day}`, resolved.timeIndex, genderName, fixLeap)
    }
    const resolved = info.resolvedBirthTime
    return astro.bySolar(`${resolved.year}-${resolved.month}-${resolved.day}`, resolved.timeIndex, genderName, fixLeap)
  }

  const resolvedTime = info.resolvedBirthTime ?? resolveBirthTime({
    year: info.year,
    month: info.month,
    day: info.day,
    hour: info.hour,
    minute: info.minute ?? 0,
    birthplace: info.birthplace,
    enabled: info.trueSolarEnabled ?? true,
  })

  return astro.bySolar(`${resolvedTime.year}-${resolvedTime.month}-${resolvedTime.day}`, resolvedTime.timeIndex, genderName, fixLeap)
}

export function getLunarMonthLength(year: number, month: number, isLeapMonth = false): number {
  const reference = astro.bySolar(`${year}-1-1`, 0, '男', true)
  const period = reference.monthlyList(year, true).find((item) => item.month === month && Boolean(item.isLeapMonth) === isLeapMonth)
  if (!period) {
    if (isLeapMonth) throw new RangeError(`该年份没有闰${month}月`)
    throw new RangeError('无法取得该年份的农历月份资料')
  }
  return period.dayRange[1]
}

export function hasLunarLeapMonth(year: number, month: number): boolean {
  const reference = astro.bySolar(`${year}-1-1`, 0, '男', true)
  return reference.monthlyList(year, true).some((item) => item.month === month && item.isLeapMonth)
}

export function getTimeIndex(hour: number, minute = 0): number {
  // 00:00–00:59 is early Zi (0); 23:00–23:59 is late Zi (12).
  if (hour === 0) return 0
  if (hour === 23) return 12
  return Math.floor((hour + 1) / 2)
}

export function getSolarDateFromLunar(year: number, month: number, day: number, isLeapMonth = false, hour = 12, gender: Gender = 'male', fixLeap = true): { year: number; month: number; day: number } {
  const chart = astro.byLunar(`${year}-${month}-${day}`, getTimeIndex(hour), gender === 'male' ? '男' : '女', isLeapMonth, fixLeap)
  const [solarYear, solarMonth, solarDay] = chart.solarDate.split('-').map(Number)
  return { year: solarYear, month: solarMonth, day: solarDay }
}

/* ------------------------------------------------------------
   时辰选项
   ------------------------------------------------------------ */

const SHICHEN_NAMES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const

export function hourToShichen(hour: number): string {
  const index = Math.floor(((hour + 1) % 24) / 2)
  return SHICHEN_NAMES[index] + '时'
}

export function getShichenOptions() {
  // 子时跨越民用日期边界。拆分早子时与晚子时，才能正确应用 23:00 子初换日规则。
  const ziOptions = [
    { value: 23, label: '子时（晚子时 23:00-23:59）' },
    { value: 0, label: '子时（早子时 00:00-00:59）' },
  ]
  const otherOptions = SHICHEN_NAMES.slice(1).map((name, offset) => {
    const index = offset + 1
    const startHour = index * 2 - 1
    const endHour = index * 2
    return {
      value: index * 2,
      label: `${name}时 (${String(startHour).padStart(2, '0')}:00-${String(endHour).padStart(2, '0')}:59)`,
    }
  })

  return [...ziOptions, ...otherOptions]
}

/* ------------------------------------------------------------
   导出类型
   ------------------------------------------------------------ */

export type { FunctionalAstrolabe }
