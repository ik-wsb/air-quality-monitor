interface AirQualityCardProps {
  data: any; // Używamy any, żeby zobaczyć co on tam faktycznie przysyła
}

export default function AirQualityCard({ data }: AirQualityCardProps) {
  // Funkcja pomocnicza do wyciągania wartości, bo Igor może to przysyłać w różny sposób
  const getValue = (key: string) => {
    return data[key] || data.values?.[key] || data.measurements?.[key] || 0;
  };

  const status = data.overall_status || data.index || 'UNKNOWN';
  
  const getTheme = (s: string) => {
    if (s.includes('GOOD') || s.includes('Bardzo dobry')) return { color: '#4ade80', label: 'Dobry' };
    if (s.includes('MODERATE') || s.includes('Umiarkowany')) return { color: '#fbbf24', label: 'Średni' };
    return { color: '#f87171', label: 'Zły' };
  };

  const theme = getTheme(status);

  return (
    <div style={{ backgroundColor: '#111827', borderRadius: '16px', padding: '30px', marginTop: '20px', color: 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1f2937', paddingBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '24px', margin: '0' }}>{data.city || 'Nieznane miasto'}</h2>
          <span style={{ color: theme.color, fontWeight: 'bold' }}>{theme.label}</span>
        </div>
        <div style={{ fontSize: '48px', fontWeight: 'bold', color: theme.color }}>
          {data.aqi || data.aqi_value || '--'}
        </div>
      </div>

      <div style={{ marginTop: '20px' }}>
        {[
          { label: 'PM10', val: getValue('pm10'), max: 50 },
          { label: 'PM2.5', val: getValue('pm25'), max: 25 },
          { label: 'NO2', val: getValue('no2'), max: 40 }
        ].map(p => (
          <div key={p.label} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '5px' }}>
              <span>{p.label}</span>
              <span>{p.val} µg/m³</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#1f2937', borderRadius: '4px' }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min((p.val / p.max) * 100, 100)}%`, 
                backgroundColor: theme.color, 
                borderRadius: '4px',
                transition: 'width 0.5s' 
              }} />
            </div>
          </div>
        ))}
      </div>
      {/* TA LINIA JEST DLA CIEBIE DO TESTU - usuń ją przed wysłaniem do Igora jeśli chcesz */}
      <pre style={{fontSize: '10px', color: '#444', marginTop: '20px'}}>Debug: {JSON.stringify(data)}</pre>
    </div>
  );
}