import React, { useRef, useEffect } from 'react';
import { IoCloseCircle } from 'react-icons/io5';

export default function TextArea({
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
  rows = 3,
  minHeight = '80px',
  resize = 'vertical',
}) {
  const textareaRef = useRef(null);

  // Auto-resize functionality if needed
  useEffect(() => {
    if (textareaRef.current && resize === 'auto') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value, resize]);

  const handleClear = () => {
    const event = { target: { name, value: '' } };
    onChange(event);
  };

  const getResizeClass = () => {
    switch (resize) {
      case 'none':
        return 'resize-none';
      case 'horizontal':
        return 'resize-x';
      case 'vertical':
        return 'resize-y';
      case 'both':
        return 'resize';
      case 'auto':
        return 'resize-none'; // Auto resize handled by JavaScript
      default:
        return 'resize-y';
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`block text-gray-600 mb-1 font-semibold ${className}`}
      >
        {label}
      </label>
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          name={name}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white text-gray-900 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-sm md:text-base ${getResizeClass()} ${text_ClassName} ${
            disabled
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
              : 'bg-white text-gray-900 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-500'
          }`}
          required={required}
          onChange={onChange}
          value={value}
          disabled={disabled}
          rows={rows}
          style={{ 
            minHeight,
            ...(resize === 'auto' && { overflow: 'hidden' })
          }}
          autoComplete="off"
        />
        {value && !disabled && (
          <button
            type="button"
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors bg-transparent p-1 rounded"
            onClick={handleClear}
            title="Clear"
          >
            <IoCloseCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
