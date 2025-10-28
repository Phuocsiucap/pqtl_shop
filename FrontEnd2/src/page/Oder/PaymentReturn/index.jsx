import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";

const access_token = getCSRFTokenFromCookie("access_token");

function PaymentReturn({setShowPaymentReturn}) {
  const paymentData = JSON.parse(localStorage.getItem("payment"));
  
  const [error, setError] = useState(null); 
  const message = localStorage.getItem("message");
  const [countdown, setCountdown] = useState(15);
  const navigate = useNavigate();

  


  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleClose();
    }
  }, [countdown]);

  const handleClose = () => {
    setShowPaymentReturn(false);
    localStorage.removeItem("orderData");
    localStorage.removeItem("selectAddress");
    localStorage.removeItem("payment");
    localStorage.removeItem("message");
    localStorage.removeItem("isPaymentDataFetched");
    navigate(`/buildDetail/${paymentData.order_id}`);
  };

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-5 shadow-lg max-w-md w-full">
          <h1 className="text-red-500 font-bold text-lg">Lỗi</h1>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-5 shadow-lg max-w-md w-full">
          <h1 className="text-primary font-bold text-lg">Đang tải...</h1>
          <p className="text-gray-700">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg max-w-lg w-full relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 focus:outline-none"
          onClick={handleClose}
        >
          ✕
        </button>
        <h1 className="text-xl font-semibold text-primary mb-4">Thông tin thanh toán</h1>
        <ul className="space-y-2 text-gray-700">
          <li>
            <strong>Mã đơn hàng:</strong> {paymentData.order_id}
          </li>
          <li>
            <strong>Số tiền:</strong> {paymentData.amount} VND
          </li>
          <li>
            <strong>Mô tả đơn hàng:</strong> {paymentData.order_desc}
          </li>
          <li>
            <strong>Số giao dịch:</strong> {paymentData.transaction_no}
          </li>
          <li>
            <strong>Ngày thanh toán:</strong> {paymentData.pay_date}
          </li>
          <li>
            <strong>Mã ngân hàng:</strong> {paymentData.bank_code}
          </li>
          <li>
            <strong>Loại thẻ:</strong> {paymentData.card_type}
          </li>
          <li>
            <strong>Mã phản hồi:</strong> {paymentData.response_code}
          </li>
          <li>
            <strong>Message:</strong> {message}
          </li>
        </ul>
        <p className="text-center text-gray-600 mt-4">
          Tự động đóng trong <span className="font-semibold">{countdown}</span> giây...
        </p>
      </div>
    </div>
  );
}

export default PaymentReturn;
