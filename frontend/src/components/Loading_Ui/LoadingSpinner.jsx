import React from 'react';
import { FiLoader } from 'react-icons/fi';

export default function LoadingSpinner(
  { label = 'Loading, please wait...', small = false }
) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4 bg-white/80 backdrop-blur-sm fixed inset-0 z-50">
      <FiLoader className={`text-[#188b3e] animate-spin ${small ? 'w-5 h-5' : 'w-15 h-15'}`} />
      {label && (
        <p className={`text-gray-700 font-semibold ${small ? 'text-sm' : 'text-lg'}`}>
          {label}
        </p>
      )}
    </div>
  );
}
