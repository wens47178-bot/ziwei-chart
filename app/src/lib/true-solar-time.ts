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
  timeZone?: string
  country?: string
  aliases?: string[]
}

export interface ResolveBirthTimeInput {
  year: number
  month: number
  day: number
  hour: number
  minute?: number
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
  longitudeCorrectionMinutes: number
  equationOfTimeMinutes: number
  timeZone: string | null
  utcOffsetMinutes: number | null
  dstAdjustmentMinutes: number
  ambiguousLocalTime: boolean
  applied: boolean
  crossedDate: boolean
  location: Birthplace | null
}

const MINUTES_PER_LONGITUDE_DEGREE = 4
const CHINA_TIME_ZONE = 'Asia/Shanghai'

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
  const localMatch = findBirthplaceInData(input, birthplaces)
  if (localMatch) return localMatch
  return findRemoteBirthplace(input)
}

export function findBirthplaceInData(input: string | undefined, birthplaces: Birthplace[]): Birthplace | null {
  const normalized = normalizePlace(input)
  if (!normalized) return null

  const ranked = birthplaces
    .filter((place) => isUsableCoordinate(place))
    .map((place) => ({ place, score: scoreBirthplaceMatch(normalized, place) }))
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => right.score - left.score)

  return ranked[0]?.place ?? null
}

export async function resolveBirthTimeAsync(input: ResolveBirthTimeInput): Promise<ResolvedBirthTime> {
  const birthplaces = await loadBirthplaceData()
  if (input.enabled && input.birthplace && !findBirthplaceInData(input.birthplace, birthplaces)) {
    const remoteMatch = await findRemoteBirthplace(input.birthplace)
    if (remoteMatch) birthplaces.push(remoteMatch)
  }
  return resolveBirthTime({ ...input, birthplaces })
}

export function resolveBirthTime(input: ResolveBirthTimeWithDataInput): ResolvedBirthTime {
  validateBirthDateTime(input)
  const originalTimeIndex = hourToTimeIndex(input.hour)
  const originalShichen = shichenNameForTimeIndex(originalTimeIndex)
  const location = findBirthplaceInData(input.birthplace, input.birthplaces ?? [])
  const timeZone = location?.timeZone ?? (location && !location.country ? CHINA_TIME_ZONE : null)
  // Birth input is a wall-clock time, not a timestamp in the browser's timezone.
  // Use UTC calendar arithmetic so DST and the viewer's timezone cannot shift the chart.
  const baseDate = createUtcCalendarDate(input.year, input.month, input.day, input.hour, input.minute ?? 0)
  const localClock = input.enabled && location && timeZone
    ? resolveLocalClockOffset(input, timeZone)
    : null
  const shouldApply = localClock !== null
  const standardOffsetMinutes = localClock && timeZone
    ? getStandardUtcOffsetMinutes(input.year, timeZone)
    : null
  const dstAdjustmentMinutes = localClock && standardOffsetMinutes !== null
    ? localClock.offsetMinutes - standardOffsetMinutes
    : 0
  const longitudeCorrectionMinutes = localClock && location
    ? location.longitude * MINUTES_PER_LONGITUDE_DEGREE - localClock.offsetMinutes
    : 0
  const equationOfTimeMinutes = localClock
    ? getEquationOfTimeMinutes(
      baseDate.getUTCFullYear(),
      baseDate.getUTCMonth() + 1,
      baseDate.getUTCDate(),
    )
    : 0
  const correctionMinutes = localClock
    ? longitudeCorrectionMinutes + equationOfTimeMinutes
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
    longitudeCorrectionMinutes: Math.round(longitudeCorrectionMinutes),
    equationOfTimeMinutes: Math.round(equationOfTimeMinutes),
    timeZone: localClock ? timeZone : null,
    utcOffsetMinutes: localClock ? Math.round(localClock.offsetMinutes) : null,
    dstAdjustmentMinutes: Math.round(dstAdjustmentMinutes),
    ambiguousLocalTime: localClock?.ambiguous ?? false,
    applied: shouldApply,
    crossedDate: isDifferentDate(input, correctedDate),
    location,
  }
}

const REMOTE_CITY_API = 'https://api.geocoded.me/v2'
const remoteBirthplaceCache = new Map<string, Birthplace | null>()
const remoteBirthplaceRequests = new Map<string, Promise<Birthplace | null>>()

