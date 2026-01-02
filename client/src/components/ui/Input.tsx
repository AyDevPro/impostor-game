import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, ...props }, ref) => {
    if (label) {
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-300">
            {label}
          </label>
          <input
            ref={ref}
            className={`w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${className}`}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
