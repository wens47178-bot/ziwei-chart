/* ============================================================
   知识检索服务
   根据命盘数据检索相关知识，组装 AI 解读所需的上下文
   ============================================================ */

import { getStarInfo, type StarInfo } from './stars/majorStars'
import { getSihuaInfo, type SihuaInfo } from './sihua'
import type FunctionalAstrolabe from 'iztro/lib/astro/FunctionalAstrolabe'

/* ------------------------------------------------------------
   知识上下文类型
   ------------------------------------------------------------ */

interface StarWithBrightness {
  name: string
  brightness?: string      // 庙/旺/得/利/平/不/陷
  mutagen?: string         // 化禄/化权/化科/化忌
}

interface DecadalData {
  palaceName: string       // 大限所在宫位名
  ageRange: string         // "6-15" 年龄范围
  stem: string             // 大限天干
  mutagens: string[]       // 大限四化
}

interface YearlyData {
  year: number
  stem: string             // 流年天干
  branch: string           // 流年地支
  mutagens: string[]       // 流年四化
  palaceName: string       // 流年命宫所在宫位
}

interface PalaceData {
  name: string
  stem: string             // 宫干
  majorStars: StarWithBrightness[]
  minorStars: StarWithBrightness[]  // 六吉六煞等
  adjectiveStars: string[]          // 杂曜
  isBodyPalace: boolean
  decadalRange?: string    // 大限年龄范围
}

interface PalaceRelationData {
  palace: string
  trinePalaces: Array<{ name: string; majorStars: string[] }>
  oppositePalace: { name: string; majorStars: string[] } | null
}

interface FlyingTransformationData {
  sourcePalace: string
  sourceStem: string
  star: string
  transformation: '化禄' | '化权' | '化科' | '化忌'
  targetPalace: string | null
}

export interface KnowledgeContext {
  // 基础信息
  命宫主星: StarInfo[]
  身宫主星: StarInfo[]
  身宫位置: string

  // 完整十二宫信息
  十二宫: PalaceData[]
  三方四正: PalaceRelationData[]
  宫干飞化: FlyingTransformationData[]

  // 大限信息（十二个大限）
  大限: DecadalData[]

  // 流年信息（近10年 + 未来5年）
  流年: YearlyData[]

  // 四化分布（本命盘）
  四化分布: Array<{
    sihua: SihuaInfo
    star: string
    palace: string
  }>

  // 格局提示
  格局提示: string[]
}

/* ------------------------------------------------------------
   从命盘提取知识上下文
   ------------------------------------------------------------ */

