import React from "react";
import { PricetoString } from "../../../Component/Translate_Price/index.jsx";
// Component xử lý bảng đơn hàng
const OrderTable = ({ orders, onViewDetails, onConfirmOrder }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return "text-green-500";
      case "Đã xác nhận":
        return "text-green-500";
      case "Đang giao":
        return "text-blue-500";
      case "Đã giao":
        return "text-blue-500";
      case "Đã hủy":
        return "text-red-500";
      default:
        return "text-gray-500"; // Màu mặc định nếu không khớp trạng thái
    }
  };

  return (
    <table className="min-w-full table-auto border-collapse font-medium text-center">
      <thead>
        <tr>
          <th className="border px-4 py-2">Mã đơn hàng</th>
          <th className="border px-4 py-2">Tổng tiền</th>
          <th className="border px-4 py-2">Ngày đặt</th>
          <th className="border px-4 py-2">Trạng thái</th>
          <th className="border px-4 py-2">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order, index) => (
          <tr key={index}>
            <td className="border px-4 py-2 text-primary font-semibold">
              #{order.order_id}
            </td>
            {order.total_amount && (
              <td className="border px-4 py-2 text-red-500 font-semibold">
                {PricetoString(order.total_amount)} VND
              </td>
            )}
            <td className="border px-4 py-2">{order.purchase_date}</td>
            <td
              className={`border px-4 py-2 ${getStatusColor(
                order.shipping_status
              )} font-semibold`}
            >
              {order.shipping_status}
            </td>
            <td className="border px-4 py-2">
              <button
                onClick={() => onViewDetails(order)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md mr-2"
              >
                Xem chi tiết
              </button>
              {(order.shipping_status === "Chờ xác nhận" ||
                order.shipping_status === "Đã xác nhận" ||
                order.shipping_status === "Đang giao") && (
                <button
                  onClick={() => onConfirmOrder(order)}
                  className="bg-green-500 text-white px-4 py-2 rounded-md"
                >
                  Cập nhật
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
