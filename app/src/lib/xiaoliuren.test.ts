import { describe, expect, it } from 'vitest'
import { calculateXiaoLiuRen, XIAO_LIU_REN_PALACES } from './xiaoliuren'

describe('小六壬常见掌诀法', () => {
  it('starts the first lunar month at 大安 and counts forward', () => {
    expect(calculateXiaoLiuRen(1, 1, 0).palace.name).toBe('大安')
    expect(calculateXiaoLiuRen(2, 1, 0).palace.name).toBe('留连')
    expect(calculateXiaoLiuRen(3, 1, 0).palace.name).toBe('速喜')
  })

  it('counts lunar day from the month palace and shichen from the day palace', () => {
    const result = calculateXiaoLiuRen(1, 2, 1)
    expect(result.monthPalaceIndex).toBe(0)
    expect(result.dayPalaceIndex).toBe(1)
    expect(result.resultIndex).toBe(2)
    expect(result.palace.name).toBe('速喜')
  })

  it('wraps through all six palaces', () => {
    expect(calculateXiaoLiuRen(1, 1, 6).palace.name).toBe('大安')
    expect(XIAO_LIU_REN_PALACES.map((palace) => palace.name)).toEqual([
      '大安', '留连', '速喜', '赤口', '小吉', '空亡',
    ])
  })

  it('rejects invalid month, day, and shichen values', () => {
    expect(() => calculateXiaoLiuRen(0, 1, 0)).toThrow(RangeError)
    expect(() => calculateXiaoLiuRen(1, 31, 0)).toThrow(RangeError)
    expect(() => calculateXiaoLiuRen(1, 1, 12)).toThrow(RangeError)
  })
})
