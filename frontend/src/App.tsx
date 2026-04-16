import { useState } from 'react';
import SearchForm from './components/SearchForm';
import AirQualityCard from './components/AirQualityCard';
import { fetchAirQuality } from './api/airApi';

// WAŻNE: Nie dodawaj tutaj import './App.css' ani './index.css'

function App() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (city: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const result = await fetchAirQuality(city);
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0a0f18', 
      color: 'white', 
      padding: '40px 20px', 
      fontFamily: 'sans-serif',
      margin: 0 // Reset marginesów body
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ color: '#60a5fa', fontSize: '14px', marginBottom: '8px' }}>💨 Monitor powietrza</p>
          <h1 style={{ fontSize: '32px', margin: 0 }}>Jakość powietrza</h1>
          <p style={{ color: '#94a3b8', fontSize: '13px' }}>Dane z GIOŚ / OpenAQ • cache 1h</p>
        </header>
        
        <SearchForm onSearch={handleSearch} isLoading={loading} />

        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {['Warszawa', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań', 'Katowice'].map(city => (
            <button 
              key={city}
              onClick={() => handleSearch(city)}
              style={{ 
                backgroundColor: '#1e293b', 
                border: 'none', 
                color: '#94a3b8', 
                padding: '6px 16px', 
                borderRadius: '20px', 
                cursor: 'pointer',
                fontSize: '13px',
                outline: 'none'
              }}
            >
              {city}
            </button>
          ))}
        </div>

        {loading && <p style={{ textAlign: 'center' }}>⏳ Pobieranie danych...</p>}
        {error && <p style={{ color: '#f87171', textAlign: 'center' }}>❌ {error}</p>}
        {data && <AirQualityCard data={data} />}
      </div>
    </div>
  );
}

export default App;