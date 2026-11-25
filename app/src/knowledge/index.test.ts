import { describe, expect, it } from 'vitest'
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'
import { detectPatterns } from './index'

function chartWithPalaces(palaces: Array<{
  name: string
  index: number
  majorStars?: Array<{ name: string; mutagen?: string }>
}>): FunctionalAstrolabe {
  return { palaces } as unknown as FunctionalAstrolabe
}

describe('detectPatterns', () => {
  it('does not call a partial pair in the life palace 机月同梁', () => {
    const chart = chartWithPalaces([
      { name: '命宫', index: 0, majorStars: [{ name: '天机' }, { name: '天同' }] },
      { name: '财帛宫', index: 4, majorStars: [] },
      { name: '官禄宫', index: 8, majorStars: [] },
    ])

    expect(detectPatterns(chart).some((item) => item.startsWith('机月同梁'))).toBe(false)
  })

  it('recognizes 机月同梁 only when all four stars appear across the life trines', () => {
    const chart = chartWithPalaces([
      { name: '命宫', index: 0, majorStars: [{ name: '天机' }] },
      { name: '财帛宫', index: 4, majorStars: [{ name: '太阴' }, { name: '天同' }] },
      { name: '官禄宫', index: 8, majorStars: [{ name: '天梁' }] },
    ])

    expect(detectPatterns(chart).some((item) => item.startsWith('机月同梁'))).toBe(true)
  })

  it('reports a natal 化忌 placement without making a deterministic prediction', () => {
    const chart = chartWithPalaces([
      { name: '命宫', index: 0, majorStars: [{ name: '太阳', mutagen: '化忌' }] },
    ])

    const hint = detectPatterns(chart).find((item) => item.startsWith('太阳化忌入命'))
    expect(hint).toContain('落在命宫')
    expect(hint).not.toContain('必然')
  })
})
