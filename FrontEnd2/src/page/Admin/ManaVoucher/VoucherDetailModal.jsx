import React from "react";
import { FaTimes, FaCalendar, FaPercent, FaTag, FaCoins, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const VoucherDetailModal = ({ voucher, onClose }) => {
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "Không giới hạn";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format currency
  const formatCurrency = (value) => {
    if (!value) return "0";
    return new Intl.NumberFormat("vi-VN").format(value);
  };

  // Get discount display
  const getDiscountDisplay = () => {
    if (voucher.discountType === "PERCENTAGE") {
      return `${voucher.discountValue}%`;
    }
    return `${formatCurrency(voucher.discountValue)} VNĐ`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary to-primary/80">
          <h2 className="text-xl font-bold text-white">Chi tiết Voucher</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Voucher Preview Card */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg p-6 text-white mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold mb-2">{voucher.title}</h3>
                <div className="flex items-center gap-2 mb-4">
                  <FaTag />
                  <span className="font-mono text-lg bg-white/20 px-3 py-1 rounded">
                    {voucher.code || "Không có mã"}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{getDiscountDisplay()}</div>
                {voucher.discountType === "PERCENTAGE" && voucher.maxDiscountAmount && (
                  <div className="text-sm opacity-80">
                    Tối đa: {formatCurrency(voucher.maxDiscountAmount)} VNĐ
                  </div>
                )}
              </div>
            </div>
            {voucher.description && (
              <p className="text-white/90 mt-2">{voucher.description}</p>
            )}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaPercent className="text-primary" />
                Thông tin giảm giá
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Loại giảm giá:</span>
                  <span className="font-medium">
                    {voucher.discountType === "PERCENTAGE" ? "Phần trăm" : "Số tiền cố định"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá trị giảm:</span>
                  <span className="font-medium text-green-600">{getDiscountDisplay()}</span>
                </div>
                {voucher.maxDiscountAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giảm tối đa:</span>
                    <span className="font-medium">{formatCurrency(voucher.maxDiscountAmount)} VNĐ</span>
                  </div>
                )}
                {voucher.minOrderValue && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đơn tối thiểu:</span>
                    <span className="font-medium">{formatCurrency(voucher.minOrderValue)} VNĐ</span>
                  </div>
                )}
              </div>
            </div>

            {/* Points Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaCoins className="text-orange-500" />
                Đổi điểm
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Điểm cần đổi:</span>
                  <span className="font-medium text-orange-600">
                    {voucher.pointsRequired || 0} điểm
                  </span>
                </div>
              </div>
            </div>

            {/* Time Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FaCalendar className="text-blue-500" />
                Thời hạn
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bắt đầu:</span>
                  <span className="font-medium">{formatDate(voucher.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kết thúc:</span>
                  <span className="font-medium">{formatDate(voucher.endDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạo lúc:</span>
                  <span className="font-medium">{formatDate(voucher.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Usage Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Thống kê sử dụng</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã sử dụng:</span>
                  <span className="font-medium">{voucher.usedCount || 0} lần</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giới hạn:</span>
                  <span className="font-medium">
                    {voucher.usageLimit ? `${voucher.usageLimit} lần` : "Không giới hạn"}
                  </span>
                </div>
                {voucher.usageLimit && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Còn lại:</span>
                    <span className="font-medium text-green-600">
                      {voucher.usageLimit - (voucher.usedCount || 0)} lần
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-6 flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Trạng thái:</span>
              {voucher.isActive ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <FaCheckCircle /> Đang hoạt động
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500 font-medium">
                  <FaTimesCircle /> Vô hiệu hóa
                </span>
              )}
            </div>
            <div className="w-px h-6 bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Hiệu lực:</span>
              {voucher.isValid ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <FaCheckCircle /> Còn hiệu lực
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500 font-medium">
                  <FaTimesCircle /> Hết hiệu lực
                </span>
              )}
            </div>
          </div>

          {/* Applicable Categories */}
          {voucher.applicableCategories && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">Danh mục áp dụng</h4>
              <p className="text-blue-600">{voucher.applicableCategories}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherDetailModal;
