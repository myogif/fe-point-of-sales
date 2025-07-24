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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <input
            id="product-name"
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter product name"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="w-full sm:w-1/3">
          <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 mb-1">
            Price
          </label>
          <input
            id="product-price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div className="flex items-end">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
          >
            <Plus className="w-5 h-5" />
            Add
          </button>
        </div>
      </div>
    </form>
  );
};

export default AddManualItemForm;
