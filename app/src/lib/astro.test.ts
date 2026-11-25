import { describe, expect, it } from 'vitest'
import { generateChart } from './astro'

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
})
