import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  required = false,
  disabled = false,
  type = 'text',
  placeholder,
  ...props 
}) => {
  const inputClasses = `
    block w-full px-4 py-3 text-sm border rounded-lg shadow-sm placeholder-gray-400 
    transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-400'
    }
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          className={inputClasses}
          disabled={disabled}
          placeholder={placeholder}
          {...props}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Input;
