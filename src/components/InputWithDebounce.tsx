import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const InputWithDebounce: React.FC<Props> = ({ value, onChange, placeholder }) => {
  const [inputValue, setInputValue] = useState(value);

  const debouncedValue = useDebounce(inputValue, 250);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};
