import React, { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/priceFormatter';

const ProductCard = ({ product }) => {
  const { addToCart } = useCartStore();
  
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
      addToCart({ ...product, price: getPrice(), selectedUnit }, quantity);
      setQuantity(1);
    }
  };

  const step = selectedUnit === 'pcs' ? 1 : 0.1;

  return (
    <div className="bg-white rounded-lg shadow-md p-3 flex flex-col justify-between">
      <div>
        <div className="relative">
          <img
            src={product.image_url || 'https://via.placeholder.com/150'}
            alt={product.name}
            className="h-32 w-full object-cover rounded-md"
          />
          <span className="absolute top-2 right-2 bg-gray-100 bg-opacity-80 text-xs px-2 py-1 rounded-full">
            Stock: {product.stock}
          </span>
        </div>
        <div className="mt-2">
          <h3 className="font-semibold text-sm truncate">{product.name}</h3>
          {product.description && <p className="text-gray-500 text-xs truncate">{product.description}</p>}
          <p className="text-green-600 font-bold text-sm mt-1">
            {formatPrice(getPrice())}
            <span className="text-xs text-gray-400 font-normal ml-1">#{product.barcode}</span>
          </p>
        </div>
      </div>

      <div className="mt-2">
        <div className="flex items-center justify-center gap-1 mb-2">
          {product.price_kg && (
            <button onClick={() => setSelectedUnit('kg')} className={`px-3 py-1 text-xs rounded-full ${selectedUnit === 'kg' ? 'bg-green-200 text-green-800 font-bold' : 'bg-gray-100'}`}>Kg</button>
          )}
          {product.price_ons && (
            <button onClick={() => setSelectedUnit('ons')} className={`px-3 py-1 text-xs rounded-full ${selectedUnit === 'ons' ? 'bg-green-200 text-green-800 font-bold' : 'bg-gray-100'}`}>Ons</button>
          )}
          {product.price_pcs && (
            <button onClick={() => setSelectedUnit('pcs')} className={`px-3 py-1 text-xs rounded-full ${selectedUnit === 'pcs' ? 'bg-green-200 text-green-800 font-bold' : 'bg-gray-100'}`}>Pcs</button>
          )}
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center border rounded-md">
            <button onClick={() => handleQuantityChange(-step)} className="px-2 py-1 text-gray-600 bg-gray-100 rounded-l-md">-</button>
            <input
              type="number"
              value={quantity || ''}
              onChange={handleInputChange}
              className="w-12 text-center border-t border-b focus:ring-0 focus:border-gray-300"
              placeholder="1"
            />
            <button onClick={() => handleQuantityChange(step)} className="px-2 py-1 text-gray-600 bg-gray-100 rounded-r-md">+</button>
          </div>
          {quantity > 0 && <span className="text-sm font-medium text-gray-600">{selectedUnit}</span>}
        </div>

        <button 
          onClick={handleAddToCart}
          disabled={quantity <= 0}
          className="w-full mt-2 bg-green-600 text-white py-1.5 rounded-md flex items-center justify-center gap-2 disabled:bg-gray-300"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
