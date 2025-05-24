import React, { useState, useRef, useEffect } from 'react';

interface FormInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  readOnly?: boolean;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  suggestions?: string[];
  showSuggestions?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
  type?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  value,
  onChange,
  placeholder,
  className = '',
  readOnly = false,
  onKeyDown,
  suggestions = [],
  showSuggestions = false,
  onSuggestionClick,
  type = 'text',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showDropdown = isFocused && showSuggestions && suggestions.length > 0;
  
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`p-2 bg-[#EFEAD3] rounded w-full focus:outline-none text-text-dark placeholder-text-muted h-10 font-['NewPoppins'] ${className}`}
        readOnly={readOnly}
        onKeyDown={onKeyDown}
        onFocus={() => setIsFocused(true)}
      />
      
      {showDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-[#EFEAD3] border border-gray-300 rounded shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-2 cursor-pointer hover:bg-[#E5E0C0] text-text-dark"
              onClick={() => {
                if (onSuggestionClick) {
                  onSuggestionClick(suggestion);
                } else {
                  onChange(suggestion);
                }
                setIsFocused(false);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FormInput;