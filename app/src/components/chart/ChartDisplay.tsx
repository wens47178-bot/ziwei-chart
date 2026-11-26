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

interface StarTagProps { star: StarData; tone?: string }
function StarTag({ star, tone = 'text-[#2457a7]' }: StarTagProps) {
  const colors: Record<string,string> = { 禄: 'bg-[#27834a]', 权: 'bg-[#a52b24]', 科: 'bg-[#2457a7]', 忌: 'bg-[#c93636]' }
  return <span className="flex shrink-0 flex-col items-center leading-none">
    <span className={`font-semibold text-[12px] sm:text-[14px] ${tone}`} style={{writingMode:'vertical-rl', textOrientation:'upright'}}>{star.name}</span>
    {star.brightness && <span className="text-[9px] text-neutral-700">{BRIGHTNESS_MAP[star.brightness] || star.brightness}</span>}
    {star.mutagen && <span className={`mt-1 rounded px-0.5 py-0.5 text-[10px] text-white ${colors[star.mutagen] || 'bg-neutral-600'}`}>{star.mutagen}</span>}
  </span>
}

/* ------------------------------------------------------------
   宫位卡片组件
   ------------------------------------------------------------ */

interface PalaceCardProps extends PalaceData {
  isSelected?: boolean
  relation?: '三合' | '对宫'
  onClick?: () => void
}

