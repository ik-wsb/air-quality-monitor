import { useState } from 'react';
import SearchForm from './components/SearchForm';
import AirQualityCard from './components/AirQualityCard';
import { fetchAirQuality } from './api/airApi';

const POLISH_CITIES = [
  'Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 
  'Katowice', 'Łódź', 'Szczecin', 'Bydgoszcz', 'Lublin'
];

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (city: string) => {
    const formattedCity = city.trim();
    
    if (!POLISH_CITIES.includes(formattedCity)) {
      setError(`Wybierz miasto z listy: ${POLISH_CITIES.join(', ')}`);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await fetchAirQuality(formattedCity);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Błąd połączenia z serwerem.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f172a', color: 'white', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Air Quality Monitor</h1>
          <p style={{ color: '#94a3b8' }}>Dane w czasie rzeczywistym z backendu FastAPI</p>
        </header>

        <SearchForm onSearch={handleSearch} isLoading={loading} />

        {loading && (
          <div style={{ textAlign: 'center', margin: '40px' }}>
            <div style={{ 
              width: '40px', height: '40px', border: '4px solid #1e293b', 
              borderTop: '4px solid #3b82f6', borderRadius: '50%', 
              animation: 'spin 1s linear infinite', margin: '0 auto' 
            }} />
            <p style={{ marginTop: '10px', color: '#94a3b8' }}>Pobieranie danych...</p>
          </div>
        )}

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#450a0a', border: '1px solid #7f1d1d', borderRadius: '8px', color: '#f87171', textAlign: 'center', marginTop: '20px' }}>
            {error}
          </div>
        )}
        
        {data && !loading && <AirQualityCard data={data} />}
      </div>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;