interface RemoteCitySearchResult {
  type?: string
  name?: string
  countryCode?: string
  countryName?: string
  geonameId?: number | null
}

interface RemoteCityRecord {
  name?: string
  countryName?: string
  latitude?: string | number
  longitude?: string | number
  timezone?: string
}

async function findRemoteBirthplace(input?: string): Promise<Birthplace | null> {
  const normalizedInput = normalizePlace(input)
  if (!normalizedInput) return null
  if (remoteBirthplaceCache.has(normalizedInput)) return remoteBirthplaceCache.get(normalizedInput) ?? null
  const pending = remoteBirthplaceRequests.get(normalizedInput)
  if (pending) return pending

  const request = (async () => {
    try {
      const parts = (input ?? '').split(',').map((part) => part.trim()).filter(Boolean)
      const cityQuery = parts[0] ?? ''
      const countryQuery = parts.slice(1).join(' ')
      if (cityQuery.length < 2) return null

      const searchUrl = new URL(`${REMOTE_CITY_API}/search`)
      searchUrl.searchParams.set('q', cityQuery)
      searchUrl.searchParams.set('type', 'city')
      searchUrl.searchParams.set('limit', '20')
      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) return null
      const searchPayload = await searchResponse.json() as { data?: RemoteCitySearchResult[] }
      const matches = (searchPayload.data ?? []).filter((place) => place.type === 'city' && place.name && place.geonameId)
      const cityName = normalizePlace(cityQuery)
      const exactMatches = matches.filter((place) => normalizePlace(place.name) === cityName)
      const nameMatches = exactMatches.length > 0
        ? exactMatches
        : matches.filter((place) => normalizePlace(place.name).startsWith(cityName))
      const countryMatches = countryQuery
        ? nameMatches.filter((place) => countryMatchesQuery(place, countryQuery))
        : nameMatches
      const candidates = countryMatches.length > 0 ? countryMatches : countryQuery ? [] : nameMatches
      const distinctCountries = new Set(candidates.map((place) => place.countryCode ?? place.countryName))
      if (distinctCountries.size !== 1 || candidates.length === 0) return null

      const selected = candidates[0]
      const detailUrl = new URL(`${REMOTE_CITY_API}/cities/${selected.geonameId}`)
      const detailResponse = await fetch(detailUrl)
      if (!detailResponse.ok) return null
      const city = await detailResponse.json() as RemoteCityRecord
      if (!city.name || !city.timezone) return null
      const location: Birthplace = {
        name: city.name,
        city: city.name,
        country: city.countryName || selected.countryName,
        latitude: Number(city.latitude),
        longitude: Number(city.longitude),
        timeZone: city.timezone,
      }
      if (!isUsableCoordinate(location)) return null
      // Reject timezone identifiers unavailable in the current runtime rather than guessing.
      new Intl.DateTimeFormat('en-US', { timeZone: location.timeZone }).format(new Date(0))
      return location
    } catch {
      return null
    }
  })()

  remoteBirthplaceRequests.set(normalizedInput, request)
  try {
    const result = await request
    remoteBirthplaceCache.set(normalizedInput, result)
    return result
  } finally {
    remoteBirthplaceRequests.delete(normalizedInput)
  }
}

function countryMatchesQuery(place: RemoteCitySearchResult, query: string): boolean {
  const normalized = normalizePlace(query)
  const aliases: Record<string, string[]> = {
    usa: ['us', 'unitedstates'],
    america: ['us', 'unitedstates'],
    uk: ['gb', 'unitedkingdom'],
    britain: ['gb', 'unitedkingdom'],
    england: ['gb', 'unitedkingdom'],
    uae: ['ae', 'unitedarabemirates'],
  }
  const accepted = [normalized, ...(aliases[normalized] ?? [])]
  return accepted.includes(normalizePlace(place.countryCode))
    || accepted.includes(normalizePlace(place.countryName))
}

async function loadBirthplaceData(): Promise<Birthplace[]> {
  const [china, global] = await Promise.all([
    import('./birthplace-data.json'),
    import('./global-birthplace-data.json'),
  ])
  return [...china.default, ...global.default] as Birthplace[]
}

export function shichenNameForTimeIndex(timeIndex: number): string {
  if (timeIndex === 12) return SHICHEN_NAMES[0]
  return SHICHEN_NAMES[timeIndex] ?? ''
}

