import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CustomPcProduct,
  getCustomPcById,
  DEFAULT_SHIPPING_CONFIG,
  ShippingConfig,
  calculatePcOrderPricing
} from '../utils/pricing.ts';
import { BuilderPart } from '../data/builderCatalog.ts';

export interface CartItem {
  pc: CustomPcProduct;
  buildServiceId: 'fast' | 'full';
  quantity: number;
}

export interface ComponentCartItem {
  part: BuilderPart;
  quantity: number;
}

interface CartContextType {
  cartItem: CartItem | null;
  componentItems: ComponentCartItem[];
  totalItemCount: number;
  buildServiceId: 'fast' | 'full';
  deliveryMethodId: 'pickup' | 'normal' | 'express';
  shippingConfig: ShippingConfig;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (pcId: string, buildServiceId?: 'fast' | 'full', openDrawer?: boolean) => void;
  updatePcQuantity: (quantity: number) => void;
  removeFromCart: () => void;
  addComponentToCart: (part: BuilderPart, quantity?: number) => void;
  updateComponentQty: (partId: string, quantity: number) => void;
  removeComponentFromCart: (partId: string) => void;
  clearCart: () => void;
  updateBuildService: (buildServiceId: 'fast' | 'full') => void;
  updateDeliveryMethod: (deliveryMethodId: 'pickup' | 'normal' | 'express') => void;
  pricing: ReturnType<typeof calculatePcOrderPricing> | null;
  refreshShippingConfig: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY_PC = 'qtr_cart_pc_id';
const STORAGE_KEY_PC_QTY = 'qtr_cart_pc_qty';
const STORAGE_KEY_BUILD = 'qtr_cart_build_id';
const STORAGE_KEY_DELIVERY = 'qtr_cart_delivery_id';
const STORAGE_KEY_COMPONENTS = 'qtr_cart_components';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pcId, setPcId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_PC) || null;
    } catch {
      return null;
    }
  });

  const [pcQuantity, setPcQuantity] = useState<number>(() => {
    try {
      const q = Number(localStorage.getItem(STORAGE_KEY_PC_QTY) || '1');
      return q >= 1 ? q : 1;
    } catch {
      return 1;
    }
  });

  const [componentItems, setComponentItems] = useState<ComponentCartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_COMPONENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [buildServiceId, setBuildServiceId] = useState<'fast' | 'full'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_BUILD);
      return stored === 'full' ? 'full' : 'fast';
    } catch {
      return 'fast';
    }
  });

  const [deliveryMethodId, setDeliveryMethodId] = useState<'pickup' | 'normal' | 'express'>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_DELIVERY);
      if (stored === 'normal' || stored === 'express' || stored === 'pickup') return stored;
      return 'pickup';
    } catch {
      return 'pickup';
    }
  });

  const [shippingConfig, setShippingConfig] = useState<ShippingConfig>(DEFAULT_SHIPPING_CONFIG);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const refreshShippingConfig = async () => {
    try {
      const res = await fetch('/api/config/shipping');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.config) {
          setShippingConfig(data.config);
        }
      }
    } catch (err) {
      console.warn('Could not load shipping config from server, using defaults', err);
    }
  };

  useEffect(() => {
    refreshShippingConfig();
  }, []);

  const persistComponents = (items: ComponentCartItem[]) => {
    setComponentItems(items);
    try {
      localStorage.setItem(STORAGE_KEY_COMPONENTS, JSON.stringify(items));
    } catch {}
  };

  const addToCart = (newPcId: string, preferredBuildService: 'fast' | 'full' = 'fast', openDrawer = false) => {
    setPcId(newPcId);
    setPcQuantity(1);
    setBuildServiceId(preferredBuildService);
    try {
      localStorage.setItem(STORAGE_KEY_PC, newPcId);
      localStorage.setItem(STORAGE_KEY_PC_QTY, '1');
      localStorage.setItem(STORAGE_KEY_BUILD, preferredBuildService);
    } catch {}
    if (openDrawer) setIsCartOpen(true);
  };

  const updatePcQuantity = (qty: number) => {
    if (qty <= 0) {
      removeFromCart();
      return;
    }
    setPcQuantity(qty);
    try {
      localStorage.setItem(STORAGE_KEY_PC_QTY, String(qty));
    } catch {}
  };

  const removeFromCart = () => {
    setPcId(null);
    setPcQuantity(1);
    try {
      localStorage.removeItem(STORAGE_KEY_PC);
      localStorage.removeItem(STORAGE_KEY_PC_QTY);
      localStorage.removeItem(STORAGE_KEY_BUILD);
    } catch {}
  };

  const addComponentToCart = (part: BuilderPart, quantity = 1) => {
    const existing = componentItems.find((i) => i.part.id === part.id);
    if (existing) {
      persistComponents(
        componentItems.map((i) => (i.part.id === part.id ? { ...i, quantity: i.quantity + quantity } : i))
      );
    } else {
      persistComponents([...componentItems, { part, quantity }]);
    }
  };

  const updateComponentQty = (partId: string, quantity: number) => {
    if (quantity <= 0) {
      removeComponentFromCart(partId);
      return;
    }
    persistComponents(componentItems.map((i) => (i.part.id === partId ? { ...i, quantity } : i)));
  };

  const removeComponentFromCart = (partId: string) => {
    persistComponents(componentItems.filter((i) => i.part.id !== partId));
  };

  const clearCart = () => {
    removeFromCart();
    persistComponents([]);
  };

  const updateBuildService = (newServiceId: 'fast' | 'full') => {
    setBuildServiceId(newServiceId);
    try {
      localStorage.setItem(STORAGE_KEY_BUILD, newServiceId);
    } catch {}
  };

  const updateDeliveryMethod = (newDeliveryId: 'pickup' | 'normal' | 'express') => {
    setDeliveryMethodId(newDeliveryId);
    try {
      localStorage.setItem(STORAGE_KEY_DELIVERY, newDeliveryId);
    } catch {}
  };

  const selectedPc = pcId ? getCustomPcById(pcId) : null;

  const cartItem: CartItem | null = selectedPc
    ? {
        pc: selectedPc,
        buildServiceId,
        quantity: pcQuantity
      }
    : null;

  const pricing = selectedPc
    ? calculatePcOrderPricing(selectedPc, buildServiceId, deliveryMethodId, shippingConfig)
    : null;

  const totalItemCount =
    (cartItem ? cartItem.quantity : 0) + componentItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItem,
        componentItems,
        totalItemCount,
        buildServiceId,
        deliveryMethodId,
        shippingConfig,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        addToCart,
        updatePcQuantity,
        removeFromCart,
        addComponentToCart,
        updateComponentQty,
        removeComponentFromCart,
        clearCart,
        updateBuildService,
        updateDeliveryMethod,
        pricing,
        refreshShippingConfig
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
