import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { CartItem, Product } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  loading: boolean;
  addToCart: (product: Product, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  checkout: () => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (user) {
      setLoading(true);
      const userCart = await api.getCart(user.id);
      setCart(userCart);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isAuthenticated, fetchCart]);

  const addToCart = async (product: Product, quantity: number) => {
    if (user) {
      const updatedCart = await api.addToCart(user.id, product, quantity);
      setCart(updatedCart);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (user) {
      const updatedCart = await api.removeFromCart(user.id, productId);
      setCart(updatedCart);
    }
  };
  
  const checkout = async (): Promise<boolean> => {
      if (user) {
          setLoading(true);
          const orders = await api.checkout(user.id);
          if (orders.length > 0) {
              setCart([]); // Clear cart on successful checkout
              setLoading(false);
              return true;
          }
          setLoading(false);
          return false;
      }
      return false;
  }

  return (
    <CartContext.Provider value={{ cart, loading, addToCart, removeFromCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};