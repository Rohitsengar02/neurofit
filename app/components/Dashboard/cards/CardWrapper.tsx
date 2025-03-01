import React, { ReactNode } from 'react';

interface CardWrapperProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
  className?: string;
}

const CardWrapper: React.FC<CardWrapperProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition-shadow ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="text-blue-600 text-xl">{icon}</div>
        <h3 className="font-semibold text-gray-800">{title}</h3>
      </div>
      <div>{children}</div>
    </div>
  );
};

export default CardWrapper;
