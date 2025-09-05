import type { Currency } from '../types';
import { CURRENCY_LIST } from '../utils/currencyList';
import { useState } from 'react';
import { ModalCurrencyPicker } from './ModalCurrencyPicker';

interface Props {
  selectedCurrency: Currency;
  onSelect: (currency: Currency) => void;
  label: string;
}

export const CurrencySelector: React.FC<Props> = ({ selectedCurrency, onSelect, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (currency: Currency) => {
    onSelect(currency);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full p-3 bg-white border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{selectedCurrency.symbol}</span>
          <div>
            <div className="font-medium">{selectedCurrency.code}</div>
            <div className="text-sm text-gray-500">{selectedCurrency.name}</div>
          </div>
        </div>
        <svg
          className="w-4 h-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ModalCurrencyPicker
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={handleSelect}
          selectedCurrency={selectedCurrency}
          currencies={CURRENCY_LIST}
        />
      )}
    </div>
  );
};
