import React from 'react';

export default function Dropdown({
  label,
  id,
  name,
  value,
  onChange,
  options = [],
  className = '',
  disabled = false,
  required = false,
  placeholder = 'Select an option'
}) {
  return (
    <div className="relative">
      {label && (
        <label
          htmlFor={id}
          className={`block text-gray-600 mb-1 font-semibold ${className}`}
        >
          {label}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition ${
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
            : 'bg-white text-gray-900 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500'
        } ${className}`}
      >
        {placeholder && (
          <option value="" disabled className="text-gray-900">
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value} className="text-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
