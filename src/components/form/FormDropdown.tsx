import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface FormDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: string[];
}

const FormDropdown: React.FC<FormDropdownProps> = ({
  value,
  onChange,
  placeholder,
  options,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option => 
    option.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setFilter(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="p-2 bg-[#EFEAD3] rounded w-full focus:outline-none text-text-dark placeholder-text-muted h-10 font-['NewPoppins']"
      />
      {isOpen && filteredOptions.length > 0 && (
        <motion.ul 
          className="absolute z-10 w-full mt-1 max-h-48 overflow-auto bg-[#EFEAD3] border border-gray-300 rounded shadow-lg"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {filteredOptions.map((option, i) => (
            <li 
              key={i} 
              className="p-2 hover:bg-[#E5E0C0] cursor-pointer text-text-dark" 
              onMouseDown={() => { onChange(option); setIsOpen(false); }}
            >
              {option}
            </li>
          ))}
        </motion.ul>
      )}
    </div>
  );
};

export default FormDropdown;