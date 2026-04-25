const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Mapowanie polskich statusów z GIOŚ na enumeracje wymagane przez UI
const mapGiosStatusToTheme = (status: string | null | undefined): string => {
  if (!status) return 'UNKNOWN';
  const normalized = status.toLowerCase();
  
  if (normalized.includes('dobry')) return 'GOOD'; // Łapie "Dobry" i "Bardzo dobry"
  if (normalized.includes('umiarkowany') || normalized.includes('dostateczny')) return 'MODERATE';
  if (normalized.includes('zły')) return 'POOR'; // Łapie "Zły" i "Bardzo zły"
  
  return 'UNKNOWN';
};

export const fetchAirQuality = async (city: string) => {
  try {
    const response = await fetch(`${API_URL}/air-quality/${encodeURIComponent(city)}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Nie znaleziono stacji pomiarowej dla miasta: ${city}`);
      }
      throw new Error(`Błąd serwera: ${response.status}`);
    }

    const backendData = await response.json();

    return {
      city: backendData.city,
      index: mapGiosStatusToTheme(backendData.overall_status),
      details: {
        pm10: backendData.pm10,
        pm25: backendData.pm25,
        no2: backendData.no2,
        o3: backendData.o3,
        so2: backendData.so2,
        co: backendData.co
      }
    };
  } catch (error) {
    console.error("API Fetch Error:", error);
    throw error;
  }
};