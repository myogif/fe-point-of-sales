import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/priceFormatter';

const ProductListItem = ({ product }) => {
  const { addToCart } = useCart();
  
  const getInitialUnit = () => {
    if (product.price_kg) return 'kg';
    if (product.price_ons) return 'ons';
    if (product.price_pcs) return 'pcs';
    return 'pcs';
  };

  const [selectedUnit, setSelectedUnit] = useState(getInitialUnit());
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setQuantity(1);
  }, [selectedUnit]);

  const getPrice = () => {
    return product[`price_${selectedUnit}`] || 0;
  };

  const handleQuantityChange = (amount) => {
    let newQuantity = quantity + amount;
    if (selectedUnit !== 'pcs') {
      newQuantity = parseFloat(newQuantity.toFixed(2));
    }
    setQuantity(Math.max(0, newQuantity));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const newQuantity = parseFloat(value);
    if (value === '') {
      setQuantity(0);
    } else if (!isNaN(newQuantity) && newQuantity >= 0) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (quantity > 0) {
      addToCart(product, quantity, selectedUnit);
      setQuantity(1);
    }
  };

  const step = selectedUnit === 'pcs' ? 1 : 0.1;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-3 flex items-center">
      {/* Product Image */}
      <img
        src={product.image_url || 'https://via.placeholder.com/80'}
        alt={product.name}
        className="w-20 h-20 object-cover rounded-md mr-4"
      />
      
      {/* Product Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-800">{product.name}</h3>
        <div className="flex items-center mt-1">
          <span className={`text-sm ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'} mr-3`}>
            Stock: {product.stock}
          </span>
          <p className="text-green-600 font-bold">
            {formatPrice(getPrice())}
            <span className="text-xs text-gray-400 font-normal ml-1">/{selectedUnit}</span>
          </p>
        </div>
        
        {/* Unit Selection */}
        <div className="flex flex-wrap items-center gap-1 mt-2">
          {product.price_kg && (
            <button onClick={() => setSelectedUnit('kg')} className={`px-2 py-1 text-xs rounded-full ${selectedUnit === 'kg' ? 'bg-green-200 text-green-800 font-bold' : 'bg-gray-100'}`}>Kg</button>
          )}
          {product.price_ons && (
            <button onClick={() => setSelectedUnit('ons')} className={`px-2 py-1 text-xs rounded-full ${selectedUnit === 'ons' ? 'bg-green-200 text-green-800 font-bold' : 'bg-gray-100'}`}>Ons</button>
          )}
          {product.price_pcs && (
            <button onClick={() => setSelectedUnit('pcs')} className={`px-2 py-1 text-xs rounded-full ${selectedUnit === 'pcs' ? 'bg-green-200 text-green-800 font-bold' : 'bg-gray-100'}`}>Pcs</button>
          )}
        </div>
      </div>
      
      {/* Quantity and Add to Cart */}
      <div className="flex flex-col items-end">
        <div className="flex items-center border rounded-md mb-2">
          <button onClick={() => handleQuantityChange(-step)} className="px-2 py-1 text-gray-600 bg-gray-100 rounded-l-md">
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            value={quantity || ''}
            onChange={handleInputChange}
            className="w-12 text-center border-t border-b focus:ring-0 focus:border-gray-300"
            placeholder="1"
          />
          <button onClick={() => handleQuantityChange(step)} className="px-2 py-1 text-gray-600 bg-gray-100 rounded-r-md">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={handleAddToCart}
          disabled={quantity <= 0}
          className="bg-blue-600 text-white py-1.5 px-3 rounded-md flex items-center justify-center gap-1 disabled:bg-gray-300"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    </div>
  );
};

export default ProductListItem;