"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { cartApi, type Cart, type CartItem } from "@/services/cart.api";
import { toast } from "react-hot-toast";

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<boolean>;
  updateCartItem: (itemId: string, quantity: number) => Promise<void>;
  removeCartItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      // Check if user is logged in
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (!token) {
        setCart(null);
        setCartCount(0);
        setLoading(false);
        return;
      }

      const response = await cartApi.getCart();
      if (response.success && response.data.cart) {
        setCart(response.data.cart);
        const totalCount = response.data.cart.items.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        setCartCount(totalCount);
      }
    } catch (error: any) {
      // If 401 or not authenticated, clear cart
      if (error?.response?.status === 401) {
        setCart(null);
        setCartCount(0);
      }
      // Don't show error toast for unauthenticated users
      if (error?.response?.status !== 401) {
        console.error("Error fetching cart:", error);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCount = useCallback(async () => {
    try {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (!token) {
        setCartCount(0);
        return;
      }

      const response = await cartApi.getCount();
      if (response.success) {
        setCartCount(response.data.count);
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setCartCount(0);
      }
    }
  }, []);

  const addToCart = useCallback(
    async (productId: string, quantity: number): Promise<boolean> => {
      try {
        const response = await cartApi.addItem(productId, quantity);
        if (response.success) {
          // Refresh cart and count
          await refreshCart();
          await refreshCount();
          toast.success("Product added to cart!");
          return true;
        }
        return false;
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to add product to cart";
        toast.error(errorMessage);
        return false;
      }
    },
    [refreshCart, refreshCount]
  );

  const updateCartItem = useCallback(
    async (itemId: string, quantity: number) => {
      try {
        const response = await cartApi.updateItem(itemId, quantity);
        if (response.success) {
          await refreshCart();
          await refreshCount();
        }
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to update cart item";
        toast.error(errorMessage);
        throw error;
      }
    },
    [refreshCart, refreshCount]
  );

  const removeCartItem = useCallback(
    async (itemId: string) => {
      try {
        await cartApi.removeItem(itemId);
        await refreshCart();
        await refreshCount();
        toast.success("Item removed from cart");
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message || "Failed to remove item from cart";
        toast.error(errorMessage);
        throw error;
      }
    },
    [refreshCart, refreshCount]
  );

  const clearCart = useCallback(async () => {
    try {
      await cartApi.clearCart();
      await refreshCart();
      await refreshCount();
      toast.success("Cart cleared");
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || "Failed to clear cart";
      toast.error(errorMessage);
      throw error;
    }
  }, [refreshCart, refreshCount]);

  // Load cart on mount and when auth state changes
  useEffect(() => {
    refreshCart();
    refreshCount();

    // Listen for auth state changes
    const handleAuthChange = () => {
      refreshCart();
      refreshCount();
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("authStateChanged", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [refreshCart, refreshCount]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        refreshCart,
        addToCart,
        updateCartItem,
        removeCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
