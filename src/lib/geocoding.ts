import { GeocodeLocation } from '../types';

/**
 * Searches for addresses, house numbers, streets, cities, and provinces using OpenStreetMap Nominatim.
 */
export async function searchAddress(query: string): Promise<GeocodeLocation[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const cleanQuery = query.trim();
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    cleanQuery
  )}&addressdetails=1&limit=6&accept-language=en`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding HTTP error: ${response.status}`);
    }

    const data: GeocodeLocation[] = await response.json();
    return data || [];
  } catch (err) {
    console.warn('Geocoding search failed:', err);
    return [];
  }
}
