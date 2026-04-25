const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const fetchAirQuality = async (city: string) => {
  try {
    const response = await fetch(`${API_URL}/air-quality/${city}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Nie znaleziono stacji pomiarowej w tym mieście.');
      }
      throw new Error('Błąd serwera backendowego.');
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};