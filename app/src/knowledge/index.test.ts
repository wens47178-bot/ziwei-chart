import { describe, expect, it } from 'vitest'
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'
import { detectPatterns, extractKnowledge, buildPromptContext } from './index'

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

describe('palace relationship and flying transformation context', () => {
  it('builds the correct three-harmony palaces and opposite palace for each palace', () => {
    const chart = chartWithPalaces([
      { name: '命宫', index: 0, majorStars: [{ name: '紫微' }] },
      { name: '财帛宫', index: 4, majorStars: [{ name: '天府' }] },
      { name: '官禄宫', index: 8, majorStars: [{ name: '武曲' }] },
      { name: '迁移宫', index: 6, majorStars: [{ name: '破军' }] },
    ])
    const context = extractKnowledge(chart)

    const life = context.三方四正.find((item) => item.palace === '命宫')
    expect(life?.trinePalaces.map((item) => item.name)).toEqual(['命宫', '财帛宫', '官禄宫'])
    expect(life?.oppositePalace?.name).toBe('迁移宫')
  })

  it('maps palace-stem transformations to the palace where the transformed star actually sits', () => {
    const chart = {
      palaces: [
        { name: '命宫', index: 0, heavenlyStem: '甲', majorStars: [], minorStars: [], adjectiveStars: [] },
        { name: '财帛宫', index: 4, heavenlyStem: '乙', majorStars: [{ name: '廉贞' }], minorStars: [], adjectiveStars: [] },
        { name: '官禄宫', index: 8, heavenlyStem: '丙', majorStars: [{ name: '破军' }], minorStars: [], adjectiveStars: [] },
        { name: '迁移宫', index: 6, heavenlyStem: '丁', majorStars: [{ name: '武曲' }, { name: '太阳' }], minorStars: [], adjectiveStars: [] },
      ],
    } as unknown as FunctionalAstrolabe
    const context = extractKnowledge(chart)
    const lu = context.宫干飞化.find((item) => item.sourcePalace === '命宫' && item.star === '廉贞')

    expect(lu).toMatchObject({
      sourceStem: '甲',
      transformation: '化禄',
      targetPalace: '财帛宫',
    })
  })

  it('does not silently generate yearly forecasts inside a natal-only report context', () => {
    const context = extractKnowledge(chartWithPalaces([
      { name: '命宫', index: 0, majorStars: [] },
    ]))

    expect(context.流年).toEqual([])
    expect(buildPromptContext(context)).not.toContain('近年流年信息')
  })

  it('includes explicit trine and flying-transformation evidence in the AI prompt context', () => {
    const chart = {
      palaces: [
        { name: '命宫', index: 0, heavenlyStem: '甲', majorStars: [{ name: '紫微' }], minorStars: [], adjectiveStars: [] },
        { name: '财帛宫', index: 4, heavenlyStem: '乙', majorStars: [{ name: '廉贞' }], minorStars: [], adjectiveStars: [] },
        { name: '官禄宫', index: 8, heavenlyStem: '丙', majorStars: [{ name: '破军' }], minorStars: [], adjectiveStars: [] },
        { name: '迁移宫', index: 6, heavenlyStem: '丁', majorStars: [{ name: '武曲' }], minorStars: [], adjectiveStars: [] },
      ],
    } as unknown as FunctionalAstrolabe
    const context = extractKnowledge(chart)
    const prompt = buildPromptContext(context)

    expect(prompt).toContain('十二宫三方四正关系')
    expect(prompt).toContain('命宫三方')
    expect(prompt).toContain('十二宫宫干飞化落点')
    expect(prompt).toContain('命宫（甲干）廉贞化禄飞入财帛宫')
  })
})
