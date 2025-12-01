import React, { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";
import { request1 } from "../../../utils/request";

const VoucherEditModal = ({ voucher, onClose, onSuccess, accessToken }) => {
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    maxDiscountAmount: "",
    minOrderValue: "",
    pointsRequired: "",
    usageLimit: "",
    startDate: "",
    endDate: "",
    isActive: true,
    applicableCategories: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Format datetime for input
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Format: YYYY-MM-DDTHH:mm
    return date.toISOString().slice(0, 16);
  };

  // Load voucher data
  useEffect(() => {
    if (voucher) {
      setFormData({
        title: voucher.title || "",
        code: voucher.code || "",
        description: voucher.description || "",
        discountType: voucher.discountType || "PERCENTAGE",
        discountValue: voucher.discountValue || "",
        maxDiscountAmount: voucher.maxDiscountAmount || "",
        minOrderValue: voucher.minOrderValue || "",
        pointsRequired: voucher.pointsRequired || "",
        usageLimit: voucher.usageLimit || "",
        startDate: formatDateTimeForInput(voucher.startDate),
        endDate: formatDateTimeForInput(voucher.endDate),
        isActive: voucher.isActive !== false,
        applicableCategories: voucher.applicableCategories || "",
      });
    }
  }, [voucher]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tên voucher là bắt buộc";
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = "Giá trị giảm phải lớn hơn 0";
    }

    if (formData.discountType === "PERCENTAGE" && parseFloat(formData.discountValue) > 100) {
      newErrors.discountValue = "Phần trăm giảm không thể lớn hơn 100%";
    }

    if (formData.pointsRequired && parseInt(formData.pointsRequired) < 0) {
      newErrors.pointsRequired = "Điểm đổi không thể âm";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        code: formData.code.trim().toUpperCase() || null,
        description: formData.description.trim() || null,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
        pointsRequired: formData.pointsRequired ? parseInt(formData.pointsRequired) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        isActive: formData.isActive,
        applicableCategories: formData.applicableCategories.trim() || null,
      };

      await request1.put(`v1/admin/vouchers/${voucher.id}/`, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      onSuccess();
    } catch (error) {
      console.log("Lỗi khi cập nhật voucher:", error);
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else {
        setErrors({ submit: "Có lỗi xảy ra khi cập nhật voucher" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-yellow-500">
          <h2 className="text-xl font-bold text-white">Chỉnh sửa Voucher</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {errors.submit}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên Voucher <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Giảm 10% toàn ngành hàng"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã Voucher
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="VD: GIAM10"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase"
              />
              <p className="text-gray-500 text-xs mt-1">Mã sẽ tự động chuyển thành chữ hoa</p>
            </div>

            {/* Points Required */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Điểm cần đổi
              </label>
              <input
                type="number"
                name="pointsRequired"
                value={formData.pointsRequired}
                onChange={handleChange}
                min="0"
                placeholder="VD: 100"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.pointsRequired ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.pointsRequired && (
                <p className="text-red-500 text-sm mt-1">{errors.pointsRequired}</p>
              )}
            </div>

            {/* Discount Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại giảm giá <span className="text-red-500">*</span>
              </label>
              <select
                name="discountType"
                value={formData.discountType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIXED_AMOUNT">Số tiền cố định (VNĐ)</option>
              </select>
            </div>

            {/* Discount Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giá trị giảm <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="discountValue"
                value={formData.discountValue}
                onChange={handleChange}
                min="0"
                step={formData.discountType === "PERCENTAGE" ? "1" : "1000"}
                placeholder={formData.discountType === "PERCENTAGE" ? "VD: 10" : "VD: 50000"}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.discountValue ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.discountValue && (
                <p className="text-red-500 text-sm mt-1">{errors.discountValue}</p>
              )}
            </div>

            {/* Max Discount Amount (only for percentage) */}
            {formData.discountType === "PERCENTAGE" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giảm tối đa (VNĐ)
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  placeholder="VD: 100000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            )}

            {/* Min Order Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đơn hàng tối thiểu (VNĐ)
              </label>
              <input
                type="number"
                name="minOrderValue"
                value={formData.minOrderValue}
                onChange={handleChange}
                min="0"
                step="1000"
                placeholder="VD: 500000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới hạn sử dụng
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleChange}
                min="0"
                placeholder="Để trống = không giới hạn"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày bắt đầu
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày kết thúc
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                  errors.endDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>

            {/* Applicable Categories */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục áp dụng
              </label>
              <input
                type="text"
                name="applicableCategories"
                value={formData.applicableCategories}
                onChange={handleChange}
                placeholder="VD: Trái cây, Rau củ (để trống = tất cả)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mô tả
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Mô tả chi tiết về voucher..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
            </div>

            {/* Is Active */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-5 h-5 text-yellow-500 rounded focus:ring-yellow-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Kích hoạt voucher
                </span>
              </label>
            </div>
          </div>

          {/* Usage Stats */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Đã sử dụng:</strong> {voucher?.usedCount || 0} lần
              {voucher?.usageLimit && ` / ${voucher.usageLimit} lần`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSave />
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherEditModal;
