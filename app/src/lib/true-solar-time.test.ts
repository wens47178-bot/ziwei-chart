declare const process: { env: Record<string, string | undefined> }

import { afterEach, describe, expect, it, vi } from 'vitest'
import birthplaceData from './birthplace-data.json'
import globalBirthplaceData from './global-birthplace-data.json'
import {
  type Birthplace,
  findBirthplaceAsync,
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
const GLOBAL_BIRTHPLACE_DATA = globalBirthplaceData as Birthplace[]
const ALL_BIRTHPLACE_DATA = [...BIRTHPLACE_DATA, ...GLOBAL_BIRTHPLACE_DATA] as Birthplace[]

afterEach(() => {
  vi.unstubAllGlobals()
})

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

  it('rejects invalid month, hour, and minute values', () => {
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
    expect(() => resolveBirthTime({
      year: 2024,
      month: 1,
      day: 1,
      hour: 12,
      minute: 60,
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

  it('matches overseas cities by Chinese, English, and country-qualified names', () => {
    expect(findBirthplaceInData('金边', GLOBAL_BIRTHPLACE_DATA)?.city).toBe('Phnom Penh')
    expect(findBirthplaceInData('Phnom Penh, Cambodia', GLOBAL_BIRTHPLACE_DATA)?.timeZone).toBe('Asia/Phnom_Penh')
    expect(findBirthplaceInData('New York, USA', GLOBAL_BIRTHPLACE_DATA)?.timeZone).toBe('America/New_York')
    expect(findBirthplaceInData('东京', GLOBAL_BIRTHPLACE_DATA)?.timeZone).toBe('Asia/Tokyo')
    expect(findBirthplaceInData('United States', GLOBAL_BIRTHPLACE_DATA)).toBeNull()
  })

  it('finds cities outside the curated list through the global city catalogue', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: [{
            type: 'city',
            name: 'Akureyri',
            countryCode: 'IS',
            countryName: 'Iceland',
            geonameId: 2633274,
          }],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'Akureyri',
          countryName: 'Iceland',
          latitude: '65.6835',
          longitude: '-18.0878',
          timezone: 'Atlantic/Akureyri',
        }),
      })
    vi.stubGlobal('fetch', fetchMock)

    const place = await findBirthplaceAsync('Akureyri, Iceland')

    expect(place?.name).toBe('Akureyri')
    expect(place?.timeZone).toBe('Atlantic/Akureyri')
    expect(place?.latitude).toBeCloseTo(65.6835)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not select an arbitrary remote city when a name is ambiguous', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [
          { type: 'city', name: 'Springfield', countryCode: 'US', countryName: 'United States', geonameId: 4250542 },
          { type: 'city', name: 'Springfield', countryCode: 'AU', countryName: 'Australia', geonameId: 214959 },
        ],
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const place = await findBirthplaceAsync('Springfield')

    expect(place).toBeNull()
    expect(fetchMock).toHaveBeenCalledTimes(1)
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
      minute: 59,
      enabled: false,
    })
    const lateZi = resolveBirthTime({
      year: 2024,
      month: 1,
      day: 1,
      hour: 23,
      minute: 59,
      enabled: false,
    })

    expect(earlyZi.minute).toBe(59)
    expect(lateZi.minute).toBe(59)
    expect(earlyZi.timeIndex).toBe(0)
    expect(lateZi.timeIndex).toBe(12)
    expect(earlyZi.originalShichen).toBe(ZI_SHICHEN)
    expect(lateZi.originalShichen).toBe(ZI_SHICHEN)
    expect(earlyZi.day).toBe(2)
    expect(lateZi.day).toBe(1)
  })

  it('preserves the entered minute and uses it in true-solar-time date arithmetic', async () => {
    const result = await resolveBirthTimeAsync({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      minute: 59,
      birthplace: CHENGDU,
      enabled: true,
    })

    expect(result.applied).toBe(true)
    expect(result.correctionMinutes).toBeLessThan(-60)
    expect(result.hour).toBe(11)
    expect(result.minute).toBeGreaterThan(45)
    expect(result.minute).toBeLessThan(60)
    expect(result.correctedShichen).toBe(WU_SHICHEN)
  })

  it('applies China historical daylight-saving offset before longitude and equation-of-time correction', () => {
    const result = resolveBirthTime({
      year: 1988,
      month: 7,
      day: 1,
      hour: 12,
      minute: 0,
      birthplace: BEIJING,
      enabled: true,
      birthplaces: BIRTHPLACE_DATA,
    })

    expect(result.timeZone).toBe('Asia/Shanghai')
    expect(result.utcOffsetMinutes).toBe(540)
    expect(result.dstAdjustmentMinutes).toBe(60)
    expect(result.correctionMinutes).toBe(
      result.longitudeCorrectionMinutes + result.equationOfTimeMinutes,
    )
    expect(result.hour).toBe(10)
  })

  it('uses the actual New York timezone offset and daylight-saving rule', () => {
    const result = resolveBirthTime({
      year: 2024,
      month: 7,
      day: 1,
      hour: 12,
      minute: 0,
      birthplace: 'New York, USA',
      enabled: true,
      birthplaces: ALL_BIRTHPLACE_DATA,
    })

    expect(result.applied).toBe(true)
    expect(result.timeZone).toBe('America/New_York')
    expect(result.utcOffsetMinutes).toBe(-240)
    expect(result.dstAdjustmentMinutes).toBe(60)
    expect(result.correctionMinutes).toBe(
      result.longitudeCorrectionMinutes + result.equationOfTimeMinutes,
    )
    expect(result.hour).toBe(11)
  })

  it('rejects nonexistent overseas wall times during a daylight-saving spring-forward', () => {
    expect(() => resolveBirthTime({
      year: 2024,
      month: 3,
      day: 10,
      hour: 2,
      minute: 30,
      birthplace: 'New York, USA',
      enabled: true,
      birthplaces: ALL_BIRTHPLACE_DATA,
    })).toThrow(/does not exist/)
  })

  it('flags repeated overseas wall times during a daylight-saving fall-back', () => {
    const result = resolveBirthTime({
      year: 2024,
      month: 11,
      day: 3,
      hour: 1,
      minute: 30,
      birthplace: 'New York, USA',
      enabled: true,
      birthplaces: ALL_BIRTHPLACE_DATA,
    })

    expect(result.ambiguousLocalTime).toBe(true)
    expect(result.utcOffsetMinutes).toBe(-240)
  })

  it('resolves fractional-hour timezones such as Nepal UTC+05:45', () => {
    const result = resolveBirthTime({
      year: 2024,
      month: 1,
      day: 15,
      hour: 12,
      birthplace: 'Kathmandu, Nepal',
      enabled: true,
      birthplaces: ALL_BIRTHPLACE_DATA,
    })

    expect(result.timeZone).toBe('Asia/Kathmandu')
    expect(result.utcOffsetMinutes).toBe(345)
  })

  it('handles southern-hemisphere summer daylight time', () => {
    const result = resolveBirthTime({
      year: 2024,
      month: 1,
      day: 15,
      hour: 12,
      birthplace: 'Sydney, Australia',
      enabled: true,
      birthplaces: ALL_BIRTHPLACE_DATA,
    })

    expect(result.timeZone).toBe('Australia/Sydney')
    expect(result.utcOffsetMinutes).toBe(660)
    expect(result.dstAdjustmentMinutes).toBe(60)
  })

  it('does not apply a daylight-saving adjustment outside the historical DST period', () => {
    const result = resolveBirthTime({
      year: 1992,
      month: 7,
      day: 1,
      hour: 12,
      birthplace: BEIJING,
      enabled: true,
      birthplaces: BIRTHPLACE_DATA,
    })

    expect(result.utcOffsetMinutes).toBe(480)
    expect(result.dstAdjustmentMinutes).toBe(0)
  })

  it('rejects a nonexistent local time during a historical spring-forward transition', () => {
    expect(() => resolveBirthTime({
      year: 1988,
      month: 4,
      day: 17,
      hour: 2,
      minute: 30,
      birthplace: BEIJING,
      enabled: true,
      birthplaces: BIRTHPLACE_DATA,
    })).toThrow(/does not exist/)
  })

  it('flags repeated local times during a historical fall-back transition', () => {
    const result = resolveBirthTime({
      year: 1988,
      month: 9,
      day: 11,
      hour: 1,
      minute: 30,
      birthplace: BEIJING,
      enabled: true,
      birthplaces: BIRTHPLACE_DATA,
    })

    expect(result.ambiguousLocalTime).toBe(true)
    expect(result.utcOffsetMinutes).toBe(540)
  })

  it('does not use birthplace records with placeholder zero coordinates', () => {
    expect(findBirthplaceInData('石河子市', BIRTHPLACE_DATA)).toBeNull()
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
      minute: 5,
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
