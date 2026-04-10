import React from 'react';
import { IoCloseCircle } from 'react-icons/io5';

export default function Input_Text({
  label,
  id,
  name,
  placeholder,
  required,
  onChange,
  value,
  disabled,
  className,
  text_ClassName,
  type = 'text',
  onKeyDown,
  inputRef,
}) {
  const handleClear = () => {
    const event = { target: { name, value: '' } };
    onChange(event);
  };

  // Format based on input type and name
  const formatValue = (inputValue) => {
    if (type === 'email') {
      return inputValue; // keep as-is for email
    } else if (name === 'rrfNumber') {
      return inputValue.toUpperCase(); // ALL CAPS for RRF number
    } else if (name === 'Unit' || name === 'Item_Description') {
      return inputValue; // keep as-is for Unit and Item_Description fields (no auto-capitalization)
    } else {
      // Default: capitalize first letter of each word
      return inputValue.replace(/\b\w/g, (char) => char.toUpperCase());
    }
  };

  const handleChange = (e) => {
    const inputValue = e.target.value;
    
    // Send formatted value to parent
    onChange({ target: { name, value: formatValue(inputValue) } });
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-gray-600  mb-1 font-semibold ${className}`}
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#168e3f] focus:border-transparent transition ${text_ClassName}  ${
          disabled
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
            : 'bg-white text-gray-900 border-gray-300 focus:border-[#168e3f] focus:ring-2 focus:ring-[#168e3f]'
        }`}
        required={required}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        value={value}
        disabled={disabled}
        ref={inputRef}
        autoComplete={type === 'email' || name === 'email' ? 'email' : name === 'pin_code' ? 'off' : 'new-password'} // Enable auto-suggestion for email, disable for PIN code
      />
      {value && !disabled && type !== 'number' && (
        <span
          className="absolute mt-5 right-3 transform -translate-y-1/2 cursor-pointer z-30 text-gray-500 hover:text-gray-700 bg-white p-1 rounded-sm "
          onClick={handleClear}
          title="Clear"
        >
          <IoCloseCircle size={20} />
        </span>
      )}
    </div>
  );
}
