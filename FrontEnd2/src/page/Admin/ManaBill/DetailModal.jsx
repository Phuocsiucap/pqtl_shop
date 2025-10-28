// DetailModal Component
import { request1,request } from "../../../utils/request";
import { useNavigate, useLocation } from "react-router-dom";

const DetailModal = () => {
  
  const navigate = useNavigate();
  const location = useLocation();
  const order = location.state?.order;
  console.log("1->>>>>>", order);
  if (!order) {
    return (
      <div className="container mx-auto p-6">s
        <h2 className="text-2xl font-semibold text-red-500">
          Không có dữ liệu đơn hàng!
        </h2>
        <button
          onClick={() => navigate(-1)}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mt-4"
        >
          Quay lại
        </button>
      </div>
    );
  }

  // Tính tổng tiền chưa giảm giá và giảm giá
  const discountPercentage =
    order.voucher && order.voucher.length > 0
      ? order.voucher[0].discount_percentage
      : 0;
  const totalAmountBeforeDiscount =(order.order.total_amount / (100 - discountPercentage)) * 100;
  const discountAmount = (totalAmountBeforeDiscount * discountPercentage) / 100;
  const finalAmount = totalAmountBeforeDiscount - discountAmount;

  return (
    <div className="container mx-auto p-6 font-medium">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">
        Chi tiết đơn hàng #{order.order.order_id}
      </h2>

      {/* Thông tin đơn hàng */}
      <div className="bg-blue-50 p-4 rounded-md shadow-md mb-8">
        <p className="text-lg text-primary">
          <strong>Thời gian đặt hàng:</strong> {order.order.purchase_date}
        </p>
        <p className="text-lg">
          <strong>Địa chỉ giao hàng:</strong>{" "}
          {order.order.shipping_address.split(".").map((item, index) => (
            <span key={index} className="block">
              {item}
            </span>
          ))}
        </p>
        <p className="text-lg text-red-500">
          <strong>Tổng tiền: </strong>
          {order.order.total_amount.toLocaleString("vi-VN")} đ
        </p>
        <p className="text-lg">
          <strong>Trạng thái vận chuyển:</strong>{" "}
          <span
            className={`${
              order.order.shipping_status === "Chờ xác nhận"
                ? "text-green-500"
                : order.order.shipping_status === "Đã xác nhận"
                ? "text-green-500"
                : order.order.shipping_status === "Đã hủy"
                ? "text-red-500"
                : order.order.shipping_status === "Đang giao"
                ?"text-blue-500"
                : order.order.shipping_status === "Đã giao"
                ?"text-blue-500"
                : "text-gray-600"
            }`}
          >
            {order.order.shipping_status}
          </span>
        </p>
      </div>

      {/* Bảng sản phẩm */}
      <h3 className="text-2xl font-semibold text-gray-700 mb-4">
        Sản phẩm đã mua:
      </h3>
      <table className="table-auto w-full border-collapse border border-gray-300 shadow-lg rounded-xl">
        <thead>
          <tr className="bg-blue-200 text-blue-800">
            <th className="border border-gray-300 px-4 py-3">Sản phẩm</th>
            <th className="border border-gray-300 px-4 py-3">Số lượng</th>
            <th className="border border-gray-300 px-4 py-3">Giá</th>
            <th className="border border-gray-300 px-4 py-3">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.good.map((product, index) => {
            const order_good = order.order_good.find(
              (item) => item.good === product.id
            );
            const thanhTien = parseFloat(product.price) * order_good.quantity;
            return (
              <tr
                key={index}
                className={`text-center ${
                  index % 2 === 0 ? "bg-white" : "bg-blue-50"
                }`}
              >
                <td className="border border-gray-300 px-4 py-2 flex flex-col items-center gap-2 justify-center">
                  <img
                    src={`${request}${product.image}`}
                    alt={product.goodName}
                    className="w-[200px] h-[200px] object-cover rounded-md"
                  />
                  <span className="text-center">{product.goodName}</span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {order_good.quantity}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  {parseFloat(product.price).toLocaleString("vi-VN")} đ
                </td>
                <td className="border border-gray-300 px-4 py-2 font-bold text-red-500">
                  {thanhTien.toLocaleString("vi-VN")} đ
                </td>
              </tr>
            );
          })}

          {/* Dòng tổng tiền, giảm giá và tổng tiền cuối cùng */}
          <tr className="bg-white font-medium text-lg">
            <td colSpan={3} className="text-left px-4 py-3">
              Tổng tiền sản phẩm
            </td>
            <td className="px-4 py-3 text-center text-red-500">
              {totalAmountBeforeDiscount.toLocaleString("vi-VN")} đ
            </td>
          </tr>
          {order.voucher && order.voucher.length > 0 && (
            <tr className="bg-white font-medium text-lg">
              <td colSpan={3} className="text-left px-4 py-3 text-primary">
                Voucher {order.voucher[0].title} :
              </td>
              <td className="px-4 py-3 text-center">
                - {discountAmount.toLocaleString("vi-VN")} đ
              </td>
            </tr>
          )}
          <tr className="bg-white font-medium text-lg">
            <td colSpan={3} className="text-left px-4 py-3">
              Tổng tiền cần thanh toán:
            </td>
            <td className="px-4 py-3 text-red-600 text-center font-bold">
              {finalAmount.toLocaleString("vi-VN")} đ
            </td>
          </tr>
        </tbody>
      </table>

      <button
        onClick={() => navigate(-1)}
        className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mt-6"
      >
        Quay lại
      </button>
    </div>
  );
};

export default DetailModal;
