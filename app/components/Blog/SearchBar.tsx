'use client';

import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder = 'Search blogs...' }) => {
  return (
    <div className="relative w-full max-w-xl">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FiSearch className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition-colors duration-200"
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