export function extractKnowledge(chart: FunctionalAstrolabe, birthYear?: number): KnowledgeContext {
  // Retained for backwards compatibility; natal extraction deliberately does not synthesize annual forecasts.
  void birthYear
  const context: KnowledgeContext = {
    命宫主星: [],
    身宫主星: [],
    身宫位置: '',
    十二宫: [],
    三方四正: [],
    宫干飞化: [],
    大限: [],
    流年: [],
    四化分布: [],
    格局提示: [],
  }

  const palaces = chart.palaces || []

  // 遍历所有十二宫
  for (const palace of palaces) {
    const palaceName = String(palace.name)
    const majorStars = palace.majorStars || []
    const minorStars = palace.minorStars || []
    const adjectiveStars = palace.adjectiveStars || []
    const decadal = palace.decadal as { range?: [number, number] } | undefined

    // 提取主星（含亮度和四化）
    const majorStarsData: StarWithBrightness[] = majorStars.map(star => ({
      name: String(star.name),
      brightness: star.brightness ? String(star.brightness) : undefined,
      mutagen: star.mutagen ? String(star.mutagen) : undefined,
    }))

    // 提取辅星（六吉六煞等，含四化）
    const minorStarsData: StarWithBrightness[] = minorStars.map(star => ({
      name: String(star.name),
      mutagen: star.mutagen ? String(star.mutagen) : undefined,
    }))

    // 提取杂曜
    const adjectiveStarsData = adjectiveStars.map(star => String(star.name))

    // 大限年龄范围
    const decadalRange = decadal?.range ? `${decadal.range[0]}-${decadal.range[1]}` : undefined

    // 构建宫位数据
    const palaceData: PalaceData = {
      name: palaceName,
      stem: String(palace.heavenlyStem || ''),
      majorStars: majorStarsData,
      minorStars: minorStarsData,
      adjectiveStars: adjectiveStarsData,
      isBodyPalace: !!palace.isBodyPalace,
      decadalRange,
    }

    context.十二宫.push(palaceData)

    // 收集大限信息
    if (decadal?.range) {
      const stem = String(palace.heavenlyStem || '')
      // 根据大限天干计算大限四化
      const decadalMutagens = getDecadalMutagens(stem)

      context.大限.push({
        palaceName,
        ageRange: `${decadal.range[0]}-${decadal.range[1]}`,
        stem,
        mutagens: decadalMutagens,
      })
    }

    // 命宫主星
    if (palaceName === '命宫') {
      for (const star of majorStars) {
        const info = getStarInfo(String(star.name))
        if (info) context.命宫主星.push(info)
      }
    }

    // 身宫主星
    if (palace.isBodyPalace) {
      context.身宫位置 = palaceName
      for (const star of majorStars) {
        const info = getStarInfo(String(star.name))
        if (info) context.身宫主星.push(info)
      }
    }

    // 收集四化分布（主星 + 辅星）
    for (const star of majorStars) {
      if (star.mutagen) {
        const sihuaInfo = getSihuaInfo(String(star.mutagen))
        if (sihuaInfo) {
          context.四化分布.push({
            sihua: sihuaInfo,
            star: String(star.name),
            palace: palaceName,
          })
        }
      }
    }

    for (const star of minorStars) {
      if (star.mutagen) {
        const sihuaInfo = getSihuaInfo(String(star.mutagen))
        if (sihuaInfo) {
          context.四化分布.push({
            sihua: sihuaInfo,
            star: String(star.name),
            palace: palaceName,
          })
        }
      }
    }
  }

  // 为十二宫逐一建立三方四正：本宫、两个三合宫，以及对宫。
  // iztro 宫位 index 每隔 4 位为三合，隔 6 位为对宫。
  for (const palace of palaces) {
    const trineIndexes = [0, 4, 8].map((offset) => (palace.index + offset) % 12)
    const oppositeIndex = (palace.index + 6) % 12
    context.三方四正.push({
      palace: String(palace.name),
      trinePalaces: trineIndexes.map((index) => {
        const related = palaces.find((item) => item.index === index)
        return {
          name: String(related?.name ?? '未取得宫位'),
          majorStars: (related?.majorStars ?? []).map((star) => String(star.name)),
        }
      }),
      oppositePalace: (() => {
        const opposite = palaces.find((item) => item.index === oppositeIndex)
        return opposite ? {
          name: String(opposite.name),
          majorStars: (opposite.majorStars ?? []).map((star) => String(star.name)),
        } : null
      })(),
    })
  }

  // 按各宫宫干推演宫干四化，并将化星落点映射回实际宫位。
  // 这是本项目当前 STEM_SIHUA 表所采用的宫干飞化口径，不代表所有流派一致。
  for (const palace of palaces) {
    const stem = String(palace.heavenlyStem || '')
    const transformations = STEM_SIHUA[stem] ?? []
    for (const item of transformations) {
      const match = item.match(/^(.+?)(化禄|化权|化科|化忌)$/)
      if (!match) continue
      const [, starName, transformation] = match
      const target = palaces.find((targetPalace) =>
        [...(targetPalace.majorStars ?? []), ...(targetPalace.minorStars ?? [])]
          .some((star) => String(star.name) === starName)
      )
      context.宫干飞化.push({
        sourcePalace: String(palace.name),
        sourceStem: stem,
        star: starName,
        transformation: transformation as FlyingTransformationData['transformation'],
        targetPalace: target ? String(target.name) : null,
      })
    }
  }

  // 按年龄排序大限
  context.大限.sort((a, b) => {
    const aStart = parseInt(a.ageRange.split('-')[0])
    const bStart = parseInt(b.ageRange.split('-')[0])
    return aStart - bStart
  })

  // 本命解读不自动生成“近年/未来流年”预测。
  // 只有用户明确选择具体流年并提供对应流年盘时，才在独立运限流程中加入数据。

  // 生成格局提示
  context.格局提示 = detectPatterns(chart)

  return context
}

