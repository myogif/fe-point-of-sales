import React, { useState } from 'react';
import { ShoppingCart, Trash2, X, Tag, CreditCard } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/priceFormatter';
import CartItem from './CartItem';
import AddManualItemForm from './AddManualItemForm';
import toast from 'react-hot-toast';
import { salesAPI } from '../services/api';
import CreateCreditModal from './CreateCreditModal'; // Import the modal

const CartSidebar = () => {
  const { items, clearCart, getCartTotal, getTotalItems } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false); // State to control modal visibility

  const handleProcessPayment = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setIsProcessing(true);
    try {
      // In a real app, you would integrate a payment gateway here
      await salesAPI.create({
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price_pcs,
          total: item.price_pcs * item.quantity,
          selectedUnit: 'pcs'
        })),
        total: getCartTotal(),
        payment_method: 'cash', // Example
      });
      toast.success('Payment successful!');
      clearCart();
      setActiveTab('cart');
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsCredit = () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }
    setShowCreditModal(true);
  };

  const handleCreditSuccess = () => {
    clearCart();
    setShowCreditModal(false);
  };

  const subtotal = getCartTotal();
  const total = subtotal;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <header className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Current Order</h2>
        <p className="text-sm text-gray-500">{getTotalItems()} items</p>
      </header>

      {/* Cart Items */}
      <main className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
            <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold">Your cart is empty</h3>
            <p className="text-sm">Add products to the cart to see them here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-gray-200 bg-gray-50">
        <AddManualItemForm />
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-800">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-blue-600">{formatPrice(total)}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <button
            onClick={handleProcessPayment}
            disabled={isProcessing || items.length === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-blue-700 transition-all duration-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
            'Proceed to Payment'
            )}
          </button>
          <button
            onClick={handleSaveAsCredit}
            disabled={isProcessing || items.length === 0}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-orange-600 transition-all duration-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Save as Credit
          </button>
          {items.length > 0 && (
             <button
                onClick={clearCart}
                className="w-full bg-red-100 text-red-600 py-2 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
              >
              Clear Cart
            </button>
          )}
        </div>
      </footer>

      {showCreditModal && (
        <CreateCreditModal
          onClose={() => setShowCreditModal(false)}
          onSuccess={handleCreditSuccess}
          cartTotal={getCartTotal()}
        />
      )}
    </div>
  );
};

export default CartSidebar;
