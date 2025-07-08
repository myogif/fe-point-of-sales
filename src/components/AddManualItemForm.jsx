import React, { useState } from 'react';
import useCartStore from '../store/cartStore';
import { PlusCircle } from 'lucide-react';

const AddManualItemForm = () => {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const addToCart = useCartStore((state) => state.addToCart);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productName || !price) return;

    const manualItem = {
      id: `manual-${Date.now()}`,
      name: productName,
      price_pcs: parseFloat(price),
      stock_quantity: 'N/A',
      image_url: 'https://via.placeholder.com/150',
    };

    addToCart(manualItem);
    setProductName('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
      <h3 className="text-sm font-semibold mb-2 text-gray-700">Add Manual Item</h3>
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="Product Name"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
        </button>
      </div>
    </form>
  );
};

export default AddManualItemForm;