/* ------------------------------------------------------------
   根据天干获取四化星
   ------------------------------------------------------------ */

const STEM_SIHUA: Record<string, string[]> = {
  '甲': ['廉贞化禄', '破军化权', '武曲化科', '太阳化忌'],
  '乙': ['天机化禄', '天梁化权', '紫微化科', '太阴化忌'],
  '丙': ['天同化禄', '天机化权', '文昌化科', '廉贞化忌'],
  '丁': ['太阴化禄', '天同化权', '天机化科', '巨门化忌'],
  '戊': ['贪狼化禄', '太阴化权', '右弼化科', '天机化忌'],
  '己': ['武曲化禄', '贪狼化权', '天梁化科', '文曲化忌'],
  '庚': ['太阳化禄', '武曲化权', '太阴化科', '天同化忌'],
  '辛': ['巨门化禄', '太阳化权', '文曲化科', '文昌化忌'],
  '壬': ['天梁化禄', '紫微化权', '左辅化科', '武曲化忌'],
  '癸': ['破军化禄', '巨门化权', '太阴化科', '贪狼化忌'],
}

function getDecadalMutagens(stem: string): string[] {
  return STEM_SIHUA[stem] || []
}

/* ------------------------------------------------------------
   格局检测（简化版）
   ------------------------------------------------------------ */

export function detectPatterns(chart: FunctionalAstrolabe): string[] {
  const patterns: string[] = []
  const palaces = chart.palaces || []
  const lifePalace = palaces.find(p => p.name === '命宫')
  if (!lifePalace) return patterns

  const lifeStars = (lifePalace.majorStars || []).map(star => String(star.name))
  const hasLifeStar = (name: string) => lifeStars.includes(name)

  if (hasLifeStar('紫微') && hasLifeStar('天府')) {
    patterns.push('紫府同宫：紫微与天府同坐命宫。此处仅确认同宫组合，不单凭这一项判定整体格局吉凶。')
  }

  if (hasLifeStar('紫微') && hasLifeStar('七杀')) {
    patterns.push('紫杀同宫：紫微与七杀同坐命宫。需结合三方四正、四化与星曜亮度进一步判断。')
  }

  // 机月同梁须在命宫三方（命、财帛、官禄）合看四星，
  // 不能仅凭命宫中任意出现两颗星就判定。
  const lifeIndex = lifePalace.index
  const lifeTrines = palaces.filter(p =>
    [0, 4, 8].includes((p.index - lifeIndex + 12) % 12)
  )
  const trineMajorStars = new Set(
    lifeTrines.flatMap(p => (p.majorStars || []).map(star => String(star.name)))
  )
  const jiYueTongLiang = ['天机', '太阴', '天同', '天梁']
  if (jiYueTongLiang.every(name => trineMajorStars.has(name))) {
    patterns.push('机月同梁：天机、太阴、天同、天梁齐见于命宫三方。此为组合提示，仍需结合各星所在宫位、亮度与四化复核。')
  }

  if (lifeStars.length === 0) {
    patterns.push('命宫无主星：当前命宫未见主星，需结合对宫及三方四正星曜一并观察。')
  }

  for (const star of lifePalace.majorStars || []) {
    if (String(star.mutagen) === '化忌') {
      patterns.push(`${star.name}化忌入命：记录本命化忌星曜落在命宫；具体含义需结合星曜性质与全盘结构解读。`)
    }
  }

  return patterns
}

/* ------------------------------------------------------------
   生成 AI 提示词上下文
   ------------------------------------------------------------ */

