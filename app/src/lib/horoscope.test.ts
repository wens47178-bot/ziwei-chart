import { describe, expect, it } from 'vitest'
import { findPalaceForHoroscopeName } from './horoscope'

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
