import React, { useState } from "react";
import axios from "axios";
import { request1 } from "../../../utils/request";
import { getCSRFTokenFromCookie } from "../../../Component/Token/getCSRFToken";
const access_token = getCSRFTokenFromCookie("access_token");

// Hàm xử lý gửi thanh toán
async function handlePaymentSubmit({ orderId, amount, orderDesc, bankCode }) {
  try {
    const response = await request1.post(
      "/vn/payment",
      {
        order_id: orderId,
        amount: amount,
        order_desc: orderDesc,
        bank_code: bankCode,
        language: "vn", // Cố định là Tiếng Việt
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );
    console.log("this is respone: ", response)
    if (response.data.payment_url) {
      window.location.href = response.data.payment_url; // Redirect to VNPAY
    }
  } catch (error) {
    console.error("Lỗi thanh toán: ", error);
  }
}

// Hàm tạo một orderId ngẫu nhiên
function generateOrderId() {
  return new Date().getTime().toString();
}

// Component chính PaymentForm
function PaymentForm({ totalPrice}) {
  // Các state quản lý form
  const [orderId, setOrderId] = useState(generateOrderId());
  const [amount] = useState(totalPrice); // Số tiền lấy từ `totalPrice`, không thay đổi
  const [orderDesc, setOrderDesc] = useState(
    `Thanh toán đơn hàng vào thời gian: ${new Date().toLocaleString()}`
  );
  const [bankCode, setBankCode] = useState("");
  // Hà m xử lý khi submit form
  const handleSubmit = (e) => {
    e.preventDefault(); // Ngừng hành động mặc định của form (tự động submit)
    
    // Lấy giá trị selectAddress từ localStorage
    const selectAddress = JSON.parse(localStorage.getItem("selectAddress"));

    // Kiểm tra nếu selectAddress chưa được thiết lập
    if (!selectAddress) {
      alert("Bạn chưa thiết lập địa chỉ giao hàng");
      return;
    }
    e.preventDefault();
    handlePaymentSubmit({
      orderType: "billpayment", // Cố định loại hóa đơn là "Hóa đơn mua hàng"
      orderId,
      amount,
      orderDesc,
      bankCode,
    });
  };

  return (
    <div className="bg-white p-5 shadow-lg rounded-md">
      <h3 className="text-xl font-semibold text-primary mb-5">Thanh Toán</h3>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Hiển thị mã hóa đơn */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700">Mã hóa đơn thanh toán</label>
          <input
            type="text"
            className="form-control w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            readOnly
          />
        </div>
  
        {/* Hiển thị số tiền */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700">Số tiền</label>
          <input
            type="number"
            className="form-control w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={amount}
            readOnly
          />
        </div>
  
        {/* Nội dung thanh toán */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700">Nội dung thanh toán</label>
          <textarea
            className="form-control w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            value={orderDesc}
            onChange={(e) => setOrderDesc(e.target.value)}
          ></textarea>
        </div>
  
        {/* Ngân hàng */}
        <div className="form-group">
          <label className="block text-sm font-semibold text-gray-700">Ngân hàng</label>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            className="form-control w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Không chọn</option>
            <option value="NCB">Ngân hàng NCB</option>
            <option value="AGRIBANK">Ngân hàng Agribank</option>
            <option value="SCB">Ngân hàng SCB</option>
            <option value="VIETCOMBANK">Ngân hàng Vietcombank</option>
            {/* Thêm các ngân hàng khác tương tự */}
          </select>
        </div>
  
        {/* Nút thanh toán */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="btn bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Thanh toán
          </button>
        </div>
      </form>
    </div>
  );
  
}

export default PaymentForm;
