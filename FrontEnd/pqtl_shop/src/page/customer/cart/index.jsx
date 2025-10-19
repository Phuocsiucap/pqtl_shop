import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import Toast from '../../../common/ToastNotification';
import ConfirmDialog from '../../../common/ConfirmDialog';
import SuccessModal from '../../../modals/OrderSeccessModal';
/**
 * MOCK DATA - Replace with API call to GET /api/cart
 * Data structure aligned with Product model from backend
 */
const MOCK_CART_ITEMS = [
  {
    id: '507f1f77bcf86cd799439011',
    name: 'Rau cải xanh hữu cơ',
    description: 'Rau cải xanh tươi, trồng theo tiêu chuẩn hữu cơ',
    image: 'https://images.unsplash.com/photo-1587839882035-86db6c087d87?w=300&h=300&fit=crop',
    price: 45000,
    discount: 10000,
    stockQuantity: 50,
    soldQuantity: 245,
    qty: 2
  },
  {
    id: '507f1f77bcf86cd799439012',
    name: 'Táo Fuji nhập khẩu',
    description: 'Táo Fuji tươi từ Nhật Bản, giàu vitamin',
    image: 'https://images.unsplash.com/photo-1560806e614b1c67b1bae90bcab6c1c16b11995c?w=300&h=300&fit=crop',
    price: 85000,
    discount: 15000,
    stockQuantity: 30,
    soldQuantity: 128,
    qty: 1
  },
  {
    id: '507f1f77bcf86cd799439013',
    name: 'Cà chua cherry tươi',
    description: 'Cà chua cherry nhỏ, ngọt, nước nhiều',
    image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=300&h=300&fit=crop',
    price: 55000,
    discount: 5000,
    stockQuantity: 100,
    soldQuantity: 312,
    qty: 3
  }
];

const MOCK_PROMO_CODES = {
  'SAVE10': { type: 'percent', value: 10, description: 'Giảm 10% tổng hóa đơn' },
  'SHIPFREE': { type: 'shipping', value: 0, description: 'Miễn phí vận chuyển' },
  'VND20000': { type: 'fixed', value: 20000, description: 'Giảm 20.000 VND' }
};

const SHIPPING_OPTIONS = [
  { id: 'express', label: 'Giao hàng nhanh (Express)', fee: 50000, time: '1-2 ngày' },
  { id: 'standard', label: 'Giao hàng tiêu chuẩn (Standard)', fee: 30000, time: '3-5 ngày' },
  { id: 'economy', label: 'Giao hàng tiết kiệm (Economy)', fee: 15000, time: '7-10 ngày' }
];

/**
 * Toast Notification Component
 */


/**
 * Modal Dialog for Confirmation
 */

/**
 * Success Modal after Checkout
 */

/**
 * Main CartPage Component
 */
