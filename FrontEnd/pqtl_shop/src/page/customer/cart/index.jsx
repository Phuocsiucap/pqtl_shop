import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Trash2, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { useCartContext } from '../../../context/CartContext';
import Toast from '../../../common/ToastNotification';
import ConfirmDialog from '../../../common/ConfirmDialog';
import SuccessModal from '../../../modals/OrderSeccessModal';

const SHIPPING_OPTIONS = [
  { id: 'express', label: 'Giao hàng nhanh (Express)', fee: 50000, time: '1-2 ngày' },
  { id: 'standard', label: 'Giao hàng tiêu chuẩn (Standard)', fee: 30000, time: '3-5 ngày' },
  { id: 'economy', label: 'Giao hàng tiết kiệm (Economy)', fee: 15000, time: '7-10 ngày' }
];

/**
 * Main CartPage Component - Integrated with CartContext
 */
export default function CartPage() {
  // ==================== Context Integration ====================
  const {
    state,
    updateQty,
    removeItems,
    applyPromo,
    checkout,
    toggleSelect,
    selectAll,
    clearSelected,
    setShipping,
    subtotal,
    shippingFee,
    discount,
    grandTotal
  } = useCartContext();

  const { items: cartItems, selected: selectedItems, loading, error, appliedPromo, shippingOption } = state;

  // ==================== Local State ====================
  const [promoCode, setPromoCode] = useState('');
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
  const handleUpdateQty = useCallback(async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateQty(itemId, newQty);
      showToast('Cập nhật số lượng thành công');
    } catch (err) {
      showToast(err.message || 'Không thể cập nhật số lượng', 'error');
    }
  }, [updateQty, showToast]);

  const handleQtyInputChange = useCallback((itemId, value) => {
    const newQty = parseInt(value) || 0;
    if (newQty > 0) {
      handleUpdateQty(itemId, newQty);
    }
  }, [handleUpdateQty]);

  const handleRemoveItem = useCallback(async (itemId) => {
    const item = cartItems.find(i => i.productId === itemId);
    try {
      await removeItems([itemId]);
      setConfirmDelete({ isOpen: false, itemId: null, count: 0 });
      showToast(`Đã xóa "${item?.productName || 'sản phẩm'}" khỏi giỏ hàng`);
    } catch (err) {
      showToast(err.message || 'Không thể xóa sản phẩm', 'error');
    }
  }, [cartItems, removeItems, showToast]);

  // ==================== Selection Handlers ====================
  const handleToggleSelectAll = useCallback(() => {
    if (selectedItems.size === cartItems.length) {
      clearSelected();
    } else {
      selectAll();
    }
  }, [selectedItems, cartItems, selectAll, clearSelected]);

  const handleDeleteAllSelected = useCallback(() => {
    if (selectedItems.size === 0) {
      showToast('Vui lòng chọn sản phẩm để xóa', 'error');
      return;
    }
    setConfirmDelete({ isOpen: true, itemId: 'all', count: selectedItems.size });
  }, [selectedItems, showToast]);

  const handleConfirmDeleteAll = useCallback(async () => {
    try {
      const ids = Array.from(selectedItems);
      await removeItems(ids);
      const deletedCount = ids.length;
      setConfirmDelete({ isOpen: false, itemId: null, count: 0 });
      showToast(`Đã xóa ${deletedCount} sản phẩm khỏi giỏ hàng`);
    } catch (err) {
      showToast(err.message || 'Không thể xóa sản phẩm', 'error');
    }
  }, [selectedItems, removeItems, showToast]);

  // ==================== Promo Code Logic ====================
  const handleApplyPromo = useCallback(async () => {
    if (!promoCode.trim()) {
      showToast('Vui lòng nhập mã khuyến mãi', 'error');
      return;
    }

    try {
      await applyPromo(promoCode.toUpperCase());
      setPromoCode('');
      showToast(`Áp dụng mã "${promoCode.toUpperCase()}" thành công`);
    } catch (err) {
      showToast(err.message || 'Mã khuyến mãi không hợp lệ', 'error');
    }
  }, [promoCode, applyPromo, showToast]);

  const handleRemovePromo = useCallback(() => {
    applyPromo(null);
    showToast('Xóa mã khuyến mãi thành công');
  }, [applyPromo, showToast]);

  // ==================== Address Form Handlers ====================
  const handleAddressChange = useCallback((field, value) => {
    setAddressData(prev => ({ ...prev, [field]: value }));
  }, []);

  // ==================== Validation & Checkout ====================
  const isAddressValid = addressData.recipient && addressData.phone && addressData.addressLine;
  const isCartEmpty = cartItems.length === 0;

  const handleCheckout = useCallback(async () => {
    if (selectedItems.size === 0) {
      showToast('Vui lòng chọn sản phẩm để thanh toán', 'error');
      return;
    }

    if (!isAddressValid) {
      showToast('Vui lòng điền đầy đủ thông tin địa chỉ giao hàng', 'error');
      setAddressExpanded(true);
      return;
    }

    try {
      const checkoutPayload = {
        items: cartItems.filter(i => selectedItems.has(i.productId)).map(i => ({
          productId: i.productId,
          qty: i.qty
        })),
        shippingAddress: {
          recipient: addressData.recipient,
          phone: addressData.phone,
          addressLine: addressData.addressLine,
          city: addressData.city
        },
        shippingOption,
        promoCode: appliedPromo?.code || null,
        subtotal,
        shippingFee,
        discount,
        total: grandTotal
      };

      const result = await checkout(checkoutPayload);
      const orderId = result.orderId || `ORD-${Date.now()}`;
      setSuccessOrder({ isOpen: true, orderId });
      showToast('Đặt hàng thành công!');
    } catch (err) {
      showToast(err.message || 'Không thể đặt hàng', 'error');
    }
  }, [selectedItems, isAddressValid, cartItems, addressData, shippingOption, appliedPromo, subtotal, shippingFee, discount, grandTotal, checkout, showToast]);

  const handleSuccessClose = () => {
    setSuccessOrder({ isOpen: false, orderId: null });
    // TODO: Redirect to home or order history page
    // window.location.href = '/orders';
  };

  // ==================== Loading & Error States ====================
  if (loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải giỏ hàng...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

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
                    onChange={handleToggleSelectAll}
                    className="w-5 h-5 rounded"
                    aria-label="Chọn tất cả sản phẩm"
                  />
                  <span className="font-medium text-gray-900">
                    Chọn tất cả ({selectedItems.size}/{cartItems.length})
                  </span>
                </label>
                {selectedItems.size > 0 && (
                  <button
                    onClick={handleDeleteAllSelected}
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
                  {cartItems.map(item => {
                    const itemId = item.productId;
                    const finalPrice = item.price - (item.discount || 0);
                    
                    return (
                      <motion.div
                        key={itemId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className={`bg-white rounded-lg shadow hover:shadow-md transition p-4 ${
                          selectedItems.has(itemId) ? 'ring-2 ring-green-500' : ''
                        }`}
                      >
                        <div className="flex gap-4">
                          {/* Checkbox Selection */}
                          <div className="flex items-start pt-1">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(itemId)}
                              onChange={() => toggleSelect(itemId)}
                              className="w-5 h-5 rounded cursor-pointer"
                              aria-label={`Chọn ${item.productName}`}
                            />
                          </div>

                          {/* Product Image */}
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-24 h-24 object-cover rounded-lg"
                          />

                          {/* Product Info */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-lg">{item.productName}</h3>
                            <div className="flex items-center gap-2 mt-2">
                              {item.discount > 0 ? (
                                <>
                                  <span className="text-gray-500 line-through text-sm">
                                    {item.price.toLocaleString('vi-VN')} VND
                                  </span>
                                  <span className="text-green-600 font-bold text-lg">
                                    {finalPrice.toLocaleString('vi-VN')} VND
                                  </span>
                                </>
                              ) : (
                                <span className="text-green-600 font-bold text-lg">
                                  {item.price.toLocaleString('vi-VN')} VND
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Quantity Controls & Delete */}
                          <div className="flex flex-col items-end justify-between">
                            {/* Quantity Buttons */}
                            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => handleUpdateQty(itemId, item.qty - 1)}
                                aria-label={`Giảm số lượng ${item.productName}`}
                                className="p-1 hover:bg-gray-200 rounded transition"
                              >
                                <Minus size={18} className="text-gray-700" />
                              </button>
                              <input
                                type="number"
                                min="1"
                                value={item.qty}
                                onChange={e => handleQtyInputChange(itemId, e.target.value)}
                                aria-label={`Số lượng ${item.productName}`}
                                className="w-12 text-center bg-transparent font-semibold focus:outline-none"
                              />
                              <button
                                onClick={() => handleUpdateQty(itemId, item.qty + 1)}
                                aria-label={`Tăng số lượng ${item.productName}`}
                                className="p-1 hover:bg-gray-200 rounded transition"
                              >
                                <Plus size={18} className="text-gray-700" />
                              </button>
                            </div>

                            {/* Delete Button */}
                            <button
                              onClick={() => setConfirmDelete({ isOpen: true, itemId, count: 0 })}
                              aria-label={`Xóa ${item.productName}`}
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
                            {(finalPrice * item.qty).toLocaleString('vi-VN')} VND
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
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
                        onChange={e => setShipping(e.target.value)}
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
                      onClick={handleRemovePromo}
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
                      onClick={handleApplyPromo}
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
                  disabled={isCartEmpty || selectedItems.size === 0 || loading}
                  className={`w-full mt-6 py-3 rounded-lg font-semibold transition ${
                    isCartEmpty || selectedItems.size === 0 || loading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {loading ? 'Đang xử lý...' : `Thanh toán (${selectedItems.size} sản phẩm)`}
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
        onConfirm={confirmDelete.itemId === 'all' ? handleConfirmDeleteAll : () => handleRemoveItem(confirmDelete.itemId)}
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