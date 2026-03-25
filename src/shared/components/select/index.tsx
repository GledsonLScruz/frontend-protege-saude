import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import './select-style.css';

export interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<string | CustomSelectOption>;
  placeholder?: string;
  label?: string;
  onBlur?: () => void;
  error?: boolean;
  searchPlaceholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Selecione uma opção',
  label,
  onBlur,
  error,
  searchPlaceholder = 'Buscar opção...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<CustomSelectOption[]>([]);
  const selectRef = useRef<HTMLDivElement>(null);
  const normalizedOptions = React.useMemo(
    () =>
      options.map((option) =>
        typeof option === 'string' ? { label: option, value: option } : option
      ),
    [options]
  );
  const selectedOption = normalizedOptions.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const filtered = normalizedOptions.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [normalizedOptions, searchTerm]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchTerm('');
  };

  return (
    <div className="custom-select-container" ref={selectRef}>
      {label && <label className="custom-select-label">{label}</label>}

      <div
        className={`custom-select-header ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
        onClick={() => {
          setIsOpen(!isOpen);
          onBlur?.();
        }}
      >
        {selectedOption ? (
          <div className="selected-value">
            <span className="selected-value-label">{selectedOption.label}</span>
            <button
              className="clear-button"
              onClick={clearSelection}
              aria-label="Limpar seleção"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <ChevronDown className={`arrow-icon ${isOpen ? 'open' : ''}`} size={20} />
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          <div className="search-container">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="options-container">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`option ${value === option.value ? 'selected' : ''}`}
                  onClick={() => handleSelect(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="no-results">Nenhum resultado encontrado</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
