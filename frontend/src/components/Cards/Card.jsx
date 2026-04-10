import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  title = null,
  subtitle = null,
  icon = null,
  headerRight = null,
  accentColor = null,
  padding = 'p-6',
  shadow = 'shadow-sm',
  hoverShadow = 'hover:shadow-lg',
  rounded = 'rounded-2xl',
  border = 'border',
  bg = 'bg-white',
  transition = 'transition-all duration-300 ease-out',
  hoverScale = 'hover:-translate-y-1'
}) {
  const accentClass = accentColor ? `border-l-4 ${accentColor}` : '';
  
  return (
    <div className={`${bg} ${shadow} ${hoverShadow} ${rounded} ${border} ${padding} ${transition} ${hoverScale} ${accentClass} ${className}`}>
      {(title || icon || headerRight || subtitle) && (
        <div className="mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  {icon}
                </div>
              )}
              <div>
                {title && (
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
                )}
              </div>
            </div>
            {headerRight && <div>{headerRight}</div>}
          </div>
        </div>
      )}
      <div className="text-gray-700">{children}</div>
    </div>
  );
}
