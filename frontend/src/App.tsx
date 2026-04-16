import { useState } from 'react';
import SearchForm from './components/SearchForm';
import AirQualityCard from './components/AirQualityCard';

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
      setError('Wpisz poprawne polskie miasto (np. Warszawa, Wrocław)');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/air-quality/${formattedCity}`);
      
      if (!response.ok) {
        throw new Error('Błąd połączenia z serwerem');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError('Nie udało się pobrać danych. Upewnij się, że backend działa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0a0f18', color: 'white', padding: '40px 20px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1>Monitor Jakości Powietrza</h1>
          <p style={{ color: '#94a3b8' }}>Wybierz miasto w Polsce</p>
        </header>

        <SearchForm onSearch={handleSearch} isLoading={loading} />

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px' }}>
            <div className="spinner" style={{
              width: '40px',
              height: '40px',
              border: '4px solid rgba(255,255,255,0.1)',
              borderTop: '4px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          </div>
        )}

        {error && <p style={{ color: '#f87171', textAlign: 'center' }}>{error}</p>}
        
        {data && !loading && <AirQualityCard data={data} />}
      </div>
      
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default App;