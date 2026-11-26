# Global birthplace coverage

The birthplace resolver retains the existing China administrative-area dataset and the curated 153-city overseas dataset. When a city is not found locally, it now falls back to the Geocoded worldwide city catalogue, which documents coverage of approximately 235,000 cities and towns across 252 countries and territories.

## Search

- Search by a city name; English and local-script names supported by the external catalogue can be used.
- Add the state/province and country when a city name could be ambiguous, for example `Springfield, Illinois, USA` or `New York, USA`.
- Every supplied administrative qualifier must match; a state match cannot accidentally substitute for a country match.
- Local and remote matches with equally strong but geographically distinct candidates are rejected instead of silently selecting the first result.
- The birth form waits briefly after typing before querying the remote catalogue, and shows the matched city, region, country, and IANA timezone.
- A country name by itself is intentionally not enough to select a birthplace: countries can contain multiple civil time zones.
- If multiple exact city matches exist in different countries or administrative regions and the input does not disambiguate them, the resolver refuses to choose arbitrarily.
- The locally curated China and overseas records are checked first. The external catalogue is queried only when no local record matches.
- If the external service is unavailable, the city is not found, or the returned record lacks valid coordinates or an IANA timezone, true-solar correction is not applied. The app must not guess a timezone from the user's current location.

## Coordinates and time zones

Each resolved record needs a representative latitude/longitude and an IANA time-zone identifier. The curated overseas records use representative city-centre coordinates. Remote records are obtained from Geocoded and include city coordinates and timezone data. City-centre coordinates are approximations, not a claim to know the user's exact hospital, district, or village. The IANA identifier is used with the runtime's `Intl.DateTimeFormat` timezone data to resolve the local wall-clock offset for the entered date, including available daylight-saving transitions.

The correction is calculated from the city's longitude, the resolved local UTC offset, and the equation of time. It is not based on a fixed UTC+08:00 assumption. Both northern- and southern-hemisphere daylight-saving rules are covered by the IANA timezone identifier.

## Data source and licence

- Worldwide city search: Geocoded API, `https://api.geocoded.me/v2`, no API key required. The provider documents approximately 235,000 cities and towns and identifies GeoNames and related public datasets as sources.
- Geocoded data is published under CC BY 4.0. Attribution: Geocoded, `https://geocoded.me/`.
- The external catalogue is a runtime dependency for cities not present in the curated local datasets. Search gracefully falls back to no match if the API is unavailable or rate-limited. The API implementation is open source under MIT; the underlying location data is published under CC BY 4.0, so attribution is retained here.

## Limits

- The worldwide catalogue is substantially broader than the curated 153-city list, but it is still a gazetteer of recorded cities and towns, not a guarantee that every village, neighbourhood, historical settlement, or unofficial locality is present.
- City-centre coordinates can differ from the exact birthplace.
- Timezone data is supplied by the provider and the browser/runtime's IANA timezone implementation, which can differ by version.
- IANA notes that pre-1970 local-time histories are incomplete or not uniformly reliable across every location. For births before 1970, verify the historical civil time against local records before relying on a correction.
- If the place cannot be matched or verified, the app leaves the entered civil time unchanged and clearly reports that no correction was applied.
