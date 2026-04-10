import React from 'react';
import { FaSearch } from 'react-icons/fa';
import { IoCloseCircle } from 'react-icons/io5';

export default function SearchBar({
  value,
  onChange,
  onFocus,
  onClear,
  placeholder = 'Search...',
  disabled,
  id,
  name = 'search', // default name
  width = 'md:w-1/2', // default width
}) {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { name, value: '' } });
    }
  };

  return (
    <div className={`relative flex items-center mb-4 w-full ${width} z-0`}>
      {/* Search icon inside container */}
      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 " />

      {/* Input field */}
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        disabled={disabled}
        className={`w-full pl-10 pr-8 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#168e3f] focus:border-transparent transition text-xs sm:text-sm md:text-md ${
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
            : 'bg-white text-gray-900 border-gray-300 focus:border-[#168e3f] focus:ring-2 focus:ring-[#168e3f]'
        }`}
      />

      {/* Clear button (right side) */}
      {value && !disabled && (
        <span
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600"
          onClick={handleClear}
          title="Clear"
        >
          <IoCloseCircle size={20} />
        </span>
      )}
    </div>
  );
}
