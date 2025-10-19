
// FILE: src/context/CartContext.jsx
import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { cartService, promoService, orderService } from '../services/cartService';

const CartContext = createContext(null);

const initialState = {
  items: [],
  selected: new Set(),
  loading: false,
  error: null,
  appliedPromo: null,
  shippingOption: 'standard',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_CART':
      return { ...state, loading: false, items: action.payload, selected: new Set(action.payload.map(i => i.id)) };
    case 'SET_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'UPDATE_QTY':
      return { ...state, items: state.items.map(it => it.id === action.payload.id ? { ...it, qty: action.payload.qty } : it) };
    case 'REMOVE_ITEMS':
      return { ...state, items: state.items.filter(it => !action.payload.includes(it.id)), selected: new Set() };
    case 'TOGGLE_SELECT': {
      const s = new Set(state.selected);
      if (s.has(action.payload)) s.delete(action.payload); else s.add(action.payload);
      return { ...state, selected: s };
    }
    case 'SELECT_ALL':
      return { ...state, selected: new Set(state.items.map(i => i.id)) };
    case 'CLEAR_SELECTED':
      return { ...state, selected: new Set() };
    case 'APPLY_PROMO':
      return { ...state, appliedPromo: action.payload };
    case 'SET_SHIPPING':
      return { ...state, shippingOption: action.payload };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const loadCart = useCallback(async () => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await cartService.getCart();
      const normalized = (data || []).map(i => ({ ...i, qty: i.qty || 1 }));
      dispatch({ type: 'SET_CART', payload: normalized });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message || 'Không thể tải giỏ hàng' });
    }
  }, []);

  useEffect(() => { loadCart(); }, [loadCart]);

  const updateQty = useCallback(async (itemId, qty) => {
    await cartService.updateItemQty(itemId, qty);
    dispatch({ type: 'UPDATE_QTY', payload: { id: itemId, qty } });
  }, []);

  const removeItems = useCallback(async (ids) => {
    if (ids.length === 1) await cartService.removeItem(ids[0]);
    else await cartService.clearSelected(ids);
    dispatch({ type: 'REMOVE_ITEMS', payload: ids });
  }, []);

  const applyPromo = useCallback(async (code) => {
    const promo = await promoService.validateCode(code);
    dispatch({ type: 'APPLY_PROMO', payload: promo });
  }, []);

  const checkout = useCallback(async (payload) => {
    const res = await orderService.checkout(payload);
    await loadCart();
    return res;
  }, [loadCart]);

  const toggleSelect = useCallback((id) => dispatch({ type: 'TOGGLE_SELECT', payload: id }), []);
  const selectAll = useCallback(() => dispatch({ type: 'SELECT_ALL' }), []);
  const clearSelected = useCallback(() => dispatch({ type: 'CLEAR_SELECTED' }), []);
  const setShipping = useCallback((opt) => dispatch({ type: 'SET_SHIPPING', payload: opt }), []);

  const subtotal = state.items.reduce((s, it) => state.selected.has(it.id) ? s + (it.price - (it.discount || 0)) * it.qty : s, 0);
  const shippingFee = state.shippingOption === 'free' ? 0 : ({ express: 50000, standard: 30000, economy: 15000 }[state.shippingOption] || 0);

  let discount = 0;
  if (state.appliedPromo) {
    if (state.appliedPromo.type === 'percent') discount = Math.round(subtotal * (state.appliedPromo.value / 100));
    else if (state.appliedPromo.type === 'fixed') discount = state.appliedPromo.value;
  }

  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  return (
    <CartContext.Provider value={{ state, dispatch, loadCart, updateQty, removeItems, applyPromo, checkout, toggleSelect, selectAll, clearSelected, setShipping, subtotal, shippingFee, discount, grandTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCartContext = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCartContext must be used inside CartProvider');
  return ctx;
}
