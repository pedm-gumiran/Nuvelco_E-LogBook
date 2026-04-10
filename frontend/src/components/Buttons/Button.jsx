import React from 'react';
import { FiLoader, FiSave } from 'react-icons/fi';

export default function Button({
  disabled,
  label,
  type = 'button',
  onClick,
  className = '',
  icon = null,
  title,
  isLoading = false,
  loadingText = 'Loading...',
  variant = 'primary', // 'primary', 'secondary', 'modal-primary', 'modal-secondary', 'custom'
  size = 'md', // 'sm', 'md', 'lg'
  customColor = '#0172f6', // Custom color for 'custom' variant
  hideLabelOnSmall = false, // Hide label on small screens
}) {
  const getVariantClasses = () => {
    // Return empty classes if disabled to prevent hover effects
    if (disabled || isLoading) {
      return '';
    }
    
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500';
      case 'secondary':
        return ' text-gray-800 bg-white  focus:ring-2 focus:ring-gray-500';
      case 'modal-primary':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700';
      case 'modal-secondary':
        return 'border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer';
      case 'custom':
        return `text-white hover:opacity-90 focus:ring-2 focus:ring-offset-2`;
      default:
        return 'bg-blue-600 text-white hover:bg-blue-700';
    }
  };

  const getSizeClasses = () => {
    if (hideLabelOnSmall) {
      // Responsive padding - smaller on mobile when label is hidden
      switch (size) {
        case 'sm':
          return 'px-2 sm:px-3 py-1.5 text-sm';
        case 'md':
          return 'px-2 sm:px-4 py-2 text-sm';
        case 'lg':
          return 'px-3 sm:px-6 py-3 text-base';
        default:
          return 'px-2 sm:px-4 py-2 text-sm';
      }
    }
    switch (size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const baseClasses = `rounded-md transition-all flex items-center justify-center gap-2 font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${(disabled || isLoading) ? '' : 'cursor-pointer'}`;
  const disabledClasses = (disabled || isLoading) ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60' : '';
  
  const buttonClasses = `
    ${baseClasses}
    ${getVariantClasses()}
    ${getSizeClasses()}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Auto-add FiSave icon for modal-primary variant if no icon provided
  const buttonIcon = icon || (variant === 'modal-primary' ? <FiSave size={16} /> : null);

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={buttonClasses}
      title={title}
      style={variant === 'custom' ? { backgroundColor: customColor } : {}}
    >
      {/* Show spinner if loading */}
      {isLoading && (
        <FiLoader
          className="inline-block w-4 h-4 animate-spin"
          aria-hidden="true"
        />
      )}

      {/* Optional icon (only show when not loading) */}
      {!isLoading && buttonIcon && <span className="flex items-center">{buttonIcon}</span>}

      {/* Change text depending on loading state */}
      <span className={hideLabelOnSmall ? 'hidden sm:inline' : ''}>{isLoading ? loadingText : label}</span>
    </button>
  );
}
