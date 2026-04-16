export default function AirQualityCard({ data }: { data: any }) {
  const getTheme = (index: string) => {
    switch (index) {
      case 'GOOD': return { color: '#4ade80', label: 'Dobry' };
      case 'MODERATE': return { color: '#fbbf24', label: 'Umiarkowany' };
      case 'POOR': return { color: '#f87171', label: 'Zły' };
      default: return { color: '#94a3b8', label: 'Brak danych' };
    }
  };

  const theme = getTheme(data.index);

  return (
    <div style={{ backgroundColor: '#111827', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
      {/* Górna sekcja */}
      <div style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1f2937' }}>
        <div>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 4px 0' }}>Jakość powietrza</p>
          <h2 style={{ fontSize: '28px', margin: '0 0 8px 0' }}>{data.city}</h2>
          <span style={{ backgroundColor: theme.color + '22', color: theme.color, padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
            {theme.label}
          </span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: theme.color, lineHeight: '1' }}>50</div>
          <div style={{ fontSize: '14px', color: '#94a3b8' }}>AQI</div>
        </div>
      </div>

      {/* Szczegółowe pomiary z paskami (jak w PDF) */}
      <div style={{ padding: '30px' }}>
        <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>Szczegółowe pomiary</p>
        {[
          { label: 'PM2.5', value: data.details.pm25, max: 25 },
          { label: 'PM10', value: data.details.pm10, max: 50 },
          { label: 'NO2', value: data.details.no2, max: 40 }
        ].map(param => (
          <div key={param.label} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
              <span style={{ fontWeight: 'bold' }}>{param.label}</span>
              <span style={{ color: '#94a3b8' }}>{param.value} µg/m³</span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#1f2937', borderRadius: '3px' }}>
              <div style={{ 
                height: '100%', 
                width: `${Math.min((param.value / param.max) * 100, 100)}%`, 
                backgroundColor: theme.color, 
                borderRadius: '3px' 
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}