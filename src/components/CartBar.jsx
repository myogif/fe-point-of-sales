import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/priceFormatter';

const CartBar = ({ onCheckout }) => {
  const { cart, getCartTotal } = useCart();
  const total = getCartTotal();
  const itemCount = cart.length;

  if (itemCount === 0) {
    return null; // Don't show the bar if cart is empty
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-3 z-30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-gray-900">{formatPrice(total)}</p>
            <p className="text-xs text-gray-500">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
          </div>
        </div>
        <button
          onClick={onCheckout}
          className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Proceed
        </button>
      </div>
    </div>
  );
};

export default CartBar;