/* ============================================================
   命盘可视化组件
   对齐文墨天机标准：
   - 完整星曜 + 亮度（庙旺平陷）
   - 宫干 + 大限范围
   - 博士/长生十二神 + 杂曜
   - 命主/身主 + 纳音五行
   ============================================================ */

import { useState } from 'react'
import { useChartStore } from '@/stores'
import type { BirthInfo, FunctionalAstrolabe } from '@/lib/astro'

/* ------------------------------------------------------------
   十二宫位置映射
   ------------------------------------------------------------ */

const PALACE_POSITIONS: Record<string, { row: number; col: number }> = {
  '巳': { row: 0, col: 0 }, '午': { row: 0, col: 1 },
  '未': { row: 0, col: 2 }, '申': { row: 0, col: 3 },
  '辰': { row: 1, col: 0 }, '酉': { row: 1, col: 3 },
  '卯': { row: 2, col: 0 }, '戌': { row: 2, col: 3 },
  '寅': { row: 3, col: 0 }, '丑': { row: 3, col: 1 },
  '子': { row: 3, col: 2 }, '亥': { row: 3, col: 3 },
}

/* ------------------------------------------------------------
   纳音五行表（六十甲子）
   ------------------------------------------------------------ */

const NAYIN_TABLE: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
}

function getNayin(ganZhi: string): string {
  return NAYIN_TABLE[ganZhi] || ''
}

/* ------------------------------------------------------------
   亮度映射
   ------------------------------------------------------------ */

const BRIGHTNESS_MAP: Record<string, string> = {
  '庙': '庙', '旺': '旺', '得': '得', '利': '利',
  '平': '平', '不': '不', '陷': '陷',
}

const BRIGHTNESS_STYLE: Record<string, string> = {
  '庙': 'text-fortune',
  '旺': 'text-gold',
  '得': 'text-[#8a7653]',
  '利': 'text-[#92784e]',
  '平': 'text-slate-500',
  '不': 'text-rose-700/70',
  '陷': 'text-misfortune',
}

/* ------------------------------------------------------------
   数据类型
   ------------------------------------------------------------ */

interface StarData {
  name: string
  brightness?: string
  mutagen?: string
}

interface PalaceData {
  name: string
  stem: string
  branch: string
  majorStars: StarData[]
  minorStars: StarData[]
  adjectiveStars: string[]  // 杂曜
  decadal: { range: [number, number] }
  boshi12: string
  changsheng12: string
  isLife: boolean
  isBody: boolean
}

/* ------------------------------------------------------------
   星曜标签组件 - 带亮度和四化
   ------------------------------------------------------------ */

interface StarTagProps {
  star: StarData
  showBrightness?: boolean
}

function StarTag({ star, showBrightness = true }: StarTagProps) {
  const { name, brightness, mutagen } = star
  const hasMutagen = !!mutagen
  const brightnessChar = brightness ? BRIGHTNESS_MAP[brightness] || '' : ''
  const brightnessStyle = brightness ? BRIGHTNESS_STYLE[brightness] || '' : ''

  const mutagenStyle = {
    '禄': 'bg-gradient-to-r from-fortune/20 to-fortune/10 text-fortune',
    '权': 'bg-gradient-to-r from-gold/20 to-gold/10 text-gold',
    '科': 'bg-gradient-to-r from-star/20 to-star/10 text-[#92784e]',
    '忌': 'bg-gradient-to-r from-misfortune/20 to-misfortune/10 text-misfortune',
  }[mutagen || ''] || ''

  return (
    <span
      className={`
        inline-flex items-center gap-0.5 text-[11px] px-1 py-0.5 rounded
        transition-all duration-200
        ${hasMutagen ? mutagenStyle + ' font-medium' : 'bg-slate-100 text-slate-700 hover:bg-violet-50'}
      `}
    >
      {name}
      {showBrightness && brightnessChar && (
        <span className={`text-[9px] ${brightnessStyle}`}>{brightnessChar}</span>
      )}
      {mutagen && <span className="text-[9px]">{mutagen}</span>}
    </span>
  )
}

/* ------------------------------------------------------------
   宫位卡片组件
   ------------------------------------------------------------ */

interface PalaceCardProps extends PalaceData {
  isSelected?: boolean
  onClick?: () => void
}

