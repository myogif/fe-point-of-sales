import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Plus } from 'lucide-react';

const AddManualItemForm = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const { addToCart } = useCart();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !price) return;

    const manualItem = {
      id: `manual-${Date.now()}`,
      name: productName,
      price_pcs: parseFloat(price),
      stock: 'N/A',
      image_url: 'https://via.placeholder.com/80',
    };

    addToCart(manualItem, 1, 'pcs');
    setProductName('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-white rounded-lg shadow-md p-3 mb-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Rp 0"
          className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default AddManualItemForm;
