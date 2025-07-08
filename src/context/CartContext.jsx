import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { salesAPI } from '../services/api';
import toast from 'react-hot-toast';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity, selectedUnit } = action.payload;
      const existingItem = state.items.find(item => item.id === product.id && item.selectedUnit === selectedUnit);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === product.id && item.selectedUnit === selectedUnit
              ? { ...item, quantity: item.quantity + quantity, total: (item.quantity + quantity) * item.price }
              : item
          )
        };
      }
      
      const unitPrice = product[`price_${selectedUnit}`] || 0;
      const newItem = {
        id: product.id,
        name: product.name,
        price: unitPrice,
        quantity,
        selectedUnit,
        total: unitPrice * quantity,
        image_url: product.image_url,
      };
      return { ...state, items: [...state.items, newItem] };
    }
    
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => 
          !(item.id === action.payload.id && item.selectedUnit === action.payload.selectedUnit)
        )
      };
    
    case 'UPDATE_ITEM': {
      const { id, selectedUnit, updates } = action.payload;
      return {
        ...state,
        items: state.items.map(item => {
          if (item.id === id && item.selectedUnit === selectedUnit) {
            const updatedItem = { ...item, ...updates };
            updatedItem.total = updatedItem.quantity * updatedItem.price;
            return updatedItem;
          }
          return item;
        })
      };
    }
    
    case 'CLEAR_CART':
      return { ...state, items: [] };
    
    case 'LOAD_CART':
      return { ...state, items: action.payload };
    
    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  useEffect(() => {
    const savedCart = localStorage.getItem('pos-cart');
    if (savedCart) {
      dispatch({ type: 'LOAD_CART', payload: JSON.parse(savedCart) });
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pos-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product, quantity, selectedUnit) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity, selectedUnit } });
    toast.success(`${product.name} added to cart`);
  };

  const removeFromCart = (id, selectedUnit) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { id, selectedUnit } });
    toast.error('Item removed from cart');
  };

  const updateItem = (id, selectedUnit, updates) => {
    if (updates.quantity <= 0) {
      removeFromCart(id, selectedUnit);
    } else {
      dispatch({ type: 'UPDATE_ITEM', payload: { id, selectedUnit, updates } });
    }
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const processPayment = async () => {
    if (state.items.length === 0) {
      toast.error('Cart is empty');
      return false;
    }
    try {
      await salesAPI.create({ items: state.items });
      clearCart();
      return true;
    } catch (error) {
      console.error('Payment failed:', error);
      return false;
    }
  };

  const saveAsCredit = async (customer) => {
    if (state.items.length === 0) {
      toast.error('Cart is empty');
      return false;
    }
    try {
      await salesAPI.createCredit({ items: state.items, customer_id: customer.id });
      clearCart();
      return true;
    } catch (error) {
      console.error('Failed to save as credit:', error);
      return false;
    }
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + item.total, 0);
  };

  return (
    <CartContext.Provider value={{
      cart: state.items,
      addToCart,
      removeFromCart,
      updateItem,
      clearCart,
      processPayment,
      saveAsCredit,
      getCartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