function PalaceCard({
  name, stem, branch, majorStars, minorStars, adjectiveStars, decadal,
  boshi12, changsheng12, isLife, isBody, isSelected, relation, onClick
}: PalaceCardProps) {
  const decadalRange = decadal?.range ? `${decadal.range[0]}-${decadal.range[1]}` : ''

  return (
    <button type="button" onClick={onClick} aria-pressed={!!isSelected}
      className={`relative flex h-full min-h-[170px] sm:min-h-[205px] min-w-0 flex-col bg-white p-1.5 text-left hover:bg-neutral-50 ${relation ? 'bg-blue-50/70' : ''} ${isSelected ? 'ring-2 ring-inset ring-blue-500' : ''}`}>
      <div className="flex flex-wrap content-start items-start gap-x-[3px] gap-y-1">
        {majorStars.map((star,i) => <StarTag key={i} star={star} tone="text-[#ad3028]" />)}
        {minorStars.map((star,i) => <StarTag key={i} star={star} tone="text-[#6744a0]" />)}
        {adjectiveStars.map((name,i) => <StarTag key={i} star={{name}} />)}
      </div>
      {relation && <span className="mt-1 self-start rounded bg-blue-100 px-1 text-[10px] text-blue-800">{relation}</span>}
      <div className="mt-auto flex items-end justify-between gap-1 pt-3">
        <div className="flex flex-col text-[10px] leading-tight text-neutral-500"><span className="text-teal-700">{changsheng12}</span><span>{boshi12}</span></div>
        <div className="text-right leading-tight"><div className="text-[10px] text-neutral-500">{decadalRange}</div><div className="text-[12px] text-neutral-900">{stem}{branch}</div><div className={`text-[13px] font-semibold text-[#ad3028] ${isLife ? 'rounded border border-red-300 bg-red-50 px-1' : ''}`}>{name}{isBody ? '·身' : ''}</div></div>
      </div>
    </button>
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
  const pillars = (chart.chineseDate || '').trim().split(/\s+/).filter(Boolean)
  const polarity = '甲丙戊庚壬'.includes(yearGanZhi.charAt(0)) ? '阳' : '阴'
  const lifeBranch = chart.palaces.find(p => p.name === '命宫')?.earthlyBranch
  const bodyBranch = chart.palaces.find(p => p.isBodyPalace)?.earthlyBranch
  const resolvedTime = birthInfo.resolvedBirthTime
  const showCorrection = birthInfo.trueSolarEnabled && resolvedTime?.applied
  const showUnmatched = birthInfo.trueSolarEnabled && birthInfo.birthplace && !resolvedTime?.applied

  return (
    <div className="
      relative h-full min-h-[300px] p-2 sm:p-3 flex flex-col items-center justify-center bg-white
    ">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white" />
      </div>

      {/* 标题 */}
      <h3 className="
        text-lg lg:text-xl font-semibold mb-3
        text-neutral-900
      " style={{ fontFamily: 'var(--font-serif)' }}>
        天衍 · 紫微斗数
      </h3>

      <div className="mb-3 flex items-center gap-3 text-sm font-semibold text-neutral-800"><span>{yearGanZhi ? polarity : ''}{gender}</span><span>{chart.fiveElementsClass}</span></div>
      {pillars.length === 4 && <div className="mb-3 w-full border-y border-dashed border-neutral-200 py-2">
        <div className="grid grid-cols-4 text-center text-[10px] text-neutral-500">{['年柱','月柱','日柱','时柱'].map(label => <span key={label}>{label}</span>)}</div>
        <div className="grid grid-cols-4 text-center font-mono text-sm font-semibold">{pillars.map((pillar,i) => <div key={i}><div className="text-[#2457a7]">{pillar.charAt(0)}</div><div className="text-[#ad3028]">{pillar.slice(1)}</div></div>)}</div>
      </div>}
      {/* 信息列表 */}
      <div className="text-xs lg:text-sm text-text-secondary space-y-1.5 text-center">
        <p><span className="text-text-muted">原始阳历</span> <span className="text-text">{solarDate} {formatTime(birthInfo.hour, birthInfo.minute ?? 0)}</span></p>
        <p><span className="text-text-muted">农历</span> <span className="text-text">{chart.lunarDate}</span></p>
        {pillars.length !== 4 && <p><span className="text-text-muted">干支</span> <span className="text-text font-mono">{chart.chineseDate}</span></p>}
        <p><span className="text-text-muted">最终时辰</span> <span className="text-text">{chart.time} {chart.timeRange}</span></p>
        {showCorrection && resolvedTime && (
          <details className="w-full text-left rounded-lg border border-slate-200 bg-[#faf9f7] px-3 py-2">
            <summary className="cursor-pointer text-xs font-medium text-[#806b45]">查看出生时间校正详情</summary>
            <div className="mt-2 space-y-1.5 text-[11px] text-text-secondary">
              <p>出生地：{resolvedTime.location?.name}{resolvedTime.location?.country ? `，${resolvedTime.location.country}` : ''}</p>
              <p>时区：{resolvedTime.timeZone}（按出生日期的当地时区规则）</p>
              <p>原始时间：{solarDate} {formatTime(birthInfo.hour, birthInfo.minute ?? 0)}</p>
              <p>时区实际偏移：{formatUtcOffset(resolvedTime.utcOffsetMinutes ?? 480)}</p>
              {resolvedTime.dstAdjustmentMinutes !== 0 && (
                <p>相对本年最小 UTC 偏移：{formatSignedMinutes(resolvedTime.dstAdjustmentMinutes)} 分钟（仅作时差说明；校正使用上方实际偏移）</p>
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
        <p><span className="text-text-muted">命宫</span> {lifeBranch || "—"}　<span className="text-text-muted">身宫</span> {bodyBranch || "—"}</p>
        {nayin && (
          <p><span className="text-text-muted">纳音</span> <span className="text-gold">{nayin}</span></p>
        )}
      </div>

      {/* 五行局 + 命主身主 */}
      <div className="mt-3 pt-3 border-t border-slate-200 w-full">
        <div className="hidden">
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

  const branches = '子丑寅卯辰巳午未申酉戌亥'
  const selected = palaceData.find(p => p.name === selectedPalace)
  const selectedIndex = selected ? branches.indexOf(selected.branch) : -1
  const relationFor = (branch: string): '三合' | '对宫' | undefined => {
    const index = branches.indexOf(branch)
    if (selectedIndex < 0 || index < 0) return undefined
    const distance = (index - selectedIndex + 12) % 12
    return distance === 6 ? '对宫' : distance === 4 || distance === 8 ? '三合' : undefined
  }
  const renderPalace = (palace: PalaceData | null, key: string) => {
    if (!palace) return <div key={key} />
    return (
      <PalaceCard
        key={key}
        {...palace}
        isSelected={selectedPalace === palace.name}
        relation={relationFor(palace.branch)}
        onClick={() => setSelectedPalace(selectedPalace === palace.name ? null : palace.name)}
      />
    )
  }

  return (
    <div className="
      relative bg-white max-w-none mx-auto
    ">
      <div className="mb-1 grid grid-cols-4 text-center text-[10px] text-neutral-500"><span>南偏东</span><span>正南方</span><span>南偏西</span><span>西偏南</span></div>

      <div className="mb-2 flex items-center justify-between gap-2 text-xs text-neutral-600"><span>{selected ? `${selected.name} · 三方四正` : "点击任一宫位查看三方四正"}</span>{selected && <button type="button" onClick={() => setSelectedPalace(null)} className="text-blue-700">取消选择</button>}</div>
      <div className="overflow-x-auto">
      {/* 4x4 网格 */}
      <div className="grid min-w-[540px] grid-cols-4 auto-rows-fr gap-px overflow-hidden rounded-xl border border-neutral-300 bg-neutral-300">
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

      </div>
      <div className="mt-1 grid grid-cols-4 text-center text-[10px] text-neutral-500"><span>东偏北</span><span>北偏东</span><span>正北方</span><span>北偏西</span></div>
      {/* 图例 */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-3 pt-3 border-t border-slate-200 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#ad3028]" />
          <span className="text-text-muted">命宫</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#6744a0]" />
          <span className="text-text-muted">身宫</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#27834a]">禄</span>
          <span className="text-[#a52b24]">权</span>
          <span className="text-[#2457a7]">科</span>
          <span className="text-[#c93636]">忌</span>
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
