import { useState } from 'react';
import SearchForm from './components/SearchForm';

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
      setError('Wybierz miasto z listy: ' + POLISH_CITIES.join(', '));
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`http://127.0.0.1:8000/air-quality/${formattedCity}`);
      
      if (!response.ok) {
        throw new Error('Backend nie odpowiedział poprawnie');
      }

      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError('Błąd połączenia z backendem Igora. Sprawdź czy serwer działa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif', color: 'white', backgroundColor: '#111' }}>
      <h1>Monitor Jakości Powietrza</h1>
      <SearchForm onSearch={handleSearch} isLoading={loading} />

      {loading && <p>Pobieranie danych z backendu...</p>}
      {error && <p style={{ color: '#ff4444' }}>{error}</p>}
      
      {data && (
        <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #444', borderRadius: '8px', backgroundColor: '#222' }}>
          <h2>Wynik dla: {data.city}</h2>
          <p>Indeks jakości: <strong>{data.aqi}</strong></p>
          <p>Status: {data.status}</p>
          <p style={{ fontSize: '12px', color: '#888' }}>Źródło: {data.source}</p>
        </div>
      )}
    </div>
  );
}

export default App;