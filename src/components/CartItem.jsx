import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Minus } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/priceFormatter';

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity, updatePrice } = useCartStore();
  const [price, setPrice] = useState(item.price);
  const [quantity, setQuantity] = useState(item.quantity);

  useEffect(() => {
    setPrice(item.price);
    setQuantity(item.quantity);
  }, [item]);

  const handlePriceChange = (e) => {
    const newPrice = parseFloat(e.target.value) || 0;
    setPrice(newPrice);
    updatePrice(item.id, item.selectedUnit, newPrice);
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = Math.max(0, quantity + amount);
    setQuantity(newQuantity);
    updateQuantity(item.id, item.selectedUnit, amount);
  };

  return (
    <div className="flex items-center p-4 space-x-4">
      <img
        src={item.image_url || 'https://via.placeholder.com/80'}
        alt={item.name}
        className="w-16 h-16 object-cover rounded-lg"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-md text-gray-800 truncate">{item.name}</h4>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <input
            type="number"
            value={price}
            onChange={handlePriceChange}
            className="text-sm text-gray-600 w-24 border border-gray-300 rounded-md px-2 py-1 focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex items-center border border-gray-300 rounded-full">
            <button
              onClick={() => handleQuantityChange(item.selectedUnit === 'pcs' ? -1 : -0.1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-l-full"
            >
              <Minus className="w-4 h-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQuantity = parseFloat(e.target.value) || 0;
                const amount = newQuantity - quantity;
                handleQuantityChange(amount);
              }}
              className="w-12 text-center font-semibold border-none focus:ring-0"
              step={item.selectedUnit === 'pcs' ? 1 : 0.1}
            />
            <button
              onClick={() => handleQuantityChange(item.selectedUnit === 'pcs' ? 1 : 0.1)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-r-full"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <span className="text-sm text-gray-500">{item.selectedUnit}</span>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-lg text-gray-800">{formatPrice(price * quantity)}</p>
        <button
          onClick={() => removeFromCart(item.id, item.selectedUnit)}
          className="text-red-500 hover:text-red-700 transition-colors mt-2"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
