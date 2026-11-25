/**
 * Build a local calendar date without parsing an ISO date-only string as UTC.
 * Noon avoids crossing the intended calendar day in ordinary timezone offsets.
 */
export function createLocalCalendarDate(year: number, month: number, day: number): Date {
  const date = new Date(0)
  date.setFullYear(year, month - 1, day)
  date.setHours(12, 0, 0, 0)
  return date
}

/**
 * Resolve the natal palace occupying a named palace position in a given horoscope scope.
 *
 * iztro stores horoscope palace names by natal palace index. The palace's own
 * `name` remains its natal name, so yearly labels must be resolved through the
 * scope's `palaceNames` array rather than by searching the natal name directly.
 */
export function findPalaceForHoroscopeName<T extends { index: number }>(
  palaces: T[],
  horoscopePalaceNames: string[],
  horoscopePalaceName: string,
): T | undefined {
  const palaceIndex = horoscopePalaceNames.indexOf(horoscopePalaceName)

  if (palaceIndex < 0) return undefined

  return palaces.find((palace) => palace.index === palaceIndex)
}
