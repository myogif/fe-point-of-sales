import React from 'react';
import { Minus, Plus } from 'lucide-react';

const QuantitySelector = ({ quantity, onQuantityChange, min = 1, step = 1 }) => {
  const handleDecrement = () => {
    const newQuantity = Math.max(min, quantity - step);
    onQuantityChange(newQuantity);
  };

  const handleIncrement = () => {
    const newQuantity = quantity + step;
    onQuantityChange(newQuantity);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleDecrement}
        className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors"
        disabled={quantity <= min}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="font-semibold text-gray-800 w-10 text-center">{quantity}</span>
      <button
        onClick={handleIncrement}
        className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300 transition-colors"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default QuantitySelector;
