import { describe, expect, it } from 'vitest'
import { generateChart } from './astro'
import { createLocalCalendarDate, calculateDecadalBaseScore, calculateMonthlyDimensions, calculatePeriodScore, calculateScopeMutagenBonus, generateLifetimeKLines, generateMonthlyKLines, getDecadalYearRange } from './fortune-score'
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'

describe('K-line scoring', () => {
  it('constructs horoscope dates from the intended local calendar day', () => {
    const date = createLocalCalendarDate(2024, 3, 10)

    expect(date.getFullYear()).toBe(2024)
    expect(date.getMonth()).toBe(2)
    expect(date.getDate()).toBe(10)
    expect(date.getHours()).toBe(12)
  })
  it('uses the selected year palace layout instead of reusing natal dimensions', () => {
    const chart = generateChart({
      year: 2000,
      month: 8,
      day: 16,
      hour: 4,
      gender: 'female',
      trueSolarEnabled: false,
    })

    const firstHoroscope = chart.horoscope(createLocalCalendarDate(2000, 6, 15))
    const nextHoroscope = chart.horoscope(createLocalCalendarDate(2001, 6, 15))

    expect(firstHoroscope.yearly.palaceNames).not.toEqual(nextHoroscope.yearly.palaceNames)

    const firstYear = calculatePeriodScore(chart, 2000)
    const nextYear = calculatePeriodScore(chart, 2001)

    // Yearly palace names rotate against the natal palace indexes, so at least
    // one dimension must be recalculated from a different set of natal palaces.
    expect(firstYear.dimensions).not.toEqual(nextYear.dimensions)
  })

  it('keeps a given year score deterministic', () => {
    const chart = generateChart({
      year: 2000,
      month: 8,
      day: 16,
      hour: 4,
      gender: 'female',
      trueSolarEnabled: false,
    })

    expect(calculatePeriodScore(chart, 2000)).toEqual(calculatePeriodScore(chart, 2000))
  })
  it('uses monthly-scope palace scores and produces repeatable monthly dimensions', () => {
    const chart = generateChart({
      year: 2000,
      month: 8,
      day: 16,
      hour: 4,
      gender: 'female',
      trueSolarEnabled: false,
    })

    expect(calculateMonthlyDimensions(chart, 2023, 1)).toEqual(
      calculateMonthlyDimensions(chart, 2023, 1)
    )
  })


  it('labels monthly K-line samples as Gregorian months', () => {
    const chart = generateChart({
      year: 2000,
      month: 8,
      day: 16,
      hour: 4,
      gender: 'female',
      trueSolarEnabled: false,
    })

    const monthly = generateMonthlyKLines(chart, 2023)

    expect(monthly).toHaveLength(12)
    expect(monthly[0].period).toBe('公历1月')
    expect(monthly[11].period).toBe('公历12月')
  })

  it('maps decadal virtual-age ranges to the correct lunar birth-year sequence', () => {
    expect(getDecadalYearRange(2000, 6, 15)).toEqual([2005, 2014])
  })

  it('generates repeatable lifetime K-lines for the same chart', () => {
    const chart = {
      rawDates: { lunarDate: { lunarYear: 2000 } },
      solarDate: '2000-8-16',
      lunarDate: '二〇〇〇年七月十七',
      time: '寅时',
      gender: '女',
      fiveElementsClass: '金四局',
      palaces: [{
        name: '命宫',
        decadal: {
          range: [1, 100],
          heavenlyStem: '甲',
          earthlyBranch: '子',
        },
        majorStars: [],
        minorStars: [],
      }],
      horoscope: () => ({
        yearly: { mutagen: [], index: 0 },
        decadal: { index: 0, palaceNames: ['命宫'] },
        palace: () => ({ majorStars: [], minorStars: [], adjectiveStars: [] }),
        hasHoroscopeMutagen: () => false,
      }),
    } as unknown as FunctionalAstrolabe

    const lifetime = generateLifetimeKLines(chart, 2000)

    expect(lifetime).toEqual(generateLifetimeKLines(chart, 2000))
    expect(lifetime[0].dimensions).toEqual(calculatePeriodScore(chart, 2000).dimensions)
  })

  it('applies scope transformations only to the matching natal palace index', () => {
    const horoscope = {
      yearly: { palaceNames: ['命宫', '财帛'] },
      hasHoroscopeMutagen: (palaceName: string, scope: string, mutagen: string) =>
        palaceName === '财帛' && scope === 'yearly' && mutagen === '忌',
    } as unknown as Parameters<typeof calculateScopeMutagenBonus>[0]

    const modifiers = { '禄': 6, '权': 5, '科': 4, '忌': -8 }

    expect(calculateScopeMutagenBonus(horoscope, 'yearly', 1, modifiers)).toBe(-8)
    expect(calculateScopeMutagenBonus(horoscope, 'yearly', 0, modifiers)).toBe(0)
  })

  it('includes transformations placed in the decadal life palace in the decadal base', () => {
    const chart = {
      rawDates: { lunarDate: { lunarYear: 2000 } },
      palaces: [{
        index: 0,
        name: '命宫',
        decadal: {
          range: [1, 10],
          heavenlyStem: '甲',
          earthlyBranch: '子',
        },
        majorStars: [],
        minorStars: [],
      }],
      horoscope: () => ({
        decadal: { index: 0, palaceNames: ['命宫'] },
        hasHoroscopeMutagen: (_palaceName: string, scope: string, mutagen: string) =>
          scope === 'decadal' && mutagen === '禄',
      }),
    } as unknown as FunctionalAstrolabe

    expect(calculateDecadalBaseScore(chart, 1)).toBe(63)
  })

})