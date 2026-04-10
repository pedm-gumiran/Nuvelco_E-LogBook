import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoCloseCircle } from 'react-icons/io5';

export default function Input_Password({
  label,
  onChange,
  value,
  name,
  required,
  placeholder,
  className,
  password_className,
  disabled,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const handleClear = () => {
    const event = {
      target: { name, value: '' },
    };
    onChange(event);
  };

  return (
    <div>
      <label>
        <span
          className={`block text-gray-600   mb-1 font-semibold ${className}`}
        >
          {label}
        </span>
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#168e3f] focus:border-transparent transition ${password_className} ${
            disabled
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
              : 'bg-white text-gray-900 border-gray-300 focus:border-[#168e3f] focus:ring-2 focus:ring-[#168e3f]'
          }`}
          required={required}
          onChange={onChange}
          value={value}
          name={name}
          placeholder={placeholder}
          disabled={disabled}
        />

        {/* Toggle show/hide password */}
        <span
          className="absolute top-1/2 right-12 transform -translate-y-1/2 cursor-pointer z-10 bg-white p-2 text-gray-500 hover:text-gray-700 rounded-sm"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? 'Hide Password' : 'Show Password'}
        >
          {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
        </span>

        {/* Clear input button */}
        {value && (
          <span
            className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer z-30 text-gray-500 hover:text-gray-700 bg-white  p-2 rounded-sm"
            onClick={handleClear}
            title="Clear"
          >
            <IoCloseCircle size={20} />
          </span>
        )}
      </div>
    </div>
  );
}
