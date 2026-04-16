import { useState } from 'react';
import SearchForm from './components/SearchForm';
import AirQualityCard from './components/AirQualityCard'; // Importujemy naszą nową kartę!
import { fetchAirQuality } from './api/airApi';

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
    <div style={{ maxWidth: '600px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Monitor Jakości Powietrza</h1>
      
      <SearchForm onSearch={handleSearch} isLoading={loading} />

      {loading && <p style={{ textAlign: 'center' }}>⏳ Pobieranie danych dla miasta...</p>}

      {error && <p style={{ color: 'red', textAlign: 'center', padding: '10px', backgroundColor: '#fee2e2', borderRadius: '5px' }}>❌ {error}</p>}

      {/* Jeśli mamy dane, wyświetlamy ładną kartę wyników */}
      {data && <AirQualityCard data={data} />}
    </div>
  );
}

export default App;