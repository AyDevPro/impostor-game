import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, ...props }, ref) => {
    if (label) {
      return (
        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          <input
            ref={ref}
            className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
            {...props}
          />
        </div>
      );
    }

    return (
      <input
        ref={ref}
        className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
