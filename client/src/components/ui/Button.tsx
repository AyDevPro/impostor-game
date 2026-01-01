import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger' | 'success';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
}

export const Button = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  isLoading = false,
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    default: 'bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-200',
    outline: 'border border-gray-300 bg-transparent hover:bg-gray-100 focus:ring-gray-300',
    ghost: 'hover:bg-gray-100 focus:ring-gray-300',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-600',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-600'
  };

  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
