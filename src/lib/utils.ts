export const safeStringify = (obj: any): string => {
  const cache = new Set();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.has(value)) {
        return undefined;
      }
      cache.add(value);
    }
    return value;
  });
};

/**
 * Opens native map application (Google Maps, Apple Maps, etc.) on user's device with turn-by-turn navigation
 */
export const openNativeNavigation = (lat: number, lng: number) => {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(mapsUrl, '_blank', 'noopener,noreferrer');
};

