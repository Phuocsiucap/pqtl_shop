import React, { useState, useEffect } from "react";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
import { FaCreditCard, FaUniversity, FaSpinner, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

// Danh sách ngân hàng phổ biến Việt Nam
const BANK_LIST = [
  { code: "", name: "Chọn ngân hàng (hoặc để VNPAY tự chọn)", logo: null },
  { code: "NCB", name: "Ngân hàng NCB", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/NCB.png" },
  { code: "VIETCOMBANK", name: "Vietcombank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/VCB.png" },
  { code: "VIETINBANK", name: "VietinBank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/CTG.png" },
  { code: "BIDV", name: "BIDV", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/BIDV.png" },
  { code: "AGRIBANK", name: "Agribank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/VBA.png" },
  { code: "SACOMBANK", name: "Sacombank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/STB.png" },
  { code: "TECHCOMBANK", name: "Techcombank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/TCB.png" },
  { code: "MBBANK", name: "MB Bank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/MB.png" },
  { code: "ACB", name: "ACB", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/ACB.png" },
  { code: "VPBANK", name: "VPBank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/VPB.png" },
  { code: "TPBANK", name: "TPBank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/TPB.png" },
  { code: "HDBANK", name: "HDBank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/HDB.png" },
  { code: "SCB", name: "SCB", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/SCB.png" },
  { code: "OCB", name: "OCB", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/OCB.png" },
  { code: "SHB", name: "SHB", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/SHB.png" },
  { code: "EXIMBANK", name: "Eximbank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/EIB.png" },
  { code: "MSBANK", name: "MSB", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/MSB.png" },
  { code: "NAMABANK", name: "Nam A Bank", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/NAB.png" },
  { code: "VNMART", name: "Ví VnMart", logo: null },
  { code: "VNPAYQR", name: "VNPAY QR", logo: "https://sandbox.vnpayment.vn/paymentv2/images/bank/VNPAYQR.png" },
];

// Hàm format số tiền
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm tạo mã đơn hàng
function generateOrderId() {
  return `ORD${Date.now()}`;
}

// Component chính PaymentForm
function PaymentForm({ totalPrice, orderId: existingOrderId, onPaymentStart, onPaymentError }) {
  const [orderId, setOrderId] = useState(existingOrderId || generateOrderId());
  const [amount] = useState(totalPrice);
  const [orderDesc, setOrderDesc] = useState(
    `Thanh toán đơn hàng #${existingOrderId || orderId} - ${new Date().toLocaleString('vi-VN')}`
  );
  const [bankCode, setBankCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cập nhật orderId khi prop thay đổi
  useEffect(() => {
    if (existingOrderId) {
      setOrderId(existingOrderId);
      setOrderDesc(`Thanh toán đơn hàng #${existingOrderId} - ${new Date().toLocaleString('vi-VN')}`);
    }
  }, [existingOrderId]);

  // Hàm xử lý thanh toán
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra địa chỉ giao hàng
    const selectAddress = JSON.parse(localStorage.getItem("selectAddress"));
    if (!selectAddress) {
      setError("Bạn chưa thiết lập địa chỉ giao hàng");
      return;
    }

    // Kiểm tra số tiền
    if (!amount || amount <= 0) {
      setError("Số tiền thanh toán không hợp lệ");
      return;
    }

    setIsLoading(true);
    setError(null);

    // Callback khi bắt đầu thanh toán
    if (onPaymentStart) {
      onPaymentStart();
    }

    try {
      const access_token = getCSRFTokenFromCookie("access_token");
      
      const response = await request1.post(
        "/vn/payment",
        {
          order_id: orderId,
          amount: Math.round(amount), // Đảm bảo là số nguyên
          order_desc: orderDesc,
          bank_code: bankCode,
          language: "vn",
        },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("VNPAY Response:", response.data);

      if (response.data.code === "00" && response.data.payment_url) {
        // Lưu thông tin thanh toán vào localStorage để xử lý khi quay lại
        localStorage.setItem("pendingPayment", JSON.stringify({
          orderId: orderId,
          amount: amount,
          orderDesc: orderDesc,
          timestamp: Date.now()
        }));

        // Redirect đến VNPAY
        window.location.href = response.data.payment_url;
      } else {
        setError(response.data.message || "Không thể tạo URL thanh toán");
        if (onPaymentError) {
          onPaymentError(response.data.message);
        }
      }
    } catch (err) {
      console.error("Lỗi thanh toán:", err);
      const errorMsg = err.response?.data?.message || "Đã xảy ra lỗi khi kết nối đến cổng thanh toán";
      setError(errorMsg);
      if (onPaymentError) {
        onPaymentError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-lg rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b">
        <div className="bg-blue-100 p-3 rounded-full">
          <FaCreditCard className="text-blue-600 text-xl" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-800">Thanh toán qua VNPAY</h3>
          <p className="text-sm text-gray-500">Thanh toán an toàn qua cổng VNPAY</p>
        </div>
        <img 
          src="https://sandbox.vnpayment.vn/paymentv2/images/icons/logo-primary.svg" 
          alt="VNPAY" 
          className="ml-auto h-8"
          onError={(e) => e.target.style.display = 'none'}
        />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-700 font-medium">Lỗi thanh toán</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handlePaymentSubmit} className="space-y-5">
        {/* Mã đơn hàng */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mã đơn hàng
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono"
            value={orderId}
            readOnly
          />
        </div>

        {/* Số tiền */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Số tiền thanh toán
          </label>
          <div className="relative">
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-xl font-bold text-green-600"
              value={formatCurrency(amount)}
              readOnly
            />
            <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" />
          </div>
        </div>

        {/* Nội dung thanh toán */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Nội dung thanh toán
          </label>
          <textarea
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            value={orderDesc}
            onChange={(e) => setOrderDesc(e.target.value)}
            rows={2}
            maxLength={255}
          />
          <p className="text-xs text-gray-400 mt-1">{orderDesc.length}/255 ký tự</p>
        </div>

        {/* Chọn ngân hàng */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            <FaUniversity className="inline mr-2" />
            Chọn ngân hàng (tùy chọn)
          </label>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            {BANK_LIST.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Để trống nếu muốn chọn ngân hàng trên trang VNPAY
          </p>
        </div>

        {/* Thông tin bảo mật */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Giao dịch được bảo mật bởi VNPAY. Thông tin thẻ của bạn sẽ không được lưu trữ.
          </p>
        </div>

        {/* Nút thanh toán */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
            isLoading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              Đang xử lý...
            </>
          ) : (
            <>
              <FaCreditCard />
              Thanh toán {formatCurrency(amount)}
            </>
          )}
        </button>
      </form>

      {/* Footer - Các phương thức thanh toán được hỗ trợ */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-xs text-gray-500 text-center mb-3">Hỗ trợ thanh toán qua</p>
        <div className="flex justify-center items-center gap-3 flex-wrap">
          {["NCB", "VCB", "CTG", "BIDV", "VBA", "TCB", "MB"].map((code) => (
            <img 
              key={code}
              src={`https://sandbox.vnpayment.vn/paymentv2/images/bank/${code}.png`}
              alt={code}
              className="h-6 opacity-70 hover:opacity-100 transition-opacity"
              onError={(e) => e.target.style.display = 'none'}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default PaymentForm;
