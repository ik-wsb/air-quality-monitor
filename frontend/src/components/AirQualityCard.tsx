interface AirQualityCardProps {
  data: {
    city: string;
    overall_status: string;
    pm10: number | null;
    pm25: number | null;
    no2: number | null;
    o3: number | null;
    so2: number | null;
    co: number | null;
    refreshed_at: string;
  };
}

export default function AirQualityCard({ data }: AirQualityCardProps) {
  const getTheme = (status: string) => {
    switch (status) {
      case 'GOOD': return { color: '#4ade80', label: 'Dobry' };
      case 'MODERATE': return { color: '#fbbf24', label: 'Umiarkowany' };
      case 'POOR': return { color: '#f87171', label: 'Zły' };
      default: return { color: '#94a3b8', label: 'Nieznany' };
    }
  };

  const theme = getTheme(data.overall_status);

  return (
    <div style={{ backgroundColor: '#111827', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)', marginTop: '20px', color: 'white' }}>
      <div style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>Ostatnia aktualizacja: {new Date(data.refreshed_at).toLocaleString()}</p>
          <h2 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>{data.city}</h2>
          <span style={{ backgroundColor: theme.color + '22', color: theme.color, padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {theme.label}
          </span>
        </div>
      </div>

      <div style={{ padding: '30px' }}>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>Parametry powietrza</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {[
            { label: 'PM2.5', value: data.pm25, unit: 'µg/m³' },
            { label: 'PM10', value: data.pm10, unit: 'µg/m³' },
            { label: 'NO2', value: data.no2, unit: 'µg/m³' },
            { label: 'O3', value: data.o3, unit: 'µg/m³' },
            { label: 'SO2', value: data.so2, unit: 'µg/m³' },
            { label: 'CO', value: data.co, unit: 'µg/m³' },
          ].map(param => (
            <div key={param.label} style={{ padding: '15px', backgroundColor: '#1f2937', borderRadius: '8px' }}>
              <p style={{ margin: '0', color: '#94a3b8', fontSize: '12px' }}>{param.label}</p>
              <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
                {param.value !== null ? `${param.value} ${param.unit}` : 'brak danych'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}