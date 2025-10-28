
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


// ============================================
// CART API - TEST DATA VỚI POSTMAN
// ============================================

// ============================================
// 1. GET /api/cart - LẤY GIỎ HÀNG
// ============================================
/*
Method: GET
URL: http://localhost:8080/api/cart
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Response (Success - 200):
{
  [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Laptop Dell XPS 13",
      "image": "https://via.placeholder.com/300x300?text=Dell+XPS",
      "price": 25000000,
      "discount": 2000000,
      "qty": 2,
      "total": 46000000
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "productName": "Chuột Logitech MX Master 3",
      "image": "https://via.placeholder.com/300x300?text=Logitech",
      "price": 2500000,
      "discount": 250000,
      "qty": 1,
      "total": 2250000
    }
  ]
}
*/


// ============================================
// 2. POST /api/cart/add - THÊM ITEM VÀO GIỎ
// ============================================
/*
Method: POST
URL: http://localhost:8080/api/cart/add
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Body (Raw - JSON):

{
  "productId": "507f1f77bcf86cd799439011",
  "productName": "Laptop Dell XPS 13",
  "image": "https://via.placeholder.com/300x300?text=Dell+XPS",
  "price": 25000000,
  "discount": 2000000,
  "qty": 1
}

/*
Response (Success - 200):
{
  "id": "64a7f1e8c1d2e3f4g5h6i7j8",
  "userId": "507f191e810c19729de860ea",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Laptop Dell XPS 13",
      "image": "https://via.placeholder.com/300x300?text=Dell+XPS",
      "price": 25000000,
      "discount": 2000000,
      "qty": 1,
      "total": 23000000
    }
  ],
  "createdAt": "2024-10-19T10:30:00",
  "updatedAt": "2024-10-19T10:30:00"
}


// Ví dụ thêm các sản phẩm khác:
// Điện thoại
{
  "productId": "507f1f77bcf86cd799439020",
  "productName": "iPhone 15 Pro Max",
  "image": "https://via.placeholder.com/300x300?text=iPhone+15",
  "price": 30000000,
  "discount": 3000000,
  "qty": 1
}

// Tai nghe
{
  "productId": "507f1f77bcf86cd799439021",
  "productName": "Sony WH-1000XM5",
  "image": "https://via.placeholder.com/300x300?text=Sony+Headset",
  "price": 8000000,
  "discount": 800000,
  "qty": 2
}

// Màn hình
{
  "productId": "507f1f77bcf86cd799439022",
  "productName": "LG UltraWide 34 inch",
  "image": "https://via.placeholder.com/300x300?text=LG+Monitor",
  "price": 12000000,
  "discount": 1000000,
  "qty": 1
}

// Bàn phím
{
  "productId": "507f1f77bcf86cd799439023",
  "productName": "Keychron K3 Pro",
  "image": "https://via.placeholder.com/300x300?text=Keychron",
  "price": 3500000,
  "discount": 350000,
  "qty": 1
}


// ============================================
// 3. PUT /api/cart/{productId} - CẬP NHẬT SỐ LƯỢNG
// ============================================
/*
Method: PUT
URL: http://localhost:8080/api/cart/507f1f77bcf86cd799439011
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Body (Raw - JSON):

{
  "qty": 3
}

/*
Ví dụ cập nhật số lượng khác:

{
  "qty": 5
}

/*
Response (Success - 200):
{
  "id": "64a7f1e8c1d2e3f4g5h6i7j8",
  "userId": "507f191e810c19729de860ea",
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "productName": "Laptop Dell XPS 13",
      "image": "https://via.placeholder.com/300x300?text=Dell+XPS",
      "price": 25000000,
      "discount": 2000000,
      "qty": 3,
      "total": 69000000
    }
  ],
  "updatedAt": "2024-10-19T10:35:00"
}
*/


// ============================================
// 4. DELETE /api/cart/{productId} - XÓA ITEM
// ============================================
/*
Method: DELETE
URL: http://localhost:8080/api/cart/507f1f77bcf86cd799439011
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Response (Success - 200):
{
  "id": "64a7f1e8c1d2e3f4g5h6i7j8",
  "userId": "507f191e810c19729de860ea",
  "items": [],
  "updatedAt": "2024-10-19T10:40:00"
}
*/


