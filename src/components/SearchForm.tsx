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
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Wpisz miasto (np. Wrocław)..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={isLoading}
        style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc', flex: 1 }}
      />
      <button 
        type="submit" 
        disabled={isLoading}
        style={{ padding: '10px 20px', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
      >
        {isLoading ? 'Szukam...' : 'Szukaj'}
      </button>
    </form>
  );
}