export function buildPromptContext(context: KnowledgeContext): string {
  const lines: string[] = []

  lines.push('【命盘完整信息】')
  lines.push('')

  // 命宫主星
  if (context.命宫主星.length > 0) {
    lines.push('## 命宫主星')
    for (const star of context.命宫主星) {
      lines.push(`- ${star.name}（${star.group}）：${star.description}`)
    }
    lines.push('')
  }

  // 身宫信息
  if (context.身宫位置) {
    lines.push('## 身宫位置')
    lines.push(`- 身宫在${context.身宫位置}`)
    if (context.身宫主星.length > 0) {
      for (const star of context.身宫主星) {
        lines.push(`- ${star.name}：${star.description}`)
      }
    }
    lines.push('')
  }

  // 完整十二宫信息
  lines.push('## 十二宫星曜分布')
  lines.push('')

  for (const palace of context.十二宫) {
    const palaceLabel = palace.isBodyPalace ? `${palace.name}【身宫】` : palace.name

    // 主星
    const majorStarsStr = palace.majorStars.length > 0
      ? palace.majorStars.map(s => {
          let str = s.name
          if (s.brightness) str += `(${s.brightness})`
          if (s.mutagen) str += `[${s.mutagen}]`
          return str
        }).join('、')
      : '无主星（借对宫星曜）'

    // 辅星
    const minorStarsStr = palace.minorStars.length > 0
      ? palace.minorStars.map(s => {
          let str = s.name
          if (s.mutagen) str += `[${s.mutagen}]`
          return str
        }).join('、')
      : ''

    // 杂曜（简化显示）
    const adjectiveStr = palace.adjectiveStars.length > 0
      ? palace.adjectiveStars.join('、')
      : ''

    // 大限范围
    const decadalStr = palace.decadalRange ? `大限${palace.decadalRange}岁` : ''

    lines.push(`### ${palaceLabel}${decadalStr ? ` (${decadalStr})` : ''}`)
    lines.push(`- 宫干：${palace.stem}`)
    lines.push(`- 主星：${majorStarsStr}`)
    if (minorStarsStr) lines.push(`- 辅星：${minorStarsStr}`)
    if (adjectiveStr) lines.push(`- 杂曜：${adjectiveStr}`)
    lines.push('')
  }

  // 各宫三方四正
  if (context.三方四正.length > 0) {
    lines.push('## 十二宫三方四正关系')
    lines.push('（每组列出本宫与两个三合宫，并单独列出对宫；不可将三合宫误写成对宫。）')
    for (const relation of context.三方四正) {
      const trines = relation.trinePalaces.map((palace) =>
        `${palace.name}：${palace.majorStars.join('、') || '无主星'}`
      ).join('；')
      const opposite = relation.oppositePalace
        ? `${relation.oppositePalace.name}：${relation.oppositePalace.majorStars.join('、') || '无主星'}`
        : '未取得对宫资料'
      lines.push(`- ${relation.palace}三方：${trines}；对宫：${opposite}`)
    }
    lines.push('')
  }

  // 宫干飞化落点
  if (context.宫干飞化.length > 0) {
    lines.push('## 十二宫宫干飞化落点')
    lines.push('（按当前项目宫干四化表推演；落点未找到时明确标记，不可自行补宫位。）')
    for (const item of context.宫干飞化) {
      lines.push(`- ${item.sourcePalace}（${item.sourceStem}干）${item.star}${item.transformation}飞入${item.targetPalace ?? '本盘未定位到该星落宫'}`)
    }
    lines.push('')
  }

  // 四化分布汇总
  if (context.四化分布.length > 0) {
    lines.push('## 本命四化分布')
    for (const item of context.四化分布) {
      lines.push(`- ${item.star}${item.sihua.name}入${item.palace}：${item.sihua.effect}`)
    }
    lines.push('')
  }

  // 大限信息
  if (context.大限.length > 0) {
    lines.push('## 十二大限')
    lines.push('（每个大限10年，按宫位天干飞化）')
    lines.push('')
    for (const d of context.大限) {
      lines.push(`### ${d.ageRange}岁：${d.palaceName}`)
      lines.push(`- 大限天干：${d.stem}`)
      lines.push(`- 大限四化：${d.mutagens.join('、')}`)
      lines.push('')
    }
  }

  // 流年信息
  if (context.流年.length > 0) {
    lines.push('## 近年流年信息')
    lines.push('')
    for (const y of context.流年) {
      lines.push(`- ${y.year}年（${y.stem}${y.branch}）：流年命宫在${y.palaceName}，四化：${y.mutagens.join('、')}`)
    }
    lines.push('')
  }

  // 格局提示
  if (context.格局提示.length > 0) {
    lines.push('## 格局提示')
    for (const pattern of context.格局提示) {
      lines.push(`- ${pattern}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

/* ------------------------------------------------------------
   导出知识库模块
   ------------------------------------------------------------ */

export * from './stars/majorStars'
export * from './palaces'
export * from './sihua'
