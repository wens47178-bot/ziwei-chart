declare const process: { env: Record<string, string | undefined> }

import { describe, expect, it } from 'vitest'
import birthplaceData from './birthplace-data.json'
import {
  type Birthplace,
  findBirthplaceInData,
  resolveBirthTime,
  resolveBirthTimeAsync,
  shichenNameForTimeIndex,
} from './true-solar-time'

const SICHUAN_CHENGDU = '四川成都'
const CHENGDU = '成都'
const CHENGDU_CITY = '成都市'
const SHAANXI_YANAN = '陕西延安'
const YANAN_CITY = '延安市'
const BEIJING = '北京'
const BEIJING_CITY = '北京市'
const URUMQI = '乌鲁木齐'
const MARS_BASE = '火星基地'
const WU_SHICHEN = '午时'
const SI_SHICHEN = '巳时'
const ZI_SHICHEN = '子时'
const BIRTHPLACE_DATA = birthplaceData as Birthplace[]

describe('birth date and time validation', () => {
  it('rejects an impossible calendar date instead of rolling it into the next month', () => {
    expect(() => resolveBirthTime({
      year: 2024,
      month: 2,
      day: 30,
      hour: 12,
      enabled: false,
    })).toThrow(RangeError)
  })

  it('rejects invalid month and hour values', () => {
    expect(() => resolveBirthTime({
      year: 2024,
      month: 13,
      day: 1,
      hour: 12,
      enabled: false,
    })).toThrow(RangeError)
    expect(() => resolveBirthTime({
      year: 2024,
      month: 1,
      day: 1,
      hour: 24,
      enabled: false,
    })).toThrow(RangeError)
  })

  it('handles years below 100 without JavaScript Date.UTC year remapping', () => {
    const result = resolveBirthTime({
      year: 24,
      month: 2,
      day: 29,
      hour: 12,
      enabled: false,
    })

    expect(result.year).toBe(24)
    expect(result.month).toBe(2)
    expect(result.day).toBe(29)
  })
})

describe('findBirthplace', () => {
  it('matches common city names from plain birthplace input', () => {
    expect(findBirthplaceInData(SICHUAN_CHENGDU, BIRTHPLACE_DATA)?.name).toBe(CHENGDU_CITY)
    expect(findBirthplaceInData(SICHUAN_CHENGDU, BIRTHPLACE_DATA)?.longitude).toBeCloseTo(104.08, 2)
  })

  it('matches non-popular prefecture-level cities from the local data set', async () => {
    const yanAn = await resolveBirthTimeAsync({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      birthplace: SHAANXI_YANAN,
      enabled: true,
    })

    expect(yanAn.location?.name).toBe(YANAN_CITY)
    expect(yanAn.location?.longitude).toBeCloseTo(109.5, 1)
  })

  it('returns null when the birthplace cannot be matched', () => {
    expect(findBirthplaceInData(MARS_BASE, BIRTHPLACE_DATA)).toBeNull()
  })
})

describe('resolveBirthTime', () => {
  it('distinguishes early and late zi hours at the 23:00 day boundary', () => {
    const earlyZi = resolveBirthTime({
      year: 2024,
      month: 1,
      day: 2,
      hour: 0,
      enabled: false,
    })
    const lateZi = resolveBirthTime({
      year: 2024,
      month: 1,
      day: 1,
      hour: 23,
      enabled: false,
    })

    expect(earlyZi.timeIndex).toBe(0)
    expect(lateZi.timeIndex).toBe(12)
    expect(earlyZi.originalShichen).toBe(ZI_SHICHEN)
    expect(lateZi.originalShichen).toBe(ZI_SHICHEN)
    expect(earlyZi.day).toBe(2)
    expect(lateZi.day).toBe(1)
  })

  it('keeps the original time when true solar correction is disabled', async () => {
    const result = await resolveBirthTimeAsync({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      birthplace: CHENGDU,
      enabled: false,
    })

    expect(result.applied).toBe(false)
    expect(result.timeIndex).toBe(6)
    expect(result.correctedShichen).toBe(WU_SHICHEN)
  })

  it('uses birthplace longitude to move Chengdu noon birth into the previous shichen', async () => {
    const result = await resolveBirthTimeAsync({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      birthplace: CHENGDU,
      enabled: true,
    })

    expect(result.applied).toBe(true)
    expect(result.location?.name).toBe(CHENGDU_CITY)
    expect(result.correctionMinutes).toBeLessThan(-60)
    expect(result.originalShichen).toBe(WU_SHICHEN)
    expect(result.correctedShichen).toBe(SI_SHICHEN)
    expect(result.timeIndex).toBe(5)
  })

  it('keeps Beijing noon birth in noon shichen after correction', async () => {
    const result = await resolveBirthTimeAsync({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      birthplace: BEIJING,
      enabled: true,
    })

    expect(result.applied).toBe(true)
    expect(result.location?.name).toBe(BEIJING_CITY)
    expect(result.correctedShichen).toBe(WU_SHICHEN)
    expect(result.timeIndex).toBe(6)
  })

  it('moves the chart date when correction crosses midnight', async () => {
    const result = await resolveBirthTimeAsync({
      year: 1990,
      month: 1,
      day: 1,
      hour: 2,
      birthplace: URUMQI,
      enabled: true,
    })

    expect(result.applied).toBe(true)
    expect(result.year).toBe(1989)
    expect(result.month).toBe(12)
    expect(result.day).toBe(31)
    expect(result.correctedShichen).toBe(ZI_SHICHEN)
    expect(result.timeIndex).toBe(12)
  })
})

describe('shichenNameForTimeIndex', () => {
  it('names late zi time index as zi shichen', () => {
    expect(shichenNameForTimeIndex(12)).toBe(ZI_SHICHEN)
  })
})

describe('timezone-independent calendar arithmetic', () => {
  it('uses the same wall-clock result regardless of the runtime timezone', () => {
    const input = {
      year: 2024,
      month: 3,
      day: 10,
      hour: 2,
      birthplace: URUMQI,
      enabled: true,
      birthplaces: BIRTHPLACE_DATA,
    }

    const originalTimezone = process.env.TZ
    try {
      process.env.TZ = 'UTC'
      const utcResult = resolveBirthTime(input)

      process.env.TZ = 'America/Los_Angeles'
      const pacificResult = resolveBirthTime(input)

      expect(pacificResult).toEqual(utcResult)
    } finally {
      if (originalTimezone === undefined) delete process.env.TZ
      else process.env.TZ = originalTimezone
    }
  })

  it('handles leap-day input without relying on local daylight-saving rules', () => {
    const result = resolveBirthTime({
      year: 2024,
      month: 2,
      day: 29,
      hour: 12,
      birthplace: BEIJING,
      enabled: true,
      birthplaces: BIRTHPLACE_DATA,
    })

    expect(result.year).toBe(2024)
    expect(result.month).toBe(2)
    expect(result.day).toBe(29)
    expect(result.applied).toBe(true)
  })
})
