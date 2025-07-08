import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === product.id);

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
          toast.success(`${product.name} quantity updated`);
        } else {
          set({
            items: [...items, { ...product, quantity }],
          });
          toast.success(`${product.name} added to cart`);
        }
      },
      removeFromCart: (productId) => {
        set({
          items: get().items.filter((item) => item.id !== productId),
        });
        toast.error('Item removed from cart');
      },
      updateQuantity: (productId, selectedUnit, amount) => {
        set({
          items: get().items.map((item) =>
            item.id === productId && item.selectedUnit === selectedUnit
              ? { ...item, quantity: Math.max(0, item.quantity + amount) }
              : item
          ).filter(item => item.quantity > 0),
        });
      },
      updatePrice: (productId, selectedUnit, price) => {
        set({
          items: get().items.map((item) =>
            item.id === productId && item.selectedUnit === selectedUnit
              ? { ...item, price }
              : item
          ),
        });
      },
      clearCart: () => {
        set({ items: [] });
        toast.success('Cart cleared');
      },
      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      }
    }),
    {
      name: 'pos-cart-storage', // unique name
    }
  )
);

export default useCartStore;
