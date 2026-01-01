import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardContent = ({ children, className = '', ...props }: CardProps) => {
  return (
    <div className={`px-6 py-4 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h3 className={`text-lg font-semibold ${className}`} {...props}>
      {children}
    </h3>
  );
};

export const CardDescription = ({ children, className = '', ...props }: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-sm text-gray-600 ${className}`} {...props}>
      {children}
    </p>
  );
};
