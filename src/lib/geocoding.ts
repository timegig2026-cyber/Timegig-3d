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

/**
 * Reverse geocodes latitude & longitude to a human-readable location address string.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=en`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding error: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.display_name) {
      const address = data.address;
      const house = address?.house_number;
      const road = address?.road;
      const suburb = address?.suburb || address?.neighbourhood;
      const city = address?.city || address?.town || address?.village;
      const province = address?.state || address?.province;

      const formatted = [house ? `${house} ${road}` : road, suburb, city, province]
        .filter(Boolean)
        .join(', ');

      return formatted || data.display_name.split(',').slice(0, 3).join(',');
    }
  } catch (err) {
    console.warn('Reverse geocoding failed:', err);
  }

  return `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
}
