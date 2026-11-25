import { describe, expect, it } from 'vitest'
import { generateChart } from './astro'
import { calculateMonthlyKLines, calculatePeriodScore } from './fortune-score'

describe('yearly K-line scoring', () => {
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
  it('uses monthly-scope palace scores and produces repeatable monthly K-lines', () => {
    const chart = generateChart({
      year: 2000,
      month: 8,
      day: 16,
      hour: 4,
      gender: 'female',
      trueSolarEnabled: false,
    })

    const firstRun = calculateMonthlyKLines(chart, 2023)
    const secondRun = calculateMonthlyKLines(chart, 2023)

    expect(firstRun).toHaveLength(12)
    expect(firstRun.map(({ open, high, low, close, score }) => ({
      open,
      high,
      low,
      close,
      score,
    }))).toEqual(secondRun.map(({ open, high, low, close, score }) => ({
      open,
      high,
      low,
      close,
      score,
    })))
  })

})