function normalizePlace(input?: string): string {
  return (input ?? '').trim().toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '')
}

function scoreBirthplaceMatch(input: string, place: Birthplace): number {
  const fullTokens = [
    joinPlace(place.province, place.city, place.area),
    joinPlace(place.province, place.city),
    joinPlace(place.city, place.area),
    joinPlace(place.city, place.country),
    joinPlace(place.country, place.city),
  ].filter((token): token is string => !!token).map(normalizePlace)
  const localTokens = [place.name, place.area, place.city, ...(place.aliases ?? [])]
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
    ...(place.aliases ?? []),
    joinPlace(place.province, place.city),
    joinPlace(place.city, place.area),
    joinPlace(place.province, place.city, place.area),
    joinPlace(place.city, place.country),
    joinPlace(place.country, place.city),
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

function isUsableCoordinate(place: Birthplace): boolean {
  return Number.isFinite(place.longitude)
    && place.longitude >= -180
    && place.longitude <= 180
    && Number.isFinite(place.latitude)
    && (place.latitude ?? 0) >= -90
    && (place.latitude ?? 0) <= 90
    && !(place.longitude === 0 && place.latitude === 0)
}

function resolveLocalClockOffset(
  input: ResolveBirthTimeInput,
  timeZone: string,
): { offsetMinutes: number; ambiguous: boolean } {
  const wallClockUtc = createUtcCalendarDate(
    input.year,
    input.month,
    input.day,
    input.hour,
    input.minute ?? 0,
  ).getTime()
  const offsets = new Set<number>()

  // Sample a wide window to collect both sides of a historical DST transition.
  for (let hours = -36; hours <= 36; hours += 3) {
    offsets.add(getUtcOffsetMinutes(new Date(wallClockUtc + hours * 3_600_000), timeZone))
  }

  const candidates = Array.from(offsets)
    .map((offsetMinutes) => ({
      offsetMinutes,
      utcTime: wallClockUtc - offsetMinutes * 60_000,
    }))
    .filter(({ utcTime }) => matchesWallClock(new Date(utcTime), input, timeZone))
    .sort((left, right) => left.utcTime - right.utcTime)

  if (candidates.length === 0) {
    throw new RangeError('The entered local birth time does not exist because the local clock moved forward.')
  }

  // If clocks moved back and the time occurred twice, use the first occurrence and expose the ambiguity.
  return {
    offsetMinutes: candidates[0].offsetMinutes,
    ambiguous: candidates.length > 1,
  }
}

function getStandardUtcOffsetMinutes(year: number, timeZone: string): number {
  const offsets = Array.from({ length: 12 }, (_, index) =>
    getUtcOffsetMinutes(createUtcCalendarDate(year, index + 1, 15, 12), timeZone),
  )
  // Used only to explain the seasonal offset; the correction itself uses the exact offset
  // resolved for the entered wall-clock time, including political offset changes.
  return Math.min(...offsets)
}

function getUtcOffsetMinutes(date: Date, timeZone: string): number {
  const value = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  }).formatToParts(date).find((part) => part.type === 'timeZoneName')?.value
  const match = /^GMT(?:(\+|-)(\d{2}):(\d{2})(?::(\d{2}))?)?$/.exec(value ?? '')
  if (!match) throw new RangeError(`Unable to resolve the historical UTC offset for ${timeZone}.`)
  if (!match[1]) return 0
  const sign = match[1] === '+' ? 1 : -1
  return sign * (Number(match[2]) * 60 + Number(match[3]) + Number(match[4] ?? 0) / 60)
}

function matchesWallClock(date: Date, input: ResolveBirthTimeInput, timeZone: string): boolean {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))
  return Number(values.year) === input.year
    && Number(values.month) === input.month
    && Number(values.day) === input.day
    && Number(values.hour) === input.hour
    && Number(values.minute) === (input.minute ?? 0)
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
  const minute = input.minute ?? 0
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
    throw new RangeError('Birth minute must be an integer between 0 and 59.')
  }

  const lastDay = createUtcCalendarDate(input.year, input.month + 1, 0).getUTCDate()
  if (input.day > lastDay) {
    throw new RangeError(`Birth day must be between 1 and ${lastDay} for the selected month.`)
  }
}

function createUtcCalendarDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  const date = new Date(0)
  date.setUTCFullYear(year, month - 1, day)
  date.setUTCHours(hour, minute, 0, 0)
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
