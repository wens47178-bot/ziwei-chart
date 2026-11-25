import { describe, expect, it } from 'vitest'
import { generateChart } from './astro'
import { calculateMonthlyDimensions, calculatePeriodScore, generateLifetimeKLines, getDecadalYearRange } from './fortune-score'
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'

describe('K-line scoring', () => {
  it('uses the selected year palace layout instead of reusing natal dimensions', () => {
    const chart = generateChart({
      year: 2000,
      month: 8,
      day: 16,
      hour: 4,
      gender: 'female',
      trueSolarEnabled: false,
    })

    const firstHoroscope = chart.horoscope(new Date('2000-06-15'))
    const nextHoroscope = chart.horoscope(new Date('2001-06-15'))

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

  it('maps decadal virtual-age ranges to the correct lunar birth-year sequence', () => {
    expect(getDecadalYearRange(2000, 6, 15)).toEqual([2005, 2014])
  })

  it('generates repeatable lifetime K-lines for the same chart', () => {
    const chart = {
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
        palace: () => ({ majorStars: [], minorStars: [], adjectiveStars: [] }),
        hasHoroscopeMutagen: () => false,
      }),
    } as unknown as FunctionalAstrolabe

    const lifetime = generateLifetimeKLines(chart, 2000)

    expect(lifetime).toEqual(generateLifetimeKLines(chart, 2000))
    expect(lifetime[0].dimensions).toEqual(calculatePeriodScore(chart, 2000).dimensions)
  })

})