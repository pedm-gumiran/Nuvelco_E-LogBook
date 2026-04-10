import React from 'react';
import { useRouteError, isRouteErrorResponse } from 'react-router-dom';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

const GlobalErrorBoundary = () => {
  const error = useRouteError();
  console.error('Unhandled Route Error:', error);

  let errorMessage = 'An unexpected error occurred.';
  let errorStatus = '';

  if (isRouteErrorResponse(error)) {
    errorStatus = error.status.toString();
    errorMessage = error.data?.message || error.statusText || errorMessage;
  } else if (error instanceof Error) {
    errorMessage = error.message;
    if (errorMessage.includes('Failed to fetch dynamically imported module')) {
      errorMessage = 'A new version of the app might be available, or there was a connection issue while loading this page.';
    }
  }

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-6">
          <FiAlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-black text-gray-900 mb-2 uppercase tracking-tight">
          {errorStatus ? `Error ${errorStatus}` : 'Oops! Something went wrong'}
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          {errorMessage}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95"
          >
            <FiRefreshCw className="w-5 h-5" />
            Refresh Page
          </button>
          
          <button
            onClick={handleGoHome}
            className="flex items-center justify-center gap-2 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all transform active:scale-95"
          >
            <FiHome className="w-5 h-5" />
            Go to Homepage
          </button>
        </div>
        
        <p className="mt-8 text-xs text-gray-400 font-medium uppercase tracking-widest">
          DDNNHS E-LogBook • Error Recovery
        </p>
      </div>
    </div>
  );
};

export default GlobalErrorBoundary;