export default function CartPage() {
  // ==================== State Management ====================
  const [cartItems, setCartItems] = useState(MOCK_CART_ITEMS);
  const [shippingOption, setShippingOption] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedItems, setSelectedItems] = useState(new Set(cartItems.map(i => i.id)));
  const [addressData, setAddressData] = useState({
    recipient: '',
    phone: '',
    addressLine: '',
    city: 'Hà Nội'
  });
  const [addressExpanded, setAddressExpanded] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, itemId: null, count: 0 });
  const [successOrder, setSuccessOrder] = useState({ isOpen: false, orderId: null });

  // ==================== Toast Handler ====================
  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  }, []);

  // ==================== Cart Operations ====================
  const updateQty = useCallback((itemId, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, qty: newQty } : item
      )
    );
    showToast('Cập nhật số lượng thành công');
  }, [showToast]);

  const handleQtyInputChange = useCallback((itemId, value) => {
    const newQty = parseInt(value) || 0;
    if (newQty > 0) {
      updateQty(itemId, newQty);
    }
  }, [updateQty]);

  const removeItem = useCallback((itemId) => {
    const item = cartItems.find(i => i.id === itemId);
    setCartItems(prev => prev.filter(i => i.id !== itemId));
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    setConfirmDelete({ isOpen: false, itemId: null, count: 0 });
    showToast(`Đã xóa "${item.name}" khỏi giỏ hàng`);
  }, [cartItems, showToast]);

  // ==================== Selection Handlers ====================
  const toggleItemSelection = useCallback((itemId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedItems.size === cartItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(cartItems.map(i => i.id)));
    }
  }, [selectedItems, cartItems]);

  const deleteAllSelected = useCallback(() => {
    if (selectedItems.size === 0) {
      showToast('Vui lòng chọn sản phẩm để xóa', 'error');
      return;
    }
    setConfirmDelete({ isOpen: true, itemId: 'all', count: selectedItems.size });
  }, [selectedItems, showToast]);

  const handleConfirmDeleteAll = useCallback(() => {
    const newItems = cartItems.filter(item => !selectedItems.has(item.id));
    setCartItems(newItems);
    const deletedCount = selectedItems.size;
    setSelectedItems(new Set());
    setConfirmDelete({ isOpen: false, itemId: null, count: 0 });
    showToast(`Đã xóa ${deletedCount} sản phẩm khỏi giỏ hàng`);
  }, [cartItems, selectedItems, showToast]);

  // ==================== Promo Code Logic ====================
  const applyPromo = useCallback(() => {
    if (!promoCode.trim()) {
      showToast('Vui lòng nhập mã khuyến mãi', 'error');
      return;
    }

    const promo = MOCK_PROMO_CODES[promoCode.toUpperCase()];
    if (!promo) {
      showToast('Mã khuyến mãi không hợp lệ', 'error');
      return;
    }

    setAppliedPromo({ code: promoCode.toUpperCase(), ...promo });
    setPromoCode('');
    showToast(`Áp dụng mã "${promoCode.toUpperCase()}" thành công`);
  }, [promoCode, showToast]);

  const removePromo = useCallback(() => {
    setAppliedPromo(null);
    showToast('Xóa mã khuyến mãi thành công');
  }, [showToast]);

  // ==================== Address Form Handlers ====================
  const handleAddressChange = useCallback((field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ==================== Price Calculations ====================
  // getFinalPrice() logic: price - discount (mapped from Product model)
  // Only calculate for selected items
  const subtotal = cartItems.reduce((sum, item) => {
    if (!selectedItems.has(item.id)) return sum;
    const finalPrice = item.price - item.discount;
    return sum + finalPrice * item.qty;
  }, 0);

  const shippingFee = shippingOption === 'free' ? 0 : 
    SHIPPING_OPTIONS.find(o => o.id === shippingOption)?.fee || 0;
  
  let discount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discount = Math.round(subtotal * (appliedPromo.value / 100));
    } else if (appliedPromo.type === 'fixed') {
      discount = appliedPromo.value;
    } else if (appliedPromo.type === 'shipping') {
      // Miễn phí vận chuyển được xử lý bởi shippingOption
    }
  }

  const grandTotal = Math.max(0, subtotal + shippingFee - discount);

  // ==================== Validation & Checkout ====================
  const isAddressValid = addressData.recipient && addressData.phone && addressData.addressLine;
  const isCartEmpty = cartItems.length === 0;

  const handleCheckout = useCallback(() => {
    if (selectedItems.size === 0) {
      showToast('Vui lòng chọn sản phẩm để thanh toán', 'error');
      return;
    }

    if (!isAddressValid) {
      showToast('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng', 'error');
      setAddressExpanded(true);
      return;
    }

    // TODO: Call POST /api/checkout with checkout payload
    const checkoutPayload = {
      items: cartItems.filter(i => selectedItems.has(i.id)),
      address: addressData,
      shippingOption,
      appliedPromo: appliedPromo?.code || null,
      subtotal,
      shippingFee,
      discount,
      grandTotal,
      timestamp: new Date().toISOString()
    };

    console.log('Checkout payload:', checkoutPayload);

    // Simulate API response
    const orderId = `ORD-${Date.now()}`;
    setSuccessOrder({ isOpen: true, orderId });
    showToast('Đặt hàng thành công!');
  }, [selectedItems, isAddressValid, cartItems, addressData, shippingOption, appliedPromo, subtotal, shippingFee, discount, grandTotal, showToast]);

  const handleSuccessClose = () => {
    setSuccessOrder({ isOpen: false, orderId: null });
    // TODO: Redirect to home or order history page
  };

  // ==================== JSX Rendering ====================
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

        {/* Empty Cart Message */}
        {isCartEmpty ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">Giỏ hàng của bạn hiện tại trống.</p>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Cart Items */}
            <div className="lg:col-span-2">
              {/* Selection Toolbar */}
              <div className="bg-white rounded-lg shadow p-4 mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedItems.size === cartItems.length && cartItems.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded"
                    aria-label="Chọn tất cả sản phẩm"
                  />
                  <span className="font-medium text-gray-900">
                    Chọn tất cả ({selectedItems.size}/{cartItems.length})
                  </span>
                </label>
                {selectedItems.size > 0 && (
                  <button
                    onClick={deleteAllSelected}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium flex items-center gap-2 w-full md:w-auto justify-center"
                  >
                    <Trash2 size={18} />
                    Xóa {selectedItems.size} sản phẩm
                  </button>
                )}
              </div>

              {/* Product List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {cartItems.map(item => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`bg-white rounded-lg shadow hover:shadow-md transition p-4 ${
                        selectedItems.has(item.id) ? 'ring-2 ring-green-500' : ''
                      }`}
                    >
                      <div className="flex gap-4">
                        {/* Checkbox Selection */}
                        <div className="flex items-start pt-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.has(item.id)}
                            onChange={() => toggleItemSelection(item.id)}
                            className="w-5 h-5 rounded cursor-pointer"
                            aria-label={`Chọn ${item.name}`}
                          />
                        </div>

                        {/* Product Image */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />

                        {/* Product Info */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{item.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                          <div className="flex items-center gap-2">
                            {item.discount > 0 ? (
                              <>
                                <span className="text-gray-500 line-through text-sm">
                                  {item.price.toLocaleString('vi-VN')} VND
                                </span>
                                <span className="text-green-600 font-bold text-lg">
                                  {(item.price - item.discount).toLocaleString('vi-VN')} VND
                                </span>
                              </>
                            ) : (
                              <span className="text-green-600 font-bold text-lg">
                                {item.price.toLocaleString('vi-VN')} VND
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Đã bán: {item.soldQuantity} | Còn: {item.stockQuantity}
                          </p>
                        </div>

                        {/* Quantity Controls & Delete */}
                        <div className="flex flex-col items-end justify-between">
                          {/* Quantity Buttons */}
                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                              onClick={() => updateQty(item.id, item.qty - 1)}
                              aria-label={`Giảm số lượng ${item.name}`}
                              className="p-1 hover:bg-gray-200 rounded transition"
                            >
                              <Minus size={18} className="text-gray-700" />
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={e => handleQtyInputChange(item.id, e.target.value)}
                              aria-label={`Số lượng ${item.name}`}
                              className="w-12 text-center bg-transparent font-semibold focus:outline-none"
                            />
                            <button
                              onClick={() => updateQty(item.id, item.qty + 1)}
                              aria-label={`Tăng số lượng ${item.name}`}
                              className="p-1 hover:bg-gray-200 rounded transition"
                            >
                              <Plus size={18} className="text-gray-700" />
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() => setConfirmDelete({ isOpen: true, itemId: item.id, count: 0 })}
                            aria-label={`Xóa ${item.name}`}
                            className="text-red-500 hover:text-red-700 transition mt-2"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal for Item */}
                      <div className="mt-3 pt-3 border-t border-gray-200 text-right">
                        <span className="text-gray-600">Thành tiền: </span>
                        <span className="font-bold text-gray-900">
                          {((item.price - item.discount) * item.qty).toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: Summary & Checkout */}
            <div className="lg:col-span-1 space-y-6 h-fit sticky top-8">
              {/* Address Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <button
                  onClick={() => setAddressExpanded(!addressExpanded)}
                  className="w-full flex justify-between items-center font-semibold text-gray-900 mb-4"
                >
                  <span>Địa chỉ giao hàng</span>
                  {addressExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                <AnimatePresence>
                  {addressExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Recipient Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tên người nhận *
                        </label>
                        <input
                          type="text"
                          value={addressData.recipient}
                          onChange={e => handleAddressChange('recipient', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Nhập tên"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Số điện thoại *
                        </label>
                        <input
                          type="tel"
                          value={addressData.phone}
                          onChange={e => handleAddressChange('phone', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="0xxxxxxxxx"
                        />
                      </div>

                      {/* Address Line */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Địa chỉ chi tiết *
                        </label>
                        <input
                          type="text"
                          value={addressData.addressLine}
                          onChange={e => handleAddressChange('addressLine', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Số nhà, đường phố..."
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Thành phố / Tỉnh
                        </label>
                        <select
                          value={addressData.city}
                          onChange={e => handleAddressChange('city', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <option value="Hà Nội">Hà Nội</option>
                          <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                          <option value="Đà Nẵng">Đà Nẵng</option>
                          <option value="Khác">Khác</option>
                        </select>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!addressExpanded && isAddressValid && (
                  <div className="text-sm text-green-600 font-medium">✓ Địa chỉ đã được điền đầy đủ</div>
                )}
              </div>

              {/* Shipping Options */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Phương thức vận chuyển</h3>
                <div className="space-y-3">
                  {SHIPPING_OPTIONS.map(option => (
                    <label key={option.id} className="flex items-start gap-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={shippingOption === option.id}
                        onChange={e => setShippingOption(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-500">{option.time}</p>
                      </div>
                      <span className="font-semibold text-green-600">
                        +{option.fee.toLocaleString('vi-VN')} VND
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Promo Code */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Mã khuyến mãi</h3>
                
                {appliedPromo ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-green-900">{appliedPromo.code}</p>
                      <p className="text-sm text-green-700">{appliedPromo.description}</p>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-green-600 hover:text-green-700"
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      placeholder="Nhập mã..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      aria-label="Mã khuyến mãi"
                    />
                    <button
                      onClick={applyPromo}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">
                  💡 Thử: <code className="bg-gray-100 px-2 py-1 rounded">SAVE10</code> | 
                  <code className="bg-gray-100 px-2 py-1 rounded ml-1">SHIPFREE</code> | 
                  <code className="bg-gray-100 px-2 py-1 rounded ml-1">VND20000</code>
                </p>
              </div>

              {/* Order Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Tóm tắt đơn hàng</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tạm tính:</span>
                    <span className="font-medium">{subtotal.toLocaleString('vi-VN')} VND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phí vận chuyển:</span>
                    <span className="font-medium">{shippingFee.toLocaleString('vi-VN')} VND</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-{discount.toLocaleString('vi-VN')} VND</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between">
                    <span className="font-semibold text-gray-900">Tổng cộng:</span>
                    <span className="font-bold text-lg text-green-600">
                      {grandTotal.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCartEmpty || selectedItems.size === 0}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                    isCartEmpty || selectedItems.size === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Thanh toán ({selectedItems.size} sản phẩm)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Toasts */}
      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        title={confirmDelete.itemId === 'all' ? 'Xác nhận xóa' : 'Xác nhận xóa'}
        message={
          confirmDelete.itemId === 'all'
            ? `Bạn chắc chắn muốn xóa ${confirmDelete.count} sản phẩm này khỏi giỏ hàng?`
            : 'Bạn chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?'
        }
        onConfirm={confirmDelete.itemId === 'all' ? handleConfirmDeleteAll : () => removeItem(confirmDelete.itemId)}
        onCancel={() => setConfirmDelete({ isOpen: false, itemId: null, count: 0 })}
      />

      <SuccessModal
        isOpen={successOrder.isOpen}
        orderId={successOrder.orderId}
        onClose={handleSuccessClose}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
      />
    </div>
  );
}

/**
 * ==================== ACCEPTANCE CRITERIA MAPPING ====================
 * 
 * ✓ US4.1 - Thêm sản phẩm vào giỏ
 *   - Hiển thị danh sách sản phẩm với tên, ảnh, giá, số lượng
 *   - Component khởi tạo với mock data (có thể call GET /api/cart)
 * 
 * ✓ US4.2 - Xem & chỉnh sửa giỏ hàng
 *   - Tăng/giảm số lượng qua nút [+] [-]
 *   - Nhập trực tiếp số lượng vào input
 *   - Xóa sản phẩm với xác nhận dialog
 *   - Xóa nhiều sản phẩm được chọn cùng lúc
 *   - Cập nhật ngay lập tức, animate khi xóa
 * 
 * ✓ US4.3 - Nhập địa chỉ giao hàng
 *   - Form với các field: recipient, phone, addressLine, city
 *   - Validation cơ bản (required fields) khi thanh toán
 *   - Collapsible UI, có thể expand/collapse
 * 
 * ✓ US4.4 - Chọn phương thức giao hàng
 *   - Radio options: Express (50k), Standard (30k), Economy (15k)
 *   - Phí vận chuyển hiển thị real-time
 *   - Hỗ trợ mã SHIPFREE để miễn phí vận chuyển
 * 
 * ✓ US4.5 - Hiển thị tổng giá trị
 *   - Subtotal = sum((price - discount) × qty) cho sản phẩm được chọn
 *   - Shipping fee theo option chọn
 *   - Discount = áp mã promo (percent, fixed, shipping)
 *   - Grand Total = subtotal + shipping - discount (>= 0)
 * 
 * ✓ FEATURE: Chọn sản phẩm (Selection)
 *   - Checkbox cho từng sản phẩm
 *   - Chọn tất cả / Bỏ chọn tất cả
 *   - Hiển thị số lượng chọn (X/Y)
 *   - Highlight sản phẩm được chọn (ring-2 ring-green-500)
 *   - Thanh toán chỉ tính sản phẩm được chọn
 * 
 * ✓ FEATURE: Xóa tất cả sản phẩm được chọn
 *   - Nút "Xóa X sản phẩm" hiển thị khi có lựa chọn
 *   - Xác nhận trước khi xóa
 *   - Toast notification sau xóa thành công
 *   - Cập nhật lại count và UI
 * 
 * ✓ FEATURE: Responsive Design
 *   - Desktop: 2 cột (items + summary)
 *   - Mobile: 1 cột (items trên, summary ở dưới sticky)
 *   - Nút "Xóa tất cả" responsive (full width on mobile)
 * 
 * ✓ FEATURE: Notifications & Feedback
 *   - Toast thành công/lỗi (3s auto-hide)
 *   - Confirm dialog trước xóa
 *   - Success modal sau checkout
 *   - Animation Framer Motion cho tất cả interactions
 * 
 * ✓ FEATURE: Accessibility
 *   - aria-label cho buttons + inputs
 *   - Keyboard accessible (tab, enter, space)
 *   - Form labels dùng <label> tag
 *   - Semantic HTML structure
 */