interface AirQualityData {
  city: string;
  index: string;
  details: {
    pm10: number;
    pm25: number;
    no2: number;
  };
}

interface Props {
  data: AirQualityData;
}

export default function AirQualityCard({ data }: Props) {
  // Funkcja decydująca o kolorze na podstawie indeksu z API
  const getTheme = (index: string) => {
    switch (index) {
      case 'GOOD': 
        return { bg: '#d1fae5', text: '#065f46', label: 'Dobry' }; // Zielony
      case 'MODERATE': 
        return { bg: '#fef3c7', text: '#92400e', label: 'Umiarkowany' }; // Pomarańczowy
      case 'POOR': 
        return { bg: '#fee2e2', text: '#991b1b', label: 'Zły' }; // Czerwony
      default: 
        return { bg: '#f3f4f6', text: '#1f2937', label: 'Nieznany' }; // Szary
    }
  };

  const theme = getTheme(data.index);

  return (
    <div style={{
      backgroundColor: theme.bg,
      color: theme.text,
      padding: '20px',
      borderRadius: '12px',
      marginTop: '20px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      transition: 'background-color 0.3s ease'
    }}>
      <h2 style={{ margin: '0 0 10px 0' }}>Miasto: {data.city}</h2>
      <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px 0' }}>
        Jakość powietrza: {theme.label}
      </p>
      
      {/* Szczegółowe parametry wylistowane poniżej */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' }}>
          <span>PM10</span>
          <strong>{data.details.pm10} µg/m³</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' }}>
          <span>PM2.5</span>
          <strong>{data.details.pm25} µg/m³</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '5px' }}>
          <span>NO2</span>
          <strong>{data.details.no2} µg/m³</strong>
        </div>
      </div>
    </div>
  );
}