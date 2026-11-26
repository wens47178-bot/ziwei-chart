# Global birthplace coverage

The birthplace resolver retains the existing China administrative-area dataset and adds a curated set of 153 major overseas cities across 91 countries and areas.

## Search

- Search by a city name in English or by the supplied Chinese alias.
- Add the country when a city name could be ambiguous, for example `New York, USA`.
- A country name by itself is intentionally not enough to select a birthplace: countries can contain multiple civil time zones.
- If no city is matched, true-solar correction is not applied. The app must not guess a timezone from the user's current location.

## Coordinates and time zones

Each overseas record contains a representative city-centre latitude/longitude and an IANA time-zone identifier. City-centre coordinates are approximations, not a claim to know the user's exact hospital, district, or village. The IANA identifier is used with the runtime's `Intl.DateTimeFormat` timezone data to resolve the local wall-clock offset for the entered date, including available daylight-saving transitions.

The correction is calculated from the city's longitude, the resolved local UTC offset, and the equation of time. It is not based on a fixed UTC+08:00 assumption. Both northern- and southern-hemisphere daylight-saving rules are covered by the IANA timezone identifier.

## Limits

- This is a curated major-city set, not a complete global gazetteer. Smaller towns, villages, and some territories are not yet included.
- City-centre coordinates can introduce a small longitude difference from the exact birthplace.
- Timezone data is supplied by the browser/runtime's IANA timezone implementation, which can differ by version.
- IANA notes that pre-1970 local-time histories are incomplete or not uniformly reliable across every location. For births before 1970, verify the historical civil time against local records before relying on a correction.
- If the place cannot be matched, the app leaves the entered civil time unchanged and clearly reports that no correction was applied.
