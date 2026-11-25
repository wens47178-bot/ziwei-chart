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
