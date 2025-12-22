import React from "react";
import { PricetoString } from "../../../Component/Translate_Price/index.jsx";
import { FaTimes } from "react-icons/fa";

// Component xử lý bảng đơn hàng
const OrderTable = ({ orders, onViewDetails, onConfirmOrder, onCancelOrder }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xác nhận":
        return "text-yellow-500";
      case "Đã xác nhận":
        return "text-green-500";
      case "Đang giao":
        return "text-blue-500";
      case "Đã giao":
        return "text-purple-500";
      case "Hủy":
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
              #{order.id}
            </td>
            {order.finalAmount && (
              <td className="border px-4 py-2 text-red-500 font-semibold">
                {PricetoString(order.finalAmount)} VND
              </td>
            )}
            <td className="border px-4 py-2">
              {order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
            </td>
            <td
              className={`border px-4 py-2 ${getStatusColor(
                order.shipping_status || "Chờ xác nhận"
              )} font-semibold`}
            >
              {order.shipping_status || "Chờ xác nhận"}
            </td>
            <td className="border px-4 py-2">
              <div className="flex gap-2 justify-center flex-wrap">
                <button
                  onClick={() => onViewDetails(order)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Xem chi tiết
                </button>
                {order.shipping_status !== "Đã giao" && order.shipping_status !== "Hủy" && (
                  <button
                    onClick={() => onConfirmOrder(order)}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                  >
                    Cập nhật
                  </button>
                )}
                {order.shipping_status !== "Hủy" && order.shipping_status !== "Đã giao" && (
                  <button
                    onClick={() => onCancelOrder(order)}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-1"
                    title="Hủy đơn hàng"
                  >
                    <FaTimes /> Hủy
                  </button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default OrderTable;
