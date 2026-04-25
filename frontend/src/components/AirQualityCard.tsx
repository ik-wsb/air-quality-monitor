interface AirQualityCardProps {
  data: {
    city: string;
    overall_status: string;
    pm10: number;
    pm25: number;
    no2: number;
    aqi_value?: number; // Jeśli backend to wysyła
  };
}

export default function AirQualityCard({ data }: AirQualityCardProps) {
  const getTheme = (status: string) => {
    switch (status) {
      case 'GOOD': return { color: '#4ade80', label: 'Dobry' };
      case 'MODERATE': return { color: '#fbbf24', label: 'Umiarkowany' };
      case 'POOR': return { color: '#f87171', label: 'Zły' };
      default: return { color: '#94a3b8', label: 'Brak danych' };
    }
  };

  // ZMIANA: Pobieramy status z overall_status (tak chce Igor)
  const theme = getTheme(data.overall_status);

  return (
    <div style={{ backgroundColor: '#111827', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', marginTop: '20px' }}>
      {/* Górna sekcja */}
      <div style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>Jakość powietrza</p>
          <h2 style={{ fontSize: '28px', margin: '0 0 8px 0', color: 'white' }}>{data.city}</h2>
          <span style={{ backgroundColor: theme.color + '22', color: theme.color, padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {theme.label}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          {/* ZMIANA: Tu wstawiamy realny AQI z backendu lub domyślnie 50 */}
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: theme.color, lineHeight: '1' }}>
            {data.aqi_value || '--'}
          </div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>AQI</div>
        </div>
      </div>

      {/* Szczegółowe pomiary */}
      <div style={{ padding: '30px' }}>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>Szczegółowe pomiary</p>
        {[
          { label: 'PM2.5', value: data.pm25, max: 25 }, // ZMIANA: data.pm25 zamiast data.details.pm25
          { label: 'PM10', value: data.pm10, max: 50 },  // ZMIANA: data.pm10 zamiast data.details.pm10
          { label: 'NO2', value: data.no2, max: 40 }      // ZMIANA: data.no2 zamiast data.details.no2
        ].map(param => (
          <div key={param.label} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', color: 'white' }}>
              <span style={{ fontWeight: 'bold' }}>{param.label}</span>
              <span style={{ color: '#94a3b8' }}>{param.value || 0} µg/m³</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#1f2937', borderRadius: '3px' }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min(((param.value || 0) / param.max) * 100, 100)}%`, 
                backgroundColor: theme.color, 
                borderRadius: '3px',
                transition: 'width 0.5s ease-in-out'
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}