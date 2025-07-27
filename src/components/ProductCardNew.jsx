import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { formatPrice } from '../utils/priceFormatter';

const ProductCardNew = ({ product, onEdit, onDelete, getCategoryName, getCategoryColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col h-full">
      {/* Product Image */}
      <div className="relative mb-3">
        <img
          src={product.image_url || 'https://via.placeholder.com/150'}
          alt={product.name}
          className="w-full h-40 object-cover rounded-xl"
        />
      </div>
      
      {/* Product Info */}
      <div className="flex-1">
        {/* Product Name */}
        <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
        
        {/* Category Badge */}
        <div className="mb-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: getCategoryColor(product.category_id) }}
          >
            {getCategoryName(product.category_id)}
          </span>
        </div>
        
        {/* Price */}
        <p className="text-green-600 font-bold mb-2">
          {formatPrice(product[`price_${product.unit_type}`] || product.price_pcs || product.price_kg || product.price_ons || product.price_liter || 0)}
          <span className="text-xs text-gray-500 ml-1">/{product.unit_type || 'pcs'}</span>
        </p>
        
        {/* Stock */}
        <p className={`text-sm font-medium ${product.stock <= 5 ? 'text-red-600' : 'text-green-600'} mb-2`}>
          Stock: {product.stock}
        </p>
        
        {/* Barcode */}
        <p className="text-xs text-gray-500 mb-3">
          {product.barcode}
        </p>
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
        <button
          onClick={() => onEdit(product)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit product"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete product"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCardNew;