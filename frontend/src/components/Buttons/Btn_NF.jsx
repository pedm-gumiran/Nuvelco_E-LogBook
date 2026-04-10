import React from 'react';
import { Link } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';

export default function Button({
  label,
  icon,
  onClick,
  className = '',
  to,
  state,
  type = 'button',
  isLoading = false,
}) {
  const design = `flex justify-center items-center p-3 px-5 rounded-lg shadow-md gap-2
     btn btn-primary transition duration-200
     ${className}`;

  if (to) {
    return (
      <Link to={to} state={state} className={design}>
        {icon && <span className="text-lg">{icon}</span>}
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={isLoading} className={design}>
      {isLoading && <FiLoader className="w-4 h-4 animate-spin" />}
      {!isLoading && icon && <span className="text-lg">{icon}</span>}
      <span>{isLoading ? 'Loading...' : label}</span>
    </button>
  );
}
