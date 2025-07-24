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
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4 z-30">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-2 rounded-full">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-600 text-sm">Total to Pay:</p>
            <p className="text-xl font-bold text-gray-900">{formatPrice(total)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
          <button
            onClick={onCheckout}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartBar;