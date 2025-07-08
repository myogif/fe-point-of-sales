import React from 'react';
import { Construction } from 'lucide-react';

const ComingSoon = ({ title }) => {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
          <Construction className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
        <p className="text-gray-600">This feature is coming soon!</p>
      </div>
    </div>
  );
};

export default ComingSoon;