declare const process: { env: Record<string, string | undefined> }

import { describe, expect, it } from 'vitest'
import { createLocalCalendarDate, findPalaceForHoroscopeName } from './horoscope'

describe('findPalaceForHoroscopeName', () => {
  it('resolves a yearly palace label through its natal palace index', () => {
    const natalPalaces = [
      { index: 0, name: '父母宫' },
      { index: 1, name: '福德宫' },
      { index: 2, name: '田宅宫' },
    ]
    const yearlyPalaceNames = ['兄弟宫', '命宫', '父母宫']

    expect(
      findPalaceForHoroscopeName(natalPalaces, yearlyPalaceNames, '命宫'),
    ).toEqual({ index: 1, name: '福德宫' })
  })

  it('returns undefined when the requested palace is not in the horoscope scope', () => {
    const natalPalaces = [{ index: 0, name: '命宫' }]

    expect(
      findPalaceForHoroscopeName(natalPalaces, ['命宫'], '财帛宫'),
    ).toBeUndefined()
  })
})

describe('createLocalCalendarDate', () => {
  it('preserves the requested calendar date in different runtime timezones', () => {
    const originalTimezone = process.env.TZ
    try {
      for (const timezone of ['UTC', 'America/Los_Angeles', 'Asia/Phnom_Penh']) {
        process.env.TZ = timezone
        const date = createLocalCalendarDate(2024, 6, 15)

        expect(date.getFullYear()).toBe(2024)
        expect(date.getMonth()).toBe(5)
        expect(date.getDate()).toBe(15)
        expect(date.getHours()).toBe(12)
      }
    } finally {
      if (originalTimezone === undefined) delete process.env.TZ
      else process.env.TZ = originalTimezone
    }
  })

  it('does not remap years from 1 through 99 to the twentieth century', () => {
    const date = createLocalCalendarDate(24, 6, 15)
    expect(date.getFullYear()).toBe(24)
    expect(date.getMonth()).toBe(5)
    expect(date.getDate()).toBe(15)
  })
})
