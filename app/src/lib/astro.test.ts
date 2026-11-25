import { describe, expect, it } from 'vitest'
import { generateChart, getShichenOptions, hourToShichen } from './astro'

describe('iztro chart engine integration', () => {
  it('generates a twelve-palace chart with the current supported engine', () => {
    const chart = generateChart({
      year: 1990,
      month: 1,
      day: 1,
      hour: 12,
      gender: 'male',
      trueSolarEnabled: false,
    })

    expect(chart.palaces).toHaveLength(12)
    expect(chart.fiveElementsClass).toBeTruthy()
  })

  it('matches the upstream iztro solar-to-lunar and ganzhi reference fixture', () => {
    const chart = generateChart({
      year: 2000,
      month: 8,
      day: 16,
      hour: 4,
      gender: 'female',
      trueSolarEnabled: false,
    })

    // Reference values are taken from iztro's own bySolar() integration test.
    expect(chart.solarDate).toBe('2000-8-16')
    expect(chart.lunarDate).toBe('二〇〇〇年七月十七')
    expect(chart.chineseDate).toBe('庚辰 甲申 丙午 庚寅')
  })

  it('treats late zi hour as the following civil day under the configured day boundary', () => {
    const lateZi = generateChart({
      year: 1990,
      month: 1,
      day: 1,
      hour: 23,
      gender: 'male',
      trueSolarEnabled: false,
    })
    const followingEarlyZi = generateChart({
      year: 1990,
      month: 1,
      day: 2,
      hour: 0,
      gender: 'male',
      trueSolarEnabled: false,
    })

    const signature = (chart: typeof lateZi) => ({
      lunarDate: chart.lunarDate,
      fiveElementsClass: chart.fiveElementsClass,
      palaces: chart.palaces.map((palace) => ({
        name: palace.name,
        heavenlyStem: palace.heavenlyStem,
        earthlyBranch: palace.earthlyBranch,
        majorStars: palace.majorStars.map((star) => star.name),
        minorStars: palace.minorStars.map((star) => star.name),
        adjectiveStars: palace.adjectiveStars.map((star) => star.name),
      })),
    })

    expect(lateZi.time).toBe('晚子时')
    expect(followingEarlyZi.time).toBe('早子时')
    expect(signature(lateZi)).toEqual(signature(followingEarlyZi))
  })

  it('keeps the twelve shichen options aligned with their intended hour ranges', () => {
    expect(getShichenOptions().map((option) => option.value)).toEqual([
      23, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22,
    ])
    expect(hourToShichen(23)).toBe('子时')
    expect(hourToShichen(0)).toBe('子时')
    expect(hourToShichen(1)).toBe('丑时')
    expect(hourToShichen(22)).toBe('亥时')
  })
})
