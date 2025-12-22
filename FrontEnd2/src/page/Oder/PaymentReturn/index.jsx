import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { request1 } from "../../../utils/request";
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaCreditCard, FaReceipt, FaCalendarAlt, FaUniversity } from "react-icons/fa";

// Hàm format tiền
function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function PaymentReturn({ setShowPaymentReturn }) {
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();

  // Parse URL params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.toString()) {
      verifyPayment(location.search);
    } else {
      // Fallback for manual navigation or localStorage logic if needed (optional)
      const cached = localStorage.getItem("payment");
      if (cached) {
        setPaymentResult(JSON.parse(cached));
        setLoading(false);
      } else {
        setLoading(false);
        // navigate('/'); // Redirect if no data
      }
    }
  }, [location.search]);

  const verifyPayment = async (searchInfo) => {
    try {
      const response = await request1.get(`vn/payment-return${searchInfo}`);
      setPaymentResult(response.data);
    } catch (error) {
      console.error("Payment verification failed:", error);
      setPaymentResult({
        code: "99",
        message: "Lỗi xác thực thanh toán với hệ thống: " + (error.response?.data?.message || error.message),
        amount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!loading && countdown === 0) {
      handleClose();
    }
  }, [loading, countdown]);

  const handleClose = () => {
    console.log("Payment result:", paymentResult);
    console.log("Navigating with order_id:", paymentResult?.order_id, "code:", paymentResult?.code);

    if (setShowPaymentReturn) setShowPaymentReturn(false);

    // Clear cart/order temporary data
    localStorage.removeItem("orderData");
    localStorage.removeItem("selectAddress");
    localStorage.removeItem("payment");
    localStorage.removeItem("message");
    localStorage.removeItem("isPaymentDataFetched");
    localStorage.removeItem("pendingPayment");

    if (paymentResult?.order_id) {
      navigate(`/order-detail/${paymentResult.order_id}`);
    } else {
      navigate('/profile/orders'); // Redirect to orders page if no order_id
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Đang xác thực giao dịch...</h1>
          <p className="text-gray-500">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // If no payment result found
  if (!paymentResult) {
    return null;
  }

  const isSuccess = paymentResult.code === "00";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-center ${isSuccess ? 'bg-gradient-to-r from-green-400 to-green-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4">
            {isSuccess ? (
              <FaCheckCircle className="text-5xl text-white" />
            ) : (
              <FaTimesCircle className="text-5xl text-white" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-white/90">
            {paymentResult.message || (isSuccess ? 'Cảm ơn bạn đã thanh toán' : 'Giao dịch không thành công')}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Số tiền */}
          <div className="text-center py-4 border-b">
            <p className="text-sm text-gray-500 mb-1">Số tiền thanh toán</p>
            <p className={`text-3xl font-bold ${isSuccess ? 'text-green-600' : 'text-gray-600'}`}>
              {formatCurrency(paymentResult.amount || 0)}
            </p>
          </div>

          {/* Chi tiết giao dịch */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FaReceipt className="text-gray-400" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Mã đơn hàng</p>
                <p className="font-semibold text-gray-800">{paymentResult.order_id || 'N/A'}</p>
              </div>
            </div>

            {paymentResult.transaction_no && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaCreditCard className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Số giao dịch VNPAY</p>
                  <p className="font-semibold text-gray-800">{paymentResult.transaction_no}</p>
                </div>
              </div>
            )}

            {paymentResult.bank_code && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaUniversity className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Ngân hàng</p>
                  <p className="font-semibold text-gray-800">
                    {paymentResult.bank_code} {paymentResult.card_type && `- ${paymentResult.card_type}`}
                  </p>
                </div>
              </div>
            )}

            {paymentResult.pay_date && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FaCalendarAlt className="text-gray-400" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Thời gian thanh toán</p>
                  <p className="font-semibold text-gray-800">{paymentResult.pay_date}</p>
                </div>
              </div>
            )}

            {paymentResult.order_desc && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Nội dung</p>
                <p className="text-sm text-gray-700">{paymentResult.order_desc}</p>
              </div>
            )}
          </div>

          {/* Mã phản hồi (chỉ hiển thị nếu thất bại) */}
          {!isSuccess && paymentResult.response_code && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-xs text-red-500 mb-1">Mã lỗi: {paymentResult.response_code}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">
              Tự động chuyển hướng sau {countdown} giây
            </span>
            <div className="w-16 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-1000 ease-linear"
                style={{ width: `${(countdown / 30) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleClose}
            className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${isSuccess
              ? 'bg-green-500 hover:bg-green-600'
              : 'bg-gray-500 hover:bg-gray-600'
              }`}
          >
            {isSuccess ? 'Xem chi tiết đơn hàng' : 'Đóng'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentReturn;
