export const XIAO_LIU_REN_PALACES = [
  { name: '大安', nature: '吉', element: '木', direction: '东方', summary: '身稳心安，凡事宜守成。', detail: '主安稳、平顺与持续推进。适合处理长期事务、打基础、按部就班落实计划。' },
  { name: '留连', nature: '平', element: '水', direction: '北方', summary: '事情牵缠，宜耐心等待。', detail: '主迟缓、反复与牵连。适合复核细节、补足准备，不宜因焦虑而仓促决定。' },
  { name: '速喜', nature: '吉', element: '火', direction: '南方', summary: '喜讯较快，宜主动把握。', detail: '主消息、进展与短期喜庆。适合及时沟通、把握窗口，但仍需核实信息。' },
  { name: '赤口', nature: '慎', element: '金', direction: '西方', summary: '口舌易起，谨慎沟通。', detail: '主争执、误会与言语冲突。重要沟通宜留记录，避免冲动表达与正面争辩。' },
  { name: '小吉', nature: '吉', element: '木', direction: '东方', summary: '小有助力，循序渐进。', detail: '主小成、助力与渐进收获。适合从可执行的小步骤开始，累积成果。' },
  { name: '空亡', nature: '慎', element: '土', direction: '中央', summary: '暂难落实，宜先厘清条件。', detail: '主落空、未定与信息不足。适合暂停确认、检查资源与前提，不宜贸然承诺。' },
] as const

export type XiaoLiuRenPalace = typeof XIAO_LIU_REN_PALACES[number]

export interface XiaoLiuRenResult {
  lunarMonth: number
  lunarDay: number
  shichenIndex: number
  monthPalaceIndex: number
  dayPalaceIndex: number
  resultIndex: number
  palace: XiaoLiuRenPalace
}

export function calculateXiaoLiuRen(lunarMonth: number, lunarDay: number, shichenIndex: number): XiaoLiuRenResult {
  if (!Number.isInteger(lunarMonth) || lunarMonth < 1 || lunarMonth > 12) {
    throw new RangeError('农历月份必须为 1 至 12 的整数。')
  }
  if (!Number.isInteger(lunarDay) || lunarDay < 1 || lunarDay > 30) {
    throw new RangeError('农历日期必须为 1 至 30 的整数。')
  }
  if (!Number.isInteger(shichenIndex) || shichenIndex < 0 || shichenIndex > 11) {
    throw new RangeError('时辰序号必须为 0 至 11。')
  }

  // 常见掌诀法：正月起大安，按月、日、时顺数；子时为时辰起点。
  const monthPalaceIndex = (lunarMonth - 1) % 6
  const dayPalaceIndex = (monthPalaceIndex + lunarDay - 1) % 6
  const resultIndex = (dayPalaceIndex + shichenIndex) % 6

  return {
    lunarMonth,
    lunarDay,
    shichenIndex,
    monthPalaceIndex,
    dayPalaceIndex,
    resultIndex,
    palace: XIAO_LIU_REN_PALACES[resultIndex],
  }
}