// ============================================
// 5. POST /api/cart/bulk-delete - XÓA NHIỀU ITEMS
// ============================================
/*
Method: POST
URL: http://localhost:8080/api/cart/bulk-delete
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Body (Raw - JSON):

{
  "ids": [
    "507f1f77bcf86cd799439011",
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013"
  ]
}

/*
Ví dụ xóa 2 items:

{
  "ids": [
    "507f1f77bcf86cd799439020",
    "507f1f77bcf86cd799439021"
  ]
}

/*
Response (Success - 200):
{
  "id": "64a7f1e8c1d2e3f4g5h6i7j8",
  "userId": "507f191e810c19729de860ea",
  "items": [],
  "updatedAt": "2024-10-19T10:45:00"
}
*/


// ============================================
// 6. DELETE /api/cart - XÓA TẤT CẢ ITEMS
// ============================================
/*
Method: DELETE
URL: http://localhost:8080/api/cart
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Body: (Để trống)

Response (Success - 200):
{
  "id": "64a7f1e8c1d2e3f4g5h6i7j8",
  "userId": "507f191e810c19729de860ea",
  "items": [],
  "updatedAt": "2024-10-19T10:50:00"
}
*/


// ============================================
// 7. GET /api/cart/subtotal - LẤY TỔNG TIỀN
// ============================================
/*
Method: GET
URL: http://localhost:8080/api/cart/subtotal
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Response (Success - 200):
{
  "subtotal": 92250000
}

Giải thích:
- 2 * (25000000 - 2000000) = 46000000 (Laptop)
- 1 * (2500000 - 250000) = 2250000 (Chuột)
- 2 * (8000000 - 800000) = 14400000 (Tai nghe)
- 1 * (12000000 - 1000000) = 11000000 (Màn hình)
- 1 * (3500000 - 350000) = 3150000 (Bàn phím)
Total = 76800000
*/


// ============================================
// 8. GET /api/cart/count - ĐẾM SỐ ITEMS
// ============================================
/*
Method: GET
URL: http://localhost:8080/api/cart/count
Headers:
  - Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  - Content-Type: application/json

Response (Success - 200):
{
  "count": 6
}

Giải thích:
- Laptop: qty 2
- Chuột: qty 1
- Tai nghe: qty 2
- Màn hình: qty 1
Total = 6 items
*/


// ============================================
// ERROR RESPONSES
// ============================================
/*
// 401 - User not authenticated
{
  "error": "User not authenticated"
}

// 400 - Invalid request
{
  "error": "Invalid quantity"
}

// 404 - Product not found
{
  "error": "Product not found in cart"
}


// ============================================
// POSTMAN ENVIRONMENT VARIABLES
// ============================================
/*
Thiết lập biến môi trường trong Postman:

1. Mở Environment
2. Tạo mới hoặc edit hiện tại
3. Thêm các biến:

VARIABLE NAME          | INITIAL VALUE | CURRENT VALUE
-------------------------------------------------
base_url              | http://localhost:8080 | http://localhost:8080
token                 | (paste your jwt token) | (paste your jwt token)
user_id               | 507f191e810c19729de860ea | (your user id)
product_id_1          | 507f1f77bcf86cd799439011 | 507f1f77bcf86cd799439011
product_id_2          | 507f1f77bcf86cd799439012 | 507f1f77bcf86cd799439012

Cách sử dụng:
- URL: {{base_url}}/api/cart
- Header: Authorization: Bearer {{token}}
*/


// ============================================
// COLLECTION TEST SEQUENCE
// ============================================
/*
Thứ tự test để kiểm tra đầy đủ:

1. POST /api/cart/add - Thêm Laptop
   Body: {"productId": "507f1f77bcf86cd799439011", ...}

2. POST /api/cart/add - Thêm Chuột
   Body: {"productId": "507f1f77bcf86cd799439012", ...}

3. POST /api/cart/add - Thêm Tai nghe
   Body: {"productId": "507f1f77bcf86cd799439021", ...}

4. GET /api/cart - Lấy giỏ hàng (verify có 3 items)

5. GET /api/cart/count - Đếm items (verify count)

6. GET /api/cart/subtotal - Lấy subtotal (verify tính toán)

7. PUT /api/cart/507f1f77bcf86cd799439011 - Update qty Laptop
   Body: {"qty": 3}

8. GET /api/cart - Lấy lại giỏ (verify qty thay đổi)

9. DELETE /api/cart/507f1f77bcf86cd799439012 - Xóa Chuột

10. GET /api/cart - Verify Chuột bị xóa

11. POST /api/cart/bulk-delete - Xóa nhiều items
    Body: {"ids": ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439021"]}

12. GET /api/cart - Verify giỏ rỗng

13. DELETE /api/cart - Clear cart (double check)
*/
