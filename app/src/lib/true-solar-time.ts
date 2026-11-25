/**
 * [INPUT]: Depends on birth date, selected shichen, and birthplace text
 * [OUTPUT]: Provides birthplace matching and true-solar-time birth resolution
 * [POS]: Domain helper between BirthForm input and iztro chart generation
 * [PROTOCOL]: Update this header when changed, then check AGENTS.md/CLAUDE.md
 */

export interface Birthplace {
  name: string
  province?: string
  city?: string
  area?: string
  longitude: number
  latitude?: number
}

export interface ResolveBirthTimeInput {
  year: number
  month: number
  day: number
  hour: number
  birthplace?: string
  enabled: boolean
}

export interface ResolveBirthTimeWithDataInput extends ResolveBirthTimeInput {
  birthplaces?: Birthplace[]
}

export interface ResolvedBirthTime {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  timeIndex: number
  originalShichen: string
  correctedShichen: string
  correctionMinutes: number
  applied: boolean
  crossedDate: boolean
  location: Birthplace | null
}

const BEIJING_STANDARD_LONGITUDE = 120
const MINUTES_PER_LONGITUDE_DEGREE = 4
const REPRESENTATIVE_MINUTE = 0

const SHICHEN_NAMES = [
  '子时',
  '丑时',
  '寅时',
  '卯时',
  '辰时',
  '巳时',
  '午时',
  '未时',
  '申时',
  '酉时',
  '戌时',
  '亥时',
] as const

export function findBirthplace(input?: string): Birthplace | null {
  return findBirthplaceInData(input, [])
}

export async function findBirthplaceAsync(input?: string): Promise<Birthplace | null> {
  const birthplaces = await loadBirthplaceData()
  return findBirthplaceInData(input, birthplaces)
}

