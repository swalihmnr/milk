import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  product: any; // Using any for simplicity here, matches API response
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  toast: { message: string; type: 'success' | 'error' | null } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('milkflow_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | null } | null>(null);

  useEffect(() => {
    localStorage.setItem('milkflow_cart', JSON.stringify(cart));
  }, [cart]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (product: any, quantity: number = 1) => {
    if (!product.isActive) {
      showToast('This product is currently unavailable.', 'error');
      return;
    }
    
    if (product.stockQuantity < quantity) {
      showToast(`Only ${product.stockQuantity} items left in stock.`, 'error');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product._id === product._id);
      if (existing) {
        if (existing.quantity + quantity > product.stockQuantity) {
          showToast(`Cannot add more. Stock limit reached.`, 'error');
          return prev;
        }
        showToast('Cart updated!', 'success');
        return prev.map(item => 
          item.product._id === product._id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      showToast('Added to cart!', 'success');
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product._id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prev => prev.map(item => {
      if (item.product._id === productId) {
        if (quantity > item.product.stockQuantity) {
          showToast(`Only ${item.product.stockQuantity} items available.`, 'error');
          return item;
        }
        return { ...item, quantity };
      }
      return item;
    }));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, toast }}>
      {children}
      
      {/* Global Toast UI */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-4">
          <div className={`px-4 py-3 rounded-xl shadow-lg border text-sm font-bold flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
