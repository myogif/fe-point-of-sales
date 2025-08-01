import React, { useState } from 'react';
import { ShoppingCart, Trash2, X, Tag, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/priceFormatter';
import CartItem from './CartItem';
import AddManualItemForm from './AddManualItemForm';
import toast from 'react-hot-toast';
import { salesAPI } from '../services/api';
import CreateCreditModal from './CreateCreditModal'; // Import the modal

const CartSidebar = ({ onClose }) => {
  const { cart: items, clearCart, getCartTotal, processPayment, saveAsCredit } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false); // State to control modal visibility

  const handleProcessPayment = async () => {
    if (items.length === 0) {
      toast.error('Keranjang kosong');
      return;
    }
    setIsProcessing(true);
    try {
      const success = await processPayment();
      if (success) {
        toast.success('Pembayaran berhasil!');
      } else {
        toast.error('Pembayaran gagal. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Pembayaran gagal. Silakan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAsCredit = () => {
    if (items.length === 0) {
      toast.error('Keranjang kosong');
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
      <header className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Pesanan Saat Ini</h2>
          <p className="text-sm text-gray-500">{items.length} item</p>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-500">
          <X className="w-6 h-6" />
        </button>
      </header>

      {/* Cart Items */}
      <main className="flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-4">
            <ShoppingCart className="w-16 h-16 mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold">Keranjang Anda kosong</h3>
            <p className="text-sm">Tambahkan produk ke keranjang untuk melihatnya di sini.</p>
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
            'Lanjut ke Pembayaran'
            )}
          </button>
          <button
            onClick={handleSaveAsCredit}
            disabled={isProcessing || items.length === 0}
            className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold text-base hover:bg-orange-600 transition-all duration-300 flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Simpan sebagai Kredit
          </button>
          {items.length > 0 && (
             <button
                onClick={clearCart}
                className="w-full bg-red-100 text-red-600 py-2 rounded-lg font-semibold text-sm hover:bg-red-200 transition-colors"
              >
              Kosongkan Keranjang
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