function PalaceCard({
  name, stem, branch, majorStars, minorStars, adjectiveStars, decadal,
  boshi12, changsheng12, isLife, isBody, isSelected, onClick
}: PalaceCardProps) {
  const decadalRange = decadal?.range ? `${decadal.range[0]}-${decadal.range[1]}` : ''

  return (
    <div
      onClick={onClick}
      className={`
        group relative p-2 lg:p-3 h-full min-h-[130px] lg:min-h-[170px] flex flex-col
        bg-white border border-slate-200 rounded-xl shadow-sm
        transition-all duration-300 cursor-pointer
        hover:bg-[#f8f6f1] hover:border-[#d9cfbb]
        ${isLife ? 'ring-1 ring-amber-300 bg-amber-50/70' : ''}
        ${isBody ? 'ring-1 ring-[#d9cfbb] bg-[#f8f6f1]' : ''}
        ${isSelected ? 'ring-2 ring-star' : ''}
      `}
    >
      {/* 宫位头部: 宫干支 + 宫名 + 大限 */}
      <div className="flex items-center justify-between mb-1.5 text-[10px]">
        <span className="text-text-muted font-mono">{stem}{branch}</span>
        <div className="flex items-center gap-1">
          {decadalRange && (
            <span className="text-violet-600 font-mono">{decadalRange}</span>
          )}
          <span className={`
            px-1 py-0.5 rounded font-medium
            ${isLife ? 'bg-amber-100 text-amber-800' : ''}
            ${isBody ? 'bg-[#f5f0e5] text-[#6f5d3c]' : ''}
            ${!isLife && !isBody ? 'text-slate-700' : ''}
          `}>
            {name}
          </span>
        </div>
      </div>

      {/* 主星 */}
      <div className="flex flex-wrap gap-0.5 mb-1">
        {majorStars.map((star, i) => (
          <StarTag key={i} star={star} />
        ))}
      </div>

      {/* 辅星 */}
      <div className="flex flex-wrap gap-0.5 mb-1">
        {minorStars.map((star, i) => (
          <StarTag key={i} star={star} showBrightness={false} />
        ))}
      </div>

      {/* 杂曜 */}
      {adjectiveStars.length > 0 && (
        <div className="flex flex-wrap gap-0.5 mb-1 flex-1">
          {adjectiveStars.map((name, i) => (
            <span key={i} className="text-[9px] px-1 py-0.5 rounded bg-slate-100 text-slate-500">
              {name}
            </span>
          ))}
        </div>
      )}

      {/* 底部: 十二神 */}
      <div className="flex justify-between text-[9px] text-text-muted/60 mt-auto pt-1 border-t border-slate-200">
        <span>{changsheng12}</span>
        <span>{boshi12}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------
   中央信息区域
   ------------------------------------------------------------ */

interface CenterInfoProps {
  chart: FunctionalAstrolabe
  solarDate: string
  gender: string
  birthInfo: BirthInfo
}

function CenterInfo({ chart, solarDate, gender, birthInfo }: CenterInfoProps) {
  // 计算年柱纳音
  const yearGanZhi = chart.chineseDate?.split(' ')[0] || ''
  const nayin = getNayin(yearGanZhi)
  const resolvedTime = birthInfo.resolvedBirthTime
  const showCorrection = birthInfo.trueSolarEnabled && resolvedTime?.applied
  const showUnmatched = birthInfo.trueSolarEnabled && birthInfo.birthplace && !resolvedTime?.applied

  return (
    <div className="
      relative h-full min-h-[280px] lg:min-h-[360px] p-3 lg:p-4
      flex flex-col items-center justify-center
      bg-white
      bg-white border border-slate-200 shadow-sm rounded-xl
    ">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white" />
      </div>

      {/* 标题 */}
      <h3 className="
        text-lg lg:text-xl font-semibold mb-3
        text-[#8a7653]
      " style={{ fontFamily: 'var(--font-serif)' }}>
        紫微斗数命盘
      </h3>

      {/* 信息列表 */}
      <div className="text-xs lg:text-sm text-text-secondary space-y-1.5 text-center">
        <p><span className="text-text-muted">原始阳历</span> <span className="text-text">{solarDate} {formatTime(birthInfo.hour, birthInfo.minute ?? 0)}</span></p>
        <p><span className="text-text-muted">农历</span> <span className="text-text">{chart.lunarDate}</span></p>
        <p><span className="text-text-muted">干支</span> <span className="text-text font-mono">{chart.chineseDate}</span></p>
        <p><span className="text-text-muted">最终时辰</span> <span className="text-text">{chart.time} {chart.timeRange}</span></p>
        {showCorrection && resolvedTime && (
          <details className="w-full text-left rounded-lg border border-slate-200 bg-[#faf9f7] px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-[#806b45]">查看出生时间校正详情</summary>
            <div className="mt-2 space-y-1.5 text-[11px] text-text-secondary">
              <p>出生地：{resolvedTime.location?.name}</p>
              <p>时区：{resolvedTime.timeZone}（按出生日期的当地时区规则）</p>
              <p>原始时间：{solarDate} {formatTime(birthInfo.hour, birthInfo.minute ?? 0)}</p>
              <p>时区实际偏移：{formatUtcOffset(resolvedTime.utcOffsetMinutes ?? 480)}</p>
              {resolvedTime.dstAdjustmentMinutes !== 0 && (
                <p>相对本年标准偏移：{formatSignedMinutes(resolvedTime.dstAdjustmentMinutes)} 分钟（已计入当地时区修正）</p>
              )}
              {resolvedTime.ambiguousLocalTime && (
                <p className="text-amber-700">该时刻在夏令时回拨时段出现两次，系统按第一次出现的时间计算</p>
              )}
              <p>经度与当地时区修正：{formatSignedMinutes(resolvedTime.longitudeCorrectionMinutes)} 分钟</p>
              <p>均时差：{formatSignedMinutes(resolvedTime.equationOfTimeMinutes)} 分钟</p>
              <p>总校正：{formatSignedMinutes(resolvedTime.correctionMinutes)} 分钟</p>
              <p>校正后时间：{formatResolvedDateTime(resolvedTime.year, resolvedTime.month, resolvedTime.day, resolvedTime.hour, resolvedTime.minute)}</p>
              <p>时辰变化：{resolvedTime.originalShichen} → {resolvedTime.correctedShichen}</p>
              {resolvedTime.crossedDate && <p className="text-amber-700">校正跨越了民用日期边界，排盘采用校正后的日期</p>}
              <p className="text-text-muted">说明：时区规则来自 IANA 时区数据库；1970 年以前部分地区的历史民用时间记录可能不完整，早年出生时间需结合当地历史资料核对</p>
            </div>
          </details>
        )}
        {showUnmatched && (
          <p>
            <span className="text-text-muted">真太阳时</span>{' '}
            <span className="text-text-muted">出生地未匹配或坐标无效，未执行校正</span>
          </p>
        )}
        {!birthInfo.trueSolarEnabled && (
          <p><span className="text-text-muted">时间校正</span> <span className="text-text-muted">已关闭，按原始出生时间排盘</span></p>
        )}
        <p><span className="text-text-muted">性别</span> <span className="text-text">{gender}</span></p>
        {nayin && (
          <p><span className="text-text-muted">纳音</span> <span className="text-gold">{nayin}</span></p>
        )}
      </div>

      {/* 五行局 + 命主身主 */}
      <div className="mt-3 pt-3 border-t border-slate-200 w-full">
        <div className="flex justify-center gap-2 mb-2">
          <span className="
            px-2 py-0.5 rounded-full text-xs
            bg-gradient-to-r from-star/20 to-gold/20
            text-[#92784e] font-medium border border-star/20
          ">
            {chart.fiveElementsClass}
          </span>
        </div>
        <div className="flex justify-center gap-4 text-xs">
          <p><span className="text-text-muted">命主</span> <span className="text-gold">{chart.soul}</span></p>
          <p><span className="text-text-muted">身主</span> <span className="text-[#92784e]">{chart.body}</span></p>
        </div>
        <div className="flex justify-center gap-4 text-xs mt-1">
          <p><span className="text-text-muted">生肖</span> <span className="text-text">{chart.zodiac}</span></p>
          <p><span className="text-text-muted">星座</span> <span className="text-text">{chart.sign}</span></p>
        </div>
      </div>
    </div>
  )
}

function formatTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function formatSignedMinutes(minutes: number): string {
  return `${minutes > 0 ? '+' : ''}${minutes}`
}

function formatUtcOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '-'
  const absolute = Math.abs(minutes)
  return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`
}

function formatResolvedDateTime(year: number, month: number, day: number, hour: number, minute: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${formatTime(hour, minute)}`
}

/* ------------------------------------------------------------
   解析命盘数据 - 完整版
   ------------------------------------------------------------ */

function parsePalaces(chart: FunctionalAstrolabe): PalaceData[] {
  return (chart.palaces || []).map((palace) => {
    // 主星（带亮度和四化）
    const majorStars: StarData[] = (palace.majorStars || []).map((s) => ({
      name: s.name as string,
      brightness: s.brightness as string | undefined,
      mutagen: s.mutagen as string | undefined,
    }))

    // 辅星（完整，带亮度）
    const minorStars: StarData[] = (palace.minorStars || []).map((s) => ({
      name: s.name as string,
      brightness: s.brightness as string | undefined,
      mutagen: s.mutagen as string | undefined,
    }))

    // 杂曜
    const adjectiveStars: string[] = (palace.adjectiveStars || []).map(
      (s) => String(s.name)
    )

    return {
      name: palace.name as string,
      stem: palace.heavenlyStem as string,
      branch: palace.earthlyBranch as string,
      majorStars,
      minorStars,
      adjectiveStars,
      decadal: palace.decadal as { range: [number, number] },
      boshi12: palace.boshi12 as string || '',
      changsheng12: palace.changsheng12 as string || '',
      isLife: palace.name === '命宫',
      isBody: palace.isBodyPalace === true,
    }
  })
}

/* ------------------------------------------------------------
   主命盘组件
   ------------------------------------------------------------ */

export function ChartDisplay() {
  const { chart, birthInfo } = useChartStore()
  const [selectedPalace, setSelectedPalace] = useState<string | null>(null)

  if (!chart || !birthInfo) return null

  const palaceData = parsePalaces(chart)
  const grid: (PalaceData | null)[][] = Array(4).fill(null).map(() => Array(4).fill(null))

  palaceData.forEach((p) => {
    const pos = PALACE_POSITIONS[p.branch]
    if (pos) grid[pos.row][pos.col] = p
  })

  const solarDate = `${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日`
  const gender = birthInfo.gender === 'male' ? '男' : '女'

  const renderPalace = (palace: PalaceData | null, key: string) => {
    if (!palace) return <div key={key} />
    return (
      <PalaceCard
        key={key}
        {...palace}
        isSelected={selectedPalace === palace.name}
        onClick={() => setSelectedPalace(selectedPalace === palace.name ? null : palace.name)}
      />
    )
  }

  return (
    <div className="
      relative p-3 lg:p-6
      bg-gradient-to-br from-white/[0.04] to-transparent
      bg-white border border-slate-200 shadow-sm rounded-2xl
      shadow-sm
      max-w-6xl mx-auto
    ">
      {/* 顶部发光线 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px bg-gradient-to-r from-transparent via-star/50 to-transparent" />

      {/* 4x4 网格 */}
      <div className="grid grid-cols-4 gap-1.5 lg:gap-2">
        {/* Row 0 */}
        {grid[0].map((p, c) => renderPalace(p, `0-${c}`))}

        {/* Row 1: left + center(2x2) + right */}
        {renderPalace(grid[1][0], '1-0')}
        <div className="col-span-2 row-span-2">
          <CenterInfo chart={chart} solarDate={solarDate} gender={gender} birthInfo={birthInfo} />
        </div>
        {renderPalace(grid[1][3], '1-3')}

        {/* Row 2: left + right (center already spans) */}
        {renderPalace(grid[2][0], '2-0')}
        {renderPalace(grid[2][3], '2-3')}

        {/* Row 3 */}
        {grid[3].map((p, c) => renderPalace(p, `3-${c}`))}
      </div>

      {/* 图例 */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-200 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-gold" />
          <span className="text-text-muted">命宫</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-star-light" />
          <span className="text-text-muted">身宫</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-fortune">禄</span>
          <span className="text-gold">权</span>
          <span className="text-[#92784e]">科</span>
          <span className="text-misfortune">忌</span>
          <span className="text-text-muted">四化</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-fortune">庙</span>
          <span className="text-gold">旺</span>
          <span className="text-text-muted">平</span>
          <span className="text-misfortune">陷</span>
          <span className="text-text-muted">亮度</span>
        </div>
      </div>
    </div>
  )
}