export function findBirthplaceInData(input: string | undefined, birthplaces: Birthplace[]): Birthplace | null {
  const normalized = normalizePlace(input)
  if (!normalized) return null

  const ranked = birthplaces
    .map((place) => ({ place, score: scoreBirthplaceMatch(normalized, place) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)

  return ranked[0]?.place ?? null
}

export async function resolveBirthTimeAsync(input: ResolveBirthTimeInput): Promise<ResolvedBirthTime> {
  const birthplaces = await loadBirthplaceData()
  return resolveBirthTime({ ...input, birthplaces })
}

export function resolveBirthTime(input: ResolveBirthTimeWithDataInput): ResolvedBirthTime {
  const originalTimeIndex = hourToTimeIndex(input.hour)
  const originalShichen = shichenNameForTimeIndex(originalTimeIndex)
  const location = findBirthplaceInData(input.birthplace, input.birthplaces ?? [])
  const shouldApply = input.enabled && location !== null

  // Birth input is a wall-clock time, not a timestamp in the browser's timezone.
  // Use UTC calendar arithmetic so DST and the viewer's timezone cannot shift the chart.
  const baseDate = createUtcCalendarDate(input.year, input.month, input.day, input.hour)
  const correctionMinutes = shouldApply
    ? getTrueSolarCorrectionMinutes(input.year, input.month, input.day, location.longitude)
    : 0
  const correctedDate = new Date(baseDate.getTime() + correctionMinutes * 60_000)
  const timeIndex = shouldApply
    ? dateToTimeIndex(correctedDate)
    : originalTimeIndex
  const correctedShichen = shichenNameForTimeIndex(timeIndex)

  return {
    year: correctedDate.getUTCFullYear(),
    month: correctedDate.getUTCMonth() + 1,
    day: correctedDate.getUTCDate(),
    hour: correctedDate.getUTCHours(),
    minute: correctedDate.getUTCMinutes(),
    timeIndex,
    originalShichen,
    correctedShichen,
    correctionMinutes: Math.round(correctionMinutes),
    applied: shouldApply,
    crossedDate: isDifferentDate(input, correctedDate),
    location,
  }
}

async function loadBirthplaceData(): Promise<Birthplace[]> {
  const mod = await import('./birthplace-data.json')
  return mod.default as Birthplace[]
}

export function shichenNameForTimeIndex(timeIndex: number): string {
  if (timeIndex === 12) return SHICHEN_NAMES[0]
  return SHICHEN_NAMES[timeIndex] ?? ''
}

function normalizePlace(input?: string): string {
  return (input ?? '').trim().replace(/\s+/g, '')
}

function scoreBirthplaceMatch(input: string, place: Birthplace): number {
  const fullTokens = [
    joinPlace(place.province, place.city, place.area),
    joinPlace(place.province, place.city),
    joinPlace(place.city, place.area),
  ].filter((token): token is string => !!token).map(normalizePlace)
  const localTokens = [place.name, place.area, place.city]
    .filter((token): token is string => !!token)
    .map(normalizePlace)
  const tokens = getPlaceTokens(place)

  if (tokens.some((token) => token === input)) return 100
  if (fullTokens.some((token) => equalsWithoutAdministrativeSuffix(input, token))) return 95
  if (localTokens.some((token) => equalsWithoutAdministrativeSuffix(input, token))) return 90
  if (fullTokens.some((token) => isSpecificToken(token) && input.includes(token))) return 85
  if (localTokens.some((token) => isSpecificToken(token) && input.includes(token))) return 80
  if (localTokens.some((token) => {
    const stripped = stripAdministrativeSuffix(token)
    return isSpecificToken(stripped) && input.includes(stripped)
  })) return 60
  return 0
}

function getPlaceTokens(place: Birthplace): string[] {
  const rawTokens = [
    place.name,
    place.province,
    place.city,
    place.area,
    joinPlace(place.province, place.city),
    joinPlace(place.city, place.area),
    joinPlace(place.province, place.city, place.area),
  ]

  return Array.from(new Set(rawTokens.filter((token): token is string => !!token).map(normalizePlace)))
}

function joinPlace(...parts: Array<string | undefined>): string | undefined {
  const value = parts.filter(Boolean).join('')
  return value || undefined
}

function stripAdministrativeSuffix(value: string): string {
  return value.replace(/(特别行政区|自治州|地区|盟|市|县|区|省)$/u, '')
}

function equalsWithoutAdministrativeSuffix(left: string, right: string): boolean {
  const normalizedLeft = stripAdministrativeSuffix(left)
  const normalizedRight = stripAdministrativeSuffix(right)

  return isSpecificToken(normalizedLeft) && normalizedLeft === normalizedRight
}

function isSpecificToken(value: string): boolean {
  return value.length >= 2
}

function getTrueSolarCorrectionMinutes(year: number, month: number, day: number, longitude: number): number {
  const longitudeCorrection = (longitude - BEIJING_STANDARD_LONGITUDE) * MINUTES_PER_LONGITUDE_DEGREE
  return longitudeCorrection + getEquationOfTimeMinutes(year, month, day)
}

function getEquationOfTimeMinutes(year: number, month: number, day: number): number {
  const date = createUtcCalendarDate(year, month, day)
  const start = createUtcCalendarDate(year, 1, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000)
  const b = (2 * Math.PI * (dayOfYear - 81)) / 364

  return 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
}

function validateBirthDateTime(input: ResolveBirthTimeInput): void {
  if (!Number.isInteger(input.year) || input.year < 1 || input.year > 9999) {
    throw new RangeError('Birth year must be an integer between 1 and 9999.')
  }
  if (!Number.isInteger(input.month) || input.month < 1 || input.month > 12) {
    throw new RangeError('Birth month must be an integer between 1 and 12.')
  }
  if (!Number.isInteger(input.day) || input.day < 1) {
    throw new RangeError('Birth day must be a positive integer.')
  }
  if (!Number.isInteger(input.hour) || input.hour < 0 || input.hour > 23) {
    throw new RangeError('Birth hour must be an integer between 0 and 23.')
  }

  const lastDay = createUtcCalendarDate(input.year, input.month + 1, 0).getUTCDate()
  if (input.day > lastDay) {
    throw new RangeError(`Birth day must be between 1 and ${lastDay} for the selected month.`)
  }
}

function createUtcCalendarDate(year: number, month: number, day: number, hour = 0): Date {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, REPRESENTATIVE_MINUTE, 0, 0)
  return date
}

function hourToTimeIndex(hour: number): number {
  if (hour === 23) return 12
  if (hour >= 0 && hour < 1) return 0
  return Math.floor((hour + 1) / 2)
}

function dateToTimeIndex(date: Date): number {
  const hour = date.getUTCHours()
  if (hour === 23) return 12
  if (hour === 0) return 0
  return Math.floor((hour + 1) / 2)
}

function isDifferentDate(input: ResolveBirthTimeInput, date: Date): boolean {
  return (
    input.year !== date.getUTCFullYear()
    || input.month !== date.getUTCMonth() + 1
    || input.day !== date.getUTCDate()
  )
}
