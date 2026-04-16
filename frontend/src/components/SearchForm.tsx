import { useState } from 'react';

interface SearchFormProps {
  onSearch: (city: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      onSearch(inputValue);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
      <input
        type="text"
        placeholder="Wpisz miasto..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
        style={{ 
          padding: '12px 20px', 
          borderRadius: '8px', 
          backgroundColor: '#111827', 
          color: 'white', 
          flex: 1
        }}
      />
      <button 
        type="submit" 
        disabled={isLoading}
        style={{ 
          padding: '10px 24px', 
          borderRadius: '8px', 
          backgroundColor: '#3b82f6', 
          color: 'white', 
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        {isLoading ? '...' : 'Szukaj'}
      </button>
    </form>
  